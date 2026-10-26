from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.schemas.enums import AppointmentStatus
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.database.models import Appointment, Clinic, Doctor, Patient


class AppointmentService:
    @staticmethod
    async def get_appointment(
        session: AsyncSession,
        appointment_id: UUID,
        loader_opts: list[_AbstractLoad] | None = None
    ) -> Appointment | None:
        stmt = (
            select(Appointment)
            .where(Appointment.id == appointment_id)
            .options(*(loader_opts or []))
        )

        appointment = await session.scalar(stmt)
        return appointment

    @staticmethod
    async def get_for_participant(
        session: AsyncSession,
        appointment_id: UUID,
        participant: Doctor | Patient,
        loader_opts: list[_AbstractLoad] | None = None
    ) -> Appointment:
        if isinstance(
            participant,
            Doctor
        ):
            ownership = Appointment.doctor_id == participant.id

        elif isinstance(
            participant,
            Patient
        ):
            ownership = Appointment.patient_id == participant.id

        else:
            raise TypeError("Unsupported participant type.")

        stmt = (
            select(Appointment)
            .where(
                Appointment.id == appointment_id,
                ownership
            )
            .options(*(loader_opts or []))
        )

        appointment = await session.scalar(stmt)

        if appointment is None:
            raise EntityNotFoundException(
                "appointment"
            )

        return appointment

    @staticmethod
    async def get_participant_appointments(
        session: AsyncSession,
        participant: Doctor | Patient,
        loader_opts: list[_AbstractLoad] | None = None
    ) -> list[Appointment] | Sequence[Appointment]:
        if isinstance(
            participant,
            Doctor
        ):
            ownership = Appointment.doctor_id == participant.id

        elif isinstance(
            participant,
            Patient
        ):
            ownership = Appointment.patient_id == participant.id

        else:
            raise TypeError("Unsupported participant type.")

        stmt = (
            select(Appointment)
            .where(ownership)
            .options(*(loader_opts or []))
        )

        return (await session.scalars(stmt)).all()

    @staticmethod
    async def cancel_appointment(
        session: AsyncSession,
        appointment_id: UUID,
        participant: Doctor | Patient
    ):
        if isinstance(
            participant,
            Patient
        ):
            return

        appointment = await AppointmentService.get_for_participant(
            session,
            appointment_id,
            participant,
            [joinedload(Appointment.slot)]
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
                loader_opts=[
                    joinedload(Appointment.patient),
                    joinedload(Appointment.slot),
                    joinedload(Appointment.care_journey),
                    joinedload(Appointment.clinic).selectinload(Clinic.reviews)
                ]
            )
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
