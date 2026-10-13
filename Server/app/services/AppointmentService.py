from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.services.DrService import DoctorService
from app.schemas.enums import AppointmentStatus
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.database.models import Appointment


class AppointmentService:
    @classmethod
    async def cancel_doctor_appointment(
        cls,
        session: AsyncSession,
        doctor_id: UUID,
        appointment_id: UUID
    ):
        item = await DoctorService.get_doctor_appointment(
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
