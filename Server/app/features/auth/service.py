import logging
import secrets
from typing import Optional
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.outputs import UserResponse
from app.core.exceptions import (
    ConflictError,
    EntityNotFoundException,
    InvalidCredentialsError,
    InvalidTokenError
)
from app.database.models import Doctor, EmailVerificationToken, Patient
from app.features.auth import security

from app.schemas.enums import UserRoleV2
from app.schemas.inputs import (
    DoctorLogin,
    DrCreate,
    PatientCreate,
    PatientLogin
)

from app.services.MailService import MailService
from app.services.PatientService import PatientService
from app.services.DrService import DoctorService


logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def get_current_user(
        session: AsyncSession,
        user_id: UUID,
        role: str
    ) -> Optional[Doctor | Patient]:
        match role:
            case "doctor":
                return await DoctorService.get_by_id(
                    session=session,
                    entity_id=user_id
                )

            case "patient":
                return await PatientService.get_by_id(
                    session=session,
                    entity_id=user_id
                )

            case _:
                return None

    #

    @staticmethod
    async def find_token_by_hash(
        token: str,
        session: AsyncSession,
    ):
        return await (
            session.scalar(
                select(EmailVerificationToken).where(
                    EmailVerificationToken.hash == security.hash_verification_token(
                        token
                    )
                )
            )
        )

    #

    @staticmethod
    def create_verification_link_record(
        user_id: UUID,
        user_role: UserRoleV2,
        token: str,
        exp: int = 5,
    ):
        link = EmailVerificationToken(
            user_id=user_id,
            user_role=user_role,
            hash=security.hash_verification_token(token),
            exp=datetime.now(timezone.utc) + timedelta(minutes=exp)
        )

        return link

    #

    @staticmethod
    async def send_verification_mail(
        session: AsyncSession,
        user: Patient | Doctor,
    ):
        role = (
            UserRoleV2.PATIENT if isinstance(
                user, Patient
            )
            else UserRoleV2.DOCTOR
        )

        stmt = (
            select(EmailVerificationToken).where(
                EmailVerificationToken.user_id == user.id,
                EmailVerificationToken.user_role == role
            )
        )

        token_record = await session.scalar(stmt)

        if token_record:
            if (
                (datetime.now() - token_record.created_at).total_seconds() <= 15
            ):
                raise ConflictError(
                    message="You have recently sent a verification mail. "
                    "Please wait for 15 seconds before requesting another mail."
                )

            logger.info(
                f"Deleting previously generated token for the user {user}..."
            )

            await session.delete(token_record)

        logger.info(
            f"Creating a new token for email verification for user {user} ..."
        )

        token = secrets.token_urlsafe(32)
        link = AuthService.create_verification_link_record(
            user.id,
            role,
            token
        )

        session.add(link)
        await session.commit()

        MailService.send_mail(
            recipient=user.email,
            content=(
                "Email Verification",
                "Confirm your email address using the link below\n\n"
                f"{token}\n\n"
                "The link is only valid for 5 minutes."
            )
        )

    #

    @staticmethod
    async def verify_email(
        link: str,
        session: AsyncSession,
    ):
        token_record = await AuthService.find_token_by_hash(
            token=link,
            session=session
        )

        if token_record is None:
            logger.info(
                "No token found stored for the user trying to verify their email "
                "Rejecting the verification ..."
            )

            raise InvalidTokenError(message="Invalid token")

        if token_record.used_at is not None:
            logger.info(
                "Token verification against the stored hash failed.. "
                "Token already used"
            )

            raise InvalidTokenError(message="token already used..")

        if token_record.exp < datetime.now(timezone.utc):
            logger.info(
                "Token has expired ..."
            )

            raise InvalidTokenError(
                message="Token expired. Please request a new one!"
            )

        user_id = token_record.user_id
        role = token_record.user_role

        user = None

        if role == UserRoleV2.PATIENT:
            user = await PatientService.get_by_id(
                session=session,
                entity_id=user_id
            )

        elif role == UserRoleV2.DOCTOR:
            user = await DoctorService.get_by_id(
                session=session,
                entity_id=user_id
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
                "Email Verification",
                "Your email has been verified successfully ..."
            )
        )

    #

    @classmethod
    async def login_doctor(
        cls,
        credentials: DoctorLogin,
        session: AsyncSession
    ):
        method_used = "id" if credentials.id else "email"
        value = credentials.model_dump()[method_used]

        db_user = await DoctorService.get(
            session=session,
            ident_key=method_used,
            ident_val=value
        )

        if db_user is None:
            raise EntityNotFoundException(
                entity_name="doctor"
            )

        if not security.authenticate_pwd(
            pwd=credentials.password,
            hash=db_user.hash
        ):
            raise InvalidCredentialsError(
                message="Invalid password.."
            )

        token = security.create_access_token(
            id=db_user.id,
            role=UserRoleV2.DOCTOR
        )

        return token, db_user

    #

    @classmethod
    async def login_patient(
            cls,
            session: AsyncSession,
            credentials: PatientLogin
    ):
        db_user = await PatientService.get_by_email(
            session=session,
            email=credentials.email
        )

        if db_user is None:
            raise EntityNotFoundException(
                entity_name="patient"
            )

        if not security.authenticate_pwd(
            pwd=credentials.password,
            hash=db_user.hash
        ):
            raise InvalidCredentialsError(
                message="Invalid password.."
            )

        token = security.create_access_token(
            id=db_user.id,
            role=UserRoleV2.PATIENT
        )

        return token, db_user

    #

    @classmethod
    async def register_doctor(
        cls,
        session: AsyncSession,
        payload: DrCreate
    ):
        async with session.begin():
            created = await DoctorService.create(
                session=session,
                data=payload
            )

            access_token = security.create_access_token(
                id=created.id,
                role=UserRoleV2.DOCTOR
            )

            response = UserResponse.model_validate(created)

        return access_token, response

    #

    @classmethod
    async def register_patient(
        cls,
        session: AsyncSession,
        payload: PatientCreate
    ):
        async with session.begin():
            patient = await PatientService.create(
                session=session,
                data=payload
            )

            access_token = security.create_access_token(
                id=patient.id,
                role=UserRoleV2.PATIENT
            )

            response = UserResponse.model_validate(patient)

        return access_token, response
