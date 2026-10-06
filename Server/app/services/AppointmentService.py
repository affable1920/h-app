from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad
from sqlalchemy.orm import joinedload
from app.schemas.enums import AppointmentStatus
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.database.models import Appointment


class AppointmentService:
    @classmethod
    async def get_doctor_appointment(
        cls,
        session: AsyncSession,
        doctor_id: UUID,
        appointment_id: UUID,
        loader_options: list[_AbstractLoad] = []
    ):
        stmt = (
            select(Appointment)
            .options(*loader_options)
            .where(
                Appointment.id == appointment_id,
                Appointment.doctor_id == doctor_id
            )
        )

        appointment = await session.scalar(stmt)
        return appointment

    #

    @classmethod
    async def cancel_doctor_appointment(
        cls,
        session: AsyncSession,
        doctor_id: UUID,
        appointment_id: UUID
    ):
        item = await cls.get_doctor_appointment(
            session=session,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            loader_options=[
                joinedload(Appointment.slot)
            ]
        )

        if item is None:
            raise EntityNotFoundException(
                "appointment"
            )

        if item.status is not AppointmentStatus.ACTIVE:
            raise ConflictError(
                "The requested appointment is already not active"
            )

        item.slot.is_booked = False
        item.status = AppointmentStatus.CANCELLED

        session.add(item)
