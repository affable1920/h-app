import logging
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.shared.enums import AppointmentStatus
from app.database.models import Appointment, Schedule, Slot

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    def __init__(self, session: Session):
        self.session = session

    def create_bkng(self,
                    doctor_id: UUID,
                    scheduled_date: datetime,
                    slot_id: UUID,
                    patient_id: UUID | None,
                    guest_name: str | None,
                    guest_contact: str | None,) -> Appointment:

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
            raise ValueError("This scheduled is no longer active ..")

        if scheduled_date.weekday() not in schedule.weekdays:
            logger.info(
                "\nDate requested by patient was not part of the schedule ..")
            raise ValueError("Slot does not match schedule ...")

        slot.booked = True
        created_appointment = Appointment(
            slot_id=slot_id, scheduled_date=scheduled_date
        )

        if patient_id:
            logger.info(
                "\nCreating appointment record for registered patient ..")
            created_appointment.patient_id = patient_id
        else:
            logger.info(
                f"\nCreating appointment record guest ..\n{guest_name}")
            created_appointment.guest_name = guest_name
            created_appointment.guest_contact = guest_contact

        self.session.add(created_appointment)
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

        if result.patient_id:
            result.patient_id = None

        else:
            result.guest_name = None
            result.guest_contact = None

        result.status = AppointmentStatus.CANCELLED
        logger.info("\nAppointment successfully cancelled ..")
