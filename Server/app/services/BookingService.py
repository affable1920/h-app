import logging
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.schemas.inputs import BookingRequestData
from app.schemas.enums import AppointmentStatus
from app.database.models import Appointment, CareJourney, Patient, Slot

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    @staticmethod
    async def find_slot_by_id(
        slot_id: str,
        session: AsyncSession
    ):
        load_options = joinedload(Slot.schedule)

        return (
            await session.scalar(
                select(Slot).options(load_options).where(
                    Slot.id == slot_id
                )
            ))

    #

    @staticmethod
    async def find_care_journey(
        patient_id: str,
        session: AsyncSession
    ) -> CareJourney | None:
        return (
            await session.scalar(
                select(CareJourney).where(
                    CareJourney.patient_id == patient_id
                )
            )
        )

    #

    @classmethod
    async def create_booking(
        cls,
        user: Patient,
        session: AsyncSession,
        payload: BookingRequestData,
    ) -> Appointment:
        slot = await cls.find_slot_by_id(
            slot_id=str(payload.slot_id),
            session=session
        )

        if slot is None:
            raise EntityNotFoundException(
                entity_name="Slot",
                identifier=str(payload.slot_id),
            )

        schedule = slot.schedule
        validation_checks = [
            (
                not slot.is_booked,
                "Slot already booked.",
                "Slot already booked."
            ),
            (
                schedule.is_active,
                "This schedule is no longer active.",
                "Schedule is inactive."
            ),
            (
                schedule.doctor_id == payload.doctor_id,
                "Requested slot does not belong to the requested doctor.",
                "Doctor mismatch between schedule and client data."
            ),
            (
                payload.scheduled_date.isoweekday() in set(schedule.weekdays),
                "The doctor has no schedule on the requested date and weekday.",
                "Date requested by patient was not part of the doctor's schedule."
            ),
        ]

        for _, (check, message, log_message) in enumerate(validation_checks):
            if not check:
                logger.info(log_message)
                raise ConflictError(message)

        care_journey = CareJourney(
            patient_id=user.id,
            reason_for_visit=payload.reason_for_visit
        )

        slot.is_booked = True
        created_appointment = Appointment(
            slot_id=slot.id,
            scheduled_date=slot.slot_datetime,
            patient_id=user.id,
            doctor_id=payload.doctor_id,
            clinic_id=schedule.clinic_id,
            # Assign the relationship directly since we don't flush and care
            # journey won't have it's id generated
            care_journey=care_journey
        )

        # relationship’s default cascade adds the new journey automatically.
        # The slot is already tracked by the session.
        session.add(created_appointment)

        await session.flush()
        await session.refresh(
            instance=created_appointment,
            attribute_names=[
                "doctor",
                "clinic",
                "care_journey_id"
            ]
        )

        return created_appointment

    #

    @classmethod
    async def cancel_booking(
        cls,
        session: AsyncSession,
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

        logger.info(
            f"Resetting appointment to default state ..."
        )

        result.slot.is_booked = False
        result.status = AppointmentStatus.CANCELLED
        logger.info("Appointment successfully cancelled ..")
