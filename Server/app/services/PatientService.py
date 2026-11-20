import logging
from sqlalchemy import update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.core.exceptions import (
    AlreadyInUseException,
    ConflictError,
)
from app.services.entities.EntityService import EntityService

from app.database.models import (
    Appointment,
    Clinic,
    Doctor,
    Patient
)
from app.schemas.patient import PatientCreate
from app.features.auth import security

logger = logging.getLogger(__name__)

ALLOWED_FIELD_UPDATES = ["username", "email"]


class PatientService(EntityService[Patient]):
    entity = Patient

    @classmethod
    def load_base_options(cls) -> list[_AbstractLoad]:
        return []

    @classmethod
    def load_all_options(cls) -> list[_AbstractLoad]:
        appointments = selectinload(Patient.appointments)

        return [
            appointments,
            appointments.joinedload(
                Appointment.care_journey
            ),
            (
                appointments.joinedload(Appointment.clinic)
                .selectinload(Clinic.reviews)
            ),
            (
                appointments.joinedload(Appointment.doctor)
                .selectinload(Doctor.reviews)
            )
        ]

    @classmethod
    async def create_patient(
        cls,
        session: AsyncSession,
        data: PatientCreate
    ) -> Patient:
        if (
            await cls.email_exists(session, data.email)
        ):
            raise AlreadyInUseException(
                message="An account with this email already exists",
                field="email"
            )

        pwd = await security.hash_password_aio(data.password)

        created = Patient(
            hash=pwd,
            email=data.email,
            username=data.username,
        )

        session.add(created)
        return created

    @classmethod
    async def update(
        cls,
        session: AsyncSession,
        patient: Patient,
        field_name: str,
        field_value: str
    ):
        if (
            field_name not in ALLOWED_FIELD_UPDATES
        ):
            raise ConflictError(
                message=f"""Field {field_name} is not allowed to be updated""",
            )

        if (
            field_name == "email"
        ):
            if patient.email_verified:
                raise ConflictError(
                    message="You cannot change your email after verification"
                )

        stmt = (
            update(Patient)
            .where(Patient.id == patient.id)
            .values(**{field_name: field_value})
            .returning(Patient)
        )

        await session.scalar(stmt)
        await session.flush()
