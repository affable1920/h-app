import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Doctor, Patient
from app.features.auth import security
from app.schemas.enums import UserRoleV2
from app.services.PatientService import PatientService
from app.core.exceptions import EntityNotFoundException, InvalidCredentialsError
from app.schemas.inputs import DoctorLogin, DrCreate, PatientCreate, PatientLogin

from app.services.DrService import DoctorService


logger = logging.getLogger(__name__)


class AuthService:
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
    ) -> Optional[Doctor | Patient]:
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
                return None

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
        async with session.begin():
            patient = await PatientService.create(
                session=session, data=payload
            )

            token = security.create_access_token(
                id=str(patient.id),
                role=UserRoleV2.PATIENT
            )

        logger.info(
            "New Patient sucessfully created and committed to database"
        )
        return token, patient
