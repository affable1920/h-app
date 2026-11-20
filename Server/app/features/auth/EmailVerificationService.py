import logging
import secrets
from typing import Tuple
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import ColumnExpressionArgument, select, update
from sqlalchemy.ext.asyncio import AsyncSession


from app.core.exceptions import (
    AppException,
    ConflictError,
    AuthenticationError
)

from app.schemas.types import Email
from app.schemas.enums import UserRoleV2

from app.database.models import Doctor, EmailVerificationToken, Patient
from app.features.auth import security


logger = logging.getLogger(__name__)


class EmailVerificationService:
    @classmethod
    async def find_verification_token(
        cls,
        session: AsyncSession,
        token: str,
        where_clauses: list[ColumnExpressionArgument] | None = [],
        lock_: bool | None = None
    ) -> EmailVerificationToken | None:
        stmt = (
            select(EmailVerificationToken)
            .where(
                EmailVerificationToken.hash
                == security.hash_token(token),
                *(where_clauses
                  if where_clauses is not None else []
                  )
            )
        )

        if lock_:
            stmt = stmt.with_for_update()

        return await session.scalar(stmt)

    @classmethod
    def create_verification_pair(
        cls,
        user_id: UUID,
        user_role: UserRoleV2,
        exp: int = 10,
    ) -> Tuple[str, EmailVerificationToken]:
        raw_token = secrets.token_urlsafe(32)

        record = EmailVerificationToken(
            user_id=user_id,
            user_role=user_role,
            hash=security.hash_token(raw_token),
            exp=(
                datetime.now(timezone.utc)
                + timedelta(minutes=exp)
            ))

        return raw_token, record

    @classmethod
    async def create_verification_mail(
        cls,
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2
    ):
        now = datetime.now(timezone.utc)

        stmt = (
            select(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user_id,
                EmailVerificationToken.user_role == role,
            )
        )

        token_record = await session.scalar(stmt)

        if token_record is not None:
            if (
                (now - token_record.created_at).total_seconds()
                <= 15
            ):
                raise ConflictError(
                    message="You have recently sent a verification mail. "
                    "Please wait for 15 seconds before requesting another mail .."
                )

            await session.delete(token_record)

        token, link = cls.create_verification_pair(
            user_id=user_id,
            user_role=role,
        )

        session.add(link)

        BASE_URL = "https://localhost:8000/auth"
        verification_link = f"{BASE_URL}/verify-email?token={token}"

        return verification_link

    @classmethod
    async def verify_email(
        cls,
        link: str,
        session: AsyncSession,
    ):
        now = datetime.now(timezone.utc)

        async with session.begin():
            stmt = (
                update(EmailVerificationToken)
                .where(
                    (
                        EmailVerificationToken.hash
                        == security.hash_token(link)
                    ),
                    EmailVerificationToken.used_at.is_(None),
                    EmailVerificationToken.exp > now
                )
                .returning(
                    EmailVerificationToken.user_id,
                    EmailVerificationToken.user_role
                )
                .values({"used_at": now})
            )

            claimed = await session.execute(stmt)
            row = claimed.first()

            if row is None:
                existing = await cls.find_verification_token(
                    token=link,
                    session=session,
                )

                if existing is not None:
                    raise ConflictError(
                        message="""The link is either expired or has already been used. 
                        Please recheck your email verification status before retrying ..!""",
                        code="token_used_or_expired"
                    )

                raise AppException(
                    message="The verification link could not be verified. Please retry !"
                )

            user_id, user_role = row.tuple()

            stmt = (
                update(
                    model := (Doctor
                              if user_role is UserRoleV2.DOCTOR
                              else Patient)
                )
                .where(model.id == user_id)
                .values({"email_verified": True})
                .returning(model.email)
            )

            email = await session.scalar(stmt)

            if email is None:
                raise AuthenticationError(
                    message="The user associated with the email could not be found."
                )

            return email
