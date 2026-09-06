from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.features.auth import security
from app.schemas.enums import UserRoleV2
from app.services.PatientService import PatientService
from app.core.exceptions import EntityNotFoundException, InvalidCredentialsError
from app.schemas.inputs import DoctorLogin, DrCreate, PatientCreate, PatientLogin

from app.services.DrService import DoctorService


class AuthService:
    @classmethod
    async def login_doctor(
        cls,
        credentials: DoctorLogin,
        session: AsyncSession
    ):
        assert credentials.email is not None

        db_user = await DoctorService.get_by_email(
            session=session,
            email=credentials.email
        )

        if db_user is None:
            raise EntityNotFoundException(
                entity_name="doctor"
            )

        if not security.authenticate_pwd(
            pwd=credentials.password,
            hash=db_user.hash
        ):
            raise InvalidCredentialsError()

        token = security.create_access_token(
            id=str(db_user.id),
            role=UserRoleV2.DOCTOR
        )

        return token, db_user

    #

    @classmethod
    async def get_current_user(
        cls,
        session: AsyncSession,
        user_id: str,
        role: str
    ):
        match role:
            case "doctor":
                return await DoctorService.get_by_id(
                    session=session,
                    id=user_id
                )

            case "patient":
                return await PatientService.get_by_id(
                    session=session,
                    id=user_id
                )

            case _:
                raise EntityNotFoundException(
                    ""
                )

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

        token = security.create_access_token(
            id=str(db_user.id),
            role=UserRoleV2.PATIENT
        )

        return token

    #

    @classmethod
    async def register_doctor(
        cls,
        session: AsyncSession,
        payload: DrCreate
    ):
        created = await DoctorService.create(
            session=session,
            data=payload
        )

        token = security.create_access_token(
            id=str(created.id),
            role=UserRoleV2.DOCTOR
        )

        return token, created

    #

    @classmethod
    async def register_patient(
        cls,
        session: AsyncSession,
        payload: PatientCreate
    ):
        created = await PatientService.create(
            session=session,
            data=payload
        )

        token = security.create_access_token(
            id=str(created.id),
            role=UserRoleV2.PATIENT
        )

        return token, created
