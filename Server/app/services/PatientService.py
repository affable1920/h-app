import logging
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.core.exceptions import AlreadyInUseException
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
