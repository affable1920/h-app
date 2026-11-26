import logging
import secrets
from typing import NamedTuple, Tuple
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    AuthorizationError,
    ConflictError
)

from app.schemas.enums import UserRoleV2, VerificationTokenPurpose

from app.database.models import VerificationToken
from app.features.auth import security


logger = logging.getLogger(__name__)

TokenPair = Tuple[str, VerificationToken]

TTL = {
    VerificationTokenPurpose.EMAIL_VERIFICATION: timedelta(hours=3),
    VerificationTokenPurpose.PASSWORD_RESET: timedelta(minutes=15)
}


class ClaimedToken(NamedTuple):
    user_id: UUID
    role: UserRoleV2


class VerificationService:
    @staticmethod
    def _build_link(
        raw: str,
        purpose: VerificationTokenPurpose
    ) -> str:
        base = (
            settings.backend_url if (
                purpose is VerificationTokenPurpose.EMAIL_VERIFICATION
            ) else settings.frontend_url
        )

        path = (
            "/auth/verify-email" if (
                purpose is VerificationTokenPurpose.EMAIL_VERIFICATION
            )
            else "/auth/reset-password"
        )

        return f"{base}{path}?token={raw}"

    @staticmethod
    def create_token_pair(
        user_id: UUID,
        user_role: UserRoleV2,
        purpose: VerificationTokenPurpose,
    ) -> TokenPair:
        raw_token = secrets.token_urlsafe(32)
        ttl = TTL[purpose]

        record = VerificationToken(
            user_id=user_id,
            user_role=user_role,
            token_hash=security.hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + ttl,
            purpose=purpose
        )

        return raw_token, record

    @staticmethod
    async def find_verification_token(
        token: str,
        session: AsyncSession,
        purpose: VerificationTokenPurpose,
    ) -> VerificationToken | None:
        """
        Must be passed the raw token value for which to get a database record
        """

        stmt = (
            select(VerificationToken)
            .where(
                (
                    VerificationToken.token_hash
                    == security.hash_token(token)
                ),
                VerificationToken.purpose == purpose,
            )
            .with_for_update()
        )

        return await session.scalar(stmt)

    @staticmethod
    async def check_cooldown(
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2,
        purpose: VerificationTokenPurpose
    ) -> None:
        # get last created token
        stmt = (
            select(VerificationToken.created_at)
            .where(
                VerificationToken.user_id == user_id,
                VerificationToken.user_role == role,
                VerificationToken.purpose == purpose,
                VerificationToken.used_at.is_(None),
                (
                    VerificationToken.expires_at
                    > datetime.now(timezone.utc)
                )
            )
            .order_by(VerificationToken.created_at.desc())
            .limit(1)
        )

        last_created = await session.scalar(stmt)

        if last_created is None:
            # a rare case, return early
            return

        if ((datetime.now(timezone.utc) - last_created) < TTL[purpose]):
            raise ConflictError(
                message="Please wait for 15 seconds before requesting another mail .."
            )

    @staticmethod
    async def delete_unused(
        user_id: UUID,
        role: UserRoleV2,
        purpose: VerificationTokenPurpose,
        session: AsyncSession,
    ) -> None:
        stmt = (
            delete(VerificationToken)
            .where(
                VerificationToken.user_id == user_id,
                VerificationToken.user_role == role,
                VerificationToken.purpose == purpose,
                VerificationToken.used_at.is_(None),
                VerificationToken.expires_at > datetime.now(timezone.utc)
            )
        )

        await session.execute(stmt)

    @classmethod
    async def issue(
        cls,
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2,
        purpose: VerificationTokenPurpose
    ):
        await cls.check_cooldown(session, user_id, role, purpose)
        await cls.delete_unused(user_id, role, purpose, session)

        raw, record = cls.create_token_pair(user_id, role, purpose)
        session.add(record)

        verification_link = cls._build_link(raw, purpose)
        return verification_link

    @classmethod
    async def consume(
        cls, raw: str, session: AsyncSession, purpose: VerificationTokenPurpose
    ) -> ClaimedToken:
        now = datetime.now(timezone.utc)

        claim_stmt = (
            update(VerificationToken)
            .where(
                (
                    VerificationToken.token_hash
                    == security.hash_token(raw)
                ),
                VerificationToken.used_at.is_(None),
                VerificationToken.expires_at > now,
                VerificationToken.purpose == purpose
            )
            .returning(
                VerificationToken.user_id,
                VerificationToken.user_role
            )
            .values({"used_at": now})
        )

        claimed = await session.scalar(claim_stmt)

        if claimed is None:
            # This is an edge case where the token exists but has either
            # expired or has been used
            existing = await session.scalar(
                select(VerificationToken)
                .where(
                    VerificationToken.token_hash
                    == security.hash_token(raw)
                )
            )

            if existing is not None:
                raise ConflictError(
                    "Your request has either expired or has already been used .."
                )

            raise AuthorizationError(
                "Your request could not be completed. Please try again."
            )

        return ClaimedToken(*claimed)
