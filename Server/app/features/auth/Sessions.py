from datetime import datetime, timedelta, timezone
from typing import NamedTuple
from uuid import UUID, uuid4
import sqlalchemy as sa

from app.core.exceptions import AuthenticationError, ConflictError
from app.database.models import RefreshToken
from app.features.auth import security
from app.schemas.enums import UserRoleV2
from sqlalchemy.ext.asyncio import AsyncSession


TTL = timedelta(days=14)


class TokenPair(NamedTuple):
    access: str
    refresh: str


class Sessions:
    @staticmethod
    def issue_session(
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2,
        family_id: UUID | None = None,
        family_expires_at: datetime | None = None,
    ) -> TokenPair:
        now = datetime.now(timezone.utc)

        secret = security.generate_secret()
        hashed = security.hash_token(secret)

        refresh_token = RefreshToken(
            user_id=user_id,
            user_role=role,
            token_hash=hashed,
            expires_at=now + TTL,
            family_id=(
                family_id
                if family_id is not None
                else uuid4()
            ),
            family_expires_at=(
                family_expires_at
                if family_expires_at is not None
                else now + TTL
            )
        )

        session.add(refresh_token)

        return TokenPair(
            access=security.create_access_token(user_id, role),
            refresh=secret
        )

    @staticmethod
    async def revoke_family(
            session: AsyncSession,
            family_id: UUID,
    ) -> None:
        stmt = (
            sa.update(RefreshToken)
            .where(
                RefreshToken.family_id == family_id,
                RefreshToken.revoked_at.is_(None)
            )
            .values(revoked_at=datetime.now(timezone.utc))
        )

        await session.execute(stmt)

    @classmethod
    async def rotate(
        cls,
        session: AsyncSession,
        token: str,
    ) -> TokenPair:
        now = datetime.now(timezone.utc)

        claim_stmt = (
            sa.select(RefreshToken)
            .where(
                (
                    RefreshToken.token_hash
                    == security.hash_token(token)
                ),
                RefreshToken.revoked_at.is_(None),
                RefreshToken.used_at.is_(None),
                RefreshToken.expires_at > now,
                RefreshToken.family_expires_at > now
            )
            .with_for_update()
        )

        claimed = await session.scalar(claim_stmt)

        if claimed is None:
            existing = await session.scalar(
                sa.select(RefreshToken)
                .where(
                    RefreshToken.token_hash
                    == security.hash_token(token)
                )
            )

            if existing is not None:
                # One of the where clauses didn't hold up. The token is either used,
                # expired, revoked, or is of an expired family.

                # Token already used
                if (
                    existing.used_at is not None
                ):
                    # 1. Has been used recently - in under 10 seconds (GRACE WINDOW)
                    # The browser likely has the new cookie, This is just another tab or
                    # a double fired request, Return the retry error, DON'T REVOKE.
                    if (
                        (now - existing.used_at).total_seconds() < 10
                    ):
                        raise ConflictError(
                            code="refresh_in_progress",
                            message="You just recieved a newly issued refresh token. "
                            "Please retry using the new token ..",
                        )

                    # 2. Token is long used (replay attack), Revoke the whole family
                    # and return a 401
                    await cls.revoke_family(session, existing.family_id)

                    """ Revoke here, Raising the below error does not rollback the revoke. """
                    await session.commit()

                    raise AuthenticationError(
                        message="Your session has expired. Please login manually...",
                        code="invalid_refresh_token",
                        reason="Used refresh token.",
                    )

            raise AuthenticationError(
                message="Your session has expired. Please login again.",
                code="token_not_found",
                reason="Refresh Token to revoke was not found .."
            )

        if (
            (now - claimed.created_at).total_seconds()
            < 15
        ):
            return TokenPair(
                access=security.create_access_token(
                    claimed.user_id,
                    claimed.user_role
                ),
                refresh=token
            )

        claimed.used_at = now

        return cls.issue_session(
            session,
            claimed.user_id,
            claimed.user_role,
            claimed.family_id,
            claimed.family_expires_at
        )

    @classmethod
    async def get_refresh_token(
        cls,
        session: AsyncSession,
        token: str
    ) -> RefreshToken | None:
        stmt = (
            sa.select(RefreshToken)
            .where(
                RefreshToken.token_hash
                == security.hash_token(token)
            )
        )

        result = await session.scalar(stmt)
        return result

    @staticmethod
    async def revoke_user_sessions(
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2
    ) -> None:
        now = datetime.now(timezone.utc)

        stmt = (
            sa.update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.user_role == role,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
                RefreshToken.family_expires_at > now,
            )
            .values({"revoked_at": now})
        )

        await session.execute(stmt)
