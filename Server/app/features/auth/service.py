import asyncio
import logging
import sqlalchemy as sa
from uuid import UUID
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.entry_async import AsyncSessionLocal
from app.core.exceptions import (
    AlreadyInUseException,
    AuthenticationError,
    EntityNotFoundException,
)

from app.database.models import (
    Doctor,
    Patient
)

from app.features.auth import security
from app.schemas.patient import (
    PatientCreate,
    PatientLogin
)

from app.schemas.enums import UserRoleV2
from app.schemas.doctor import DoctorLogin, DrCreate
from app.services.PatientService import PatientService
from app.services.DrService import DoctorService


logger = logging.getLogger(__name__)


MODEL_BY_ROLE = {
    UserRoleV2.DOCTOR: Doctor,
    UserRoleV2.PATIENT: Patient
}

ROLE_BY_MODEL = {m: r for r, m in MODEL_BY_ROLE.items()}


class AuthService:
    @staticmethod
    async def get_current_user(
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2
    ) -> Doctor | Patient | None:
        match role:
            case UserRoleV2.DOCTOR:
                return await DoctorService.get_doctor_by_id(
                    session=session,
                    doctor_id=user_id
                )

            case UserRoleV2.PATIENT:
                return await PatientService.get(
                    session=session,
                    ident_key="id",
                    ident_val=user_id
                )

            case _:
                return None

    @classmethod
    async def validate_dr_credentials(
        cls,
        credentials: DoctorLogin,
        session: AsyncSession
    ):
        """ lookup and authenticate credentials """

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

        if not await security.authenticate_password_aio(
            pwd=credentials.password,
            hash=db_user.hash
        ):
            raise AuthenticationError(message="Invalid credentials")

        return db_user

    @classmethod
    async def validate_patient_credentials(
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

        if not await security.authenticate_password_aio(
            pwd=credentials.password,
            hash=db_user.hash
        ):
            raise AuthenticationError(message="Invalid credentials..")

        return db_user

    @classmethod
    async def register_doctor(
        cls,
        session: AsyncSession,
        payload: DrCreate
    ):
        try:
            created = await DoctorService.create_doctor(
                session=session,
                data=payload
            )

            await session.flush()

        except IntegrityError as e:
            raise AlreadyInUseException(
                field="email",
                message="An account with this email already exists."
            ) from e

        return created

    @classmethod
    async def register_patient(
        cls,
        session: AsyncSession,
        payload: PatientCreate
    ):
        try:
            created = await PatientService.create_patient(
                session=session,
                data=payload
            )

            await session.flush()

        except IntegrityError as e:
            raise AlreadyInUseException(
                field="email",
                message="An account with this email already exists."
            ) from e

        return created

    @staticmethod
    async def remove_account(
            user_id: UUID,
            session: AsyncSession,
            role: UserRoleV2,
    ):
        model = MODEL_BY_ROLE[role]

        stmt = (
            sa.delete(model)
            .where(model.id == user_id)
        )

        await session.execute(stmt)

    @staticmethod
    async def get_user_by_email(
        session: AsyncSession,
        email: str,
    ):
        user = await DoctorService.get_by_email(email=email, session=session)

        if user is None:
            user = await PatientService.get_by_email(email=email, session=session)

        return user

    @staticmethod
    async def reset_password(
        user_id: UUID,
        role: UserRoleV2,
        session: AsyncSession,
        password: str
    ):
        model = MODEL_BY_ROLE[role]
        hashed_pwd = await security.hash_password_aio(pwd=password)

        stmt = (
            sa.update(model)
            .where(model.id == user_id)
            .returning(model.email)
            .values({"hash": hashed_pwd})
        )

        email = await session.scalar(stmt)

        if email is None:
            raise AuthenticationError("The user could not be identified.")

        return email

    @classmethod
    async def mark_email_verified(
            cls,
            user_id: UUID,
            role: UserRoleV2,
            session: AsyncSession
    ):
        model = MODEL_BY_ROLE[role]
        stmt = (
            sa.update(model)
            .where(model.id == user_id)
            .values({"email_verified": True})
            .returning(model.email)
        )

        email = await session.scalar(stmt)
        return email
