import logging
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from app.schemas.inputs import BookingRequestData
from app.schemas.enums import AppointmentStatus
from app.database.models import Appointment, Patient, Schedule, Slot, UUID

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    async def create_booking(
        self,
        session: Session,
        user: Patient,
        data: BookingRequestData,
    ) -> Appointment:

        logger.info(
            f"\nSlot booking request recieved from Patient {user.username}...")

        stmt = select(Slot, Schedule)

        stmt = (
            stmt.join(Schedule, onclause=Slot.schedule_id == Schedule.id)
            .where(Slot.id == data.slot_id)
        )

        try:
            result = session.execute(stmt).one()

        except NoResultFound:
            raise ValueError(
                "The slot requested to be booked does not exist."
            )

        slot, schedule = result.tuple()

        validation_checks = [
            (
                schedule.doctor_id == data.doctor_id,
                "Requested slot does not belong to the requested doctor.",
                "Doctor mismatch between schedule and client data."
            ),
            (
                data.scheduled_date.isoweekday() in schedule.weekdays,
                "The doctor has not schedule on the requested date and weekday.",
                "Date requested by patient was not part of the schedule."
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

        for check, message, log_message in validation_checks:
            if not check:
                logger.info(log_message)
                if log_message.startswith("Date requested"):
                    logger.debug(
                        f"Requested weekday: {data.scheduled_date.weekday()}")
                    logger.debug(f"Schedule weekdays: {schedule.weekdays}")
                raise ValueError(message)

        slot.is_booked = True

        created_appointment = Appointment(
            slot_id=slot.id,
            scheduled_date=slot.slot_datetime,
            patient_id=user.id,
            doctor_id=data.doctor_id,
            clinic_id=schedule.clinic_id
        )

        session.add(created_appointment)
        session.commit()

        logger.info("\nAppointment successfully committed to database.\n")
        session.refresh(created_appointment)
        return created_appointment


#

    def cancel_booking(self, session: Session, booking_id: UUID, patient: Patient):
        logger.info("\nAppointment cancellation request recieved ...")

        stmt = (
            select(Appointment)
            .where(
                Appointment.id == booking_id,
                Appointment.patient_id == patient.id
            ))

        result = session.execute(stmt).scalar()

        if not result:
            msg = "No such appointment record exists for you .."
            logger.debug(f"\nmsg")
            raise ValueError(msg)

        logger.info(f"\nResetting appointment to default state ...")

        result.slot.is_booked = False
        result.status = AppointmentStatus.CANCELLED
        logger.info("\nAppointment successfully cancelled ..")
