import logging
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.enums import AppointmentStatus
from app.database.models import Appointment, Patient, Schedule, Slot

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    def __init__(self, session: Session):
        self.session = session

    def create_bkng(self,
                    scheduled_date: datetime,
                    slot_id: UUID,
                    patient_id: UUID,
                    doctor_id: UUID
                    ) -> Appointment:

        logger.info("\nAppointment booking rqst recived ...")

        stmt = (
            select(Slot, Schedule)
            .join(Schedule, Slot.schedule_id == Schedule.id)
            .where(Slot.id == slot_id)
        )

        result = self.session.execute(stmt).one()
        slot, schedule = result.tuple()

        if slot.booked:
            logger.info("\nSlot already booked ..")
            raise ValueError("Slot already booked.")

        if not schedule.is_active:
            logger.info("\nSchedule in-active ..")
            raise ValueError("This schedule is no longer active ..")

        if schedule.doctor_id != doctor_id:
            logger.info("\nDoctor does not own the requested slot ..")
            raise ValueError(
                "Requested slot does not belong to the requested doctor.")

        if (scheduled_date.weekday() + 1) not in schedule.weekdays:
            logger.info(
                "\n\nDate requested by patient was not part of the schedule ..")

            logger.debug(f"\nRqstd weekday: {scheduled_date.weekday()}")
            logger.debug(f"\nAll weekdays: {schedule.weekdays}")
            raise ValueError("Slot does not match schedule ...")

        patient = self.session.get(Patient, patient_id)
        if patient is None:
            logger.info("\nPatient record not found for booking ..")
            raise ValueError("Invalid patient id.")

        slot.booked = True
        created_appointment = Appointment(
            slot=slot, scheduled_date=scheduled_date, patient=patient
        )

        self.session.add(created_appointment)
        logger.info("\nAppointment added to session instance successfully ..\n")
        return created_appointment


#


    def del_bkng(self, appointment_id: UUID, patient_id: UUID):
        logger.info("\nAppointment cancellation request recieved ...")

        stmt = (
            select(Appointment)
            .where(Appointment.id == appointment_id,
                   Appointment.patient_id == patient_id
                   ))

        result = self.session.execute(stmt).scalar_one_or_none()

        if not result:
            msg = "No such appointment record exists for you .."
            logger.debug(f"\nmsg")
            raise ValueError(msg)

        logger.info(f"\nResetting appointment to default state ...")

        result.slot.booked = False
        result.patient_id = None
        result.status = AppointmentStatus.CANCELLED

        logger.info("\nAppointment successfully cancelled ..")
