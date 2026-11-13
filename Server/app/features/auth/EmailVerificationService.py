import logging
import secrets
from typing import Tuple
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.DrService import DoctorService
from app.services.PatientService import PatientService
from app.services.MailService import MailService

from app.core.exceptions import (
    ConflictError,
    EntityNotFoundException,
    AuthenticationError
)

from app.schemas.types import Email
from app.schemas.enums import UserRoleV2

from app.database.models import EmailVerificationToken
from app.features.auth import security


logger = logging.getLogger(__name__)


class EmailVerificationService:
    @classmethod
    async def find_verification_token(
        cls,
        session: AsyncSession,
        token: str
    ) -> EmailVerificationToken | None:
        return await (
            session.scalar(
                select(EmailVerificationToken)
                .where(
                    EmailVerificationToken.hash
                    == security.hash_token(token)
                )
            )
        )

    @classmethod
    def create_verification_record(
        cls,
        user_id: UUID,
        user_role: UserRoleV2,
        exp: int = 30,
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
    async def send_verification_mail(
        cls,
        session: AsyncSession,
        user_id: UUID,
        email: Email,
        role: UserRoleV2
    ):
        stmt = (
            select(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user_id,
                EmailVerificationToken.user_role == role
            )
        )

        token_record = await session.scalar(stmt)

        if token_record is not None:
            if (
                (datetime.now(timezone.utc)
                 - token_record.created_at).total_seconds()
                <= 15
            ):
                raise ConflictError(
                    message="You have recently sent a verification mail. "
                    "Please wait for 15 seconds before requesting another mail."
                )

            await session.delete(token_record)

        token, link = cls.create_verification_record(
            user_id=user_id,
            user_role=role,
        )

        session.add(link)
        await session.commit()

        MailService.send_mail(
            recipient=email,
            content=(
                "Email Verification",
                "Confirm your email address using the link below\n\n"
                f"{token}\n\n"
                "The link is only valid for 5 minutes."
            )
        )

    @classmethod
    async def verify_email(
        cls,
        link: str,
        session: AsyncSession,
    ):
        token_record = await cls.find_verification_token(
            token=link,
            session=session
        )

        if token_record is None:
            raise AuthenticationError(
                message="Your email could not be verified. Please try later..",
                details={
                    "code": "invalid_token",
                    "message": "Invalid token provided."
                }
            )

        if token_record.used_at is not None:
            raise AuthenticationError(
                message="Token already used. Your email has likely been verified. "
                "Please re-check or request another verification mail before retrying..",
            )

        if token_record.exp < datetime.now(timezone.utc):
            raise AuthenticationError(
                message="Token expired. Please request a new one!"
            )

        user_id = token_record.user_id
        role = token_record.user_role

        user = None

        if role == UserRoleV2.PATIENT:
            user = await PatientService.get(
                session=session,
                ident_key="id",
                ident_val=user_id
            )

        elif role == UserRoleV2.DOCTOR:
            user = await DoctorService.get_doctor_by_id(
                session=session,
                doctor_id=user_id
            )

        if user is None:
            raise EntityNotFoundException(entity_name="user")

        if user.email_verified:
            return "Email already verified."

        user.email_verified = True
        token_record.used_at = datetime.now(timezone.utc)

        await session.commit()
        MailService.send_mail(
            recipient=user.email,
            content=(
                "Email Verification ",
                "Your email has been verified successfully ..."
            )
        )
