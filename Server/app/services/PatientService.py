import logging
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad, joinedload

from app.schemas.pagination import PaginationParams
from app.schemas.types import Email
from app.core.exceptions import AlreadyInUseException
from app.services.entities.main import EntityService

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
    def load_options(cls) -> list[_AbstractLoad]:
        return []

    @classmethod
    def load_options_full(cls) -> list[_AbstractLoad]:
        appointments = selectinload(Patient.appointments)

        return [
            appointments,
            appointments.joinedload(Appointment.care_journey),
            appointments.joinedload(Appointment.clinic)
            .selectinload(Clinic.reviews),
            appointments.joinedload(Appointment.doctor)
            .selectinload(Doctor.reviews)
        ]

    @classmethod
    async def get_by_email(
        cls,
        session: AsyncSession,
        email: Email
    ) -> Patient | None:
        stmt = select(Patient).where(Patient.email == email)
        stmt = stmt.options(*cls.load_options_full())
        return await session.scalar(stmt)

    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        data: PatientCreate
    ) -> Patient:
        if (
            await cls.email_exists(session, data.email)
        ):
            raise AlreadyInUseException(
                identifier="email"
            )

        created = Patient(
            hash=security.hash(data.password),
            email=data.email,
            username=data.username,
        )

        session.add(created)
        await session.flush()

        return created

    @classmethod
    async def get_appointments(
        cls,
        patient_id: UUID,
        session: AsyncSession,
        pagination_params: PaginationParams | None = None
    ):
        loader_opts = [
            joinedload(Appointment.care_journey),
            joinedload(Appointment.slot),
            joinedload(Appointment.clinic)
        ]

        stmt = (
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .options(*loader_opts)
        )

        count = await (
            session.scalar(
                select(func.count()).select_from(
                    stmt.subquery()
                )
            )
        ) or 0

        if pagination_params:
            stmt = cls.paginate(stmt, pagination_params)

        appointments = (await session.scalars(stmt)).all()
        return count, appointments
