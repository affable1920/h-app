import logging
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad
from sqlalchemy.orm import joinedload

from app.schemas.appointment import GetAppointmentsFilters
from app.schemas.enums import AppointmentStatus
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.schemas.pagination import PaginationParams
from app.services.entities.QueryService import QueryService
from app.database.models import (
    Appointment,
    Clinic,
    Doctor,
    Patient
)

logger = logging.getLogger(__name__)


class AppointmentService:
    @classmethod
    def load_base_loaders(cls) -> list[_AbstractLoad]:
        return [
            joinedload(Appointment.slot),
            joinedload(Appointment.care_journey),
            joinedload(Appointment.clinic).selectinload(Clinic.reviews)
        ]

    @classmethod
    def filter(cls, stmt: Select, filters: GetAppointmentsFilters) -> Select:
        if filters.appointment_status:
            stmt = stmt.where(
                Appointment.status == filters.appointment_status
            )

        if filters.scheduled_date:
            stmt = stmt.where(
                Appointment.scheduled_date
                == filters.scheduled_date
            )

        return stmt

    @classmethod
    async def get_all_for_participant(
        cls,
        session: AsyncSession,
        participant: Doctor | Patient,
        filters: GetAppointmentsFilters | None = None,
        pagination_params: PaginationParams | None = None,
    ):
        stmt = select(Appointment)

        if isinstance(participant, Doctor):
            ownership = Appointment.doctor_id == participant.id
            loader_options = [
                joinedload(Appointment.patient),
                *cls.load_base_loaders()
            ]

        elif isinstance(participant, Patient):
            ownership = Appointment.patient_id == participant.id
            loader_options = [
                joinedload(Appointment.doctor),
                *cls.load_base_loaders()
            ]

        else:
            raise ConflictError("Unsupported participant type..")

        stmt = stmt.where(ownership)

        if filters is not None:
            stmt = cls.filter(stmt, filters)

        result = await QueryService.get_all(
            session=session,
            base_statement=stmt,
            pagination=pagination_params,
            loaders=loader_options,
            ordering_clauses=[
                Appointment.status,
                Appointment.scheduled_date.desc()
            ]
        )

        return result

    @classmethod
    async def get_for_participant(
            cls,
            appointment_id: UUID,
            session: AsyncSession,
            participant: Doctor | Patient,
    ) -> Appointment | None:
        if isinstance(participant, Doctor):
            ownership = Appointment.doctor_id == participant.id
            loader_options = [
                joinedload(Appointment.patient),
                *cls.load_base_loaders()
            ]

        elif isinstance(participant, Patient):
            ownership = Appointment.patient_id == participant.id
            loader_options = [
                joinedload(Appointment.doctor),
                *cls.load_base_loaders()
            ]

        else:
            raise ConflictError("Unsupported particiapnt type..")

        return (
            await QueryService.get_by_id(
                model=Appointment,
                entity_id=appointment_id,
                session=session,
                where_clauses=[ownership],
                loader_options=loader_options
            )
        )

    @staticmethod
    async def cancel_appointment(
        session: AsyncSession,
        appointment_id: UUID,
        participant: Doctor | Patient
    ):
        if isinstance(participant, Patient):
            raise ConflictError(
                "You as a patient cannot cancel an appointment"
                "Please ask the doctor to cancel it for you .."
            )

        appointment = await AppointmentService.get_for_participant(
            session=session,
            appointment_id=appointment_id,
            participant=participant,
        )

        if appointment is None:
            raise EntityNotFoundException(
                "appointment"
            )

        if appointment.status is not AppointmentStatus.ACTIVE:
            raise ConflictError(
                "The requested appointment is already not active"
            )

        appointment.slot.is_booked = False
        appointment.status = AppointmentStatus.CANCELLED

        session.add(appointment)

    @staticmethod
    async def complete_appointment(
        appointment_id: UUID,
        session: AsyncSession,
        participant: Doctor
    ) -> Appointment:
        appointment = (
            await AppointmentService.get_for_participant(
                session=session,
                appointment_id=appointment_id,
                participant=participant,
            )
        )

        if appointment is None:
            raise EntityNotFoundException(
                "The appointment you are looking for could not be found."
            )

        if (
            appointment.status
            is not AppointmentStatus.ACTIVE
        ):
            raise ConflictError(
                "The appointment is not in a valid state to be marked as complete."
            )

        appointment.status = AppointmentStatus.COMPLETED
        return appointment
