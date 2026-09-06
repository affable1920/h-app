import logging
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.schemas.inputs import BookingRequestData
from app.schemas.enums import AppointmentStatus
from app.database.models import Appointment, Patient, Slot

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    @classmethod
    async def create_booking(
        cls,
        session: AsyncSession,
        user: Patient,
        data: BookingRequestData,
    ) -> Appointment:

        logger.info(
            f"\nPatient ({user.username}) wants to book a slot..."
        )

        stmt = (
            select(Slot).options(
                joinedload(Slot.schedule)
            )
            .where(Slot.id == data.slot_id)
        )

        slot = await session.scalar(stmt)

        if slot is None:
            raise EntityNotFoundException(
                entity_name="Slot",
                identifier=str(data.slot_id),
            )

        schedule = slot.schedule
        validation_checks = [
            (
                schedule.doctor_id == data.doctor_id,
                "Requested slot does not belong to the requested doctor.",
                "Doctor mismatch between schedule and client data."
            ),
            (
                data.scheduled_date.isoweekday() in set(schedule.weekdays),
                "The doctor has no schedule on the requested date and weekday.",
                "Date requested by patient was not part of the doctor's schedule."
            ),
            (
                schedule.is_active,
                "This schedule is no longer active.",
                "Schedule is inactive."
            ),
            (
                not slot.is_booked,
                "Slot already booked.",
                "Slot already booked."
            ),
        ]

        for i, (check, message, log_message) in enumerate(validation_checks):
            if not check:
                if i == len(validation_checks) - 1:
                    # if the slot is booked

                    pt_id = await (
                        session.scalar(
                            select(Appointment.patient_id).where(
                                Appointment.slot_id == data.slot_id
                            )
                        )
                    )

                    if pt_id == user.id:
                        message += f"\nYou have booked this slot, so RELAX!"

                logger.info(log_message)
                raise ConflictError(message)

        slot.is_booked = True
        created_appointment = Appointment(
            slot_id=slot.id,
            scheduled_date=slot.slot_datetime,
            patient_id=user.id,
            doctor_id=data.doctor_id,
            clinic_id=schedule.clinic_id
        )

        session.add(created_appointment)
        await session.flush()
        await session.refresh(
            instance=created_appointment,
            attribute_names=["doctor", "clinic"]
        )

        return created_appointment


#

    @classmethod
    async def cancel_booking(
        cls, session: AsyncSession,
        booking_id: str,
        patient: Patient
    ):
        logger.info("Appointment cancellation request recieved ...")

        stmt = (
            select(Appointment)
            .options(joinedload(Appointment.slot))
            .where(
                Appointment.id == booking_id,
                Appointment.patient_id == patient.id
            ))

        result = await session.scalar(stmt)

        if not result:
            raise EntityNotFoundException(
                entity_name="Appointment",
                identifier=str(booking_id),
            )

        logger.info(f"Resetting appointment to default state ...")

        result.slot.is_booked = False
        result.status = AppointmentStatus.CANCELLED

        await session.commit()
        logger.info("Appointment successfully cancelled ..")
