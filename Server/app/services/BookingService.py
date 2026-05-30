import logging
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.schemas.inputs import BookingRequestData
from app.schemas.enums import AppointmentStatus
from app.database.models import Appointment, Patient, Schedule, Slot, UUID

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class BookingService:
    def create_bkng(
        self,
        session: Session,
        user,
        data: BookingRequestData,
    ) -> Appointment:

        logger.info("\nAppointment booking rqst recived ...")

        stmt = (
            select(Slot, Schedule)
            .join(Schedule, Slot.schedule_id == Schedule.id)
            .where(Slot.id == data.slot_id)
        )

        result = session.execute(stmt).one()
        slot, schedule = result.tuple()

        if schedule.doctor_id != data.doctor_id:
            logger.info("\nDoctor does not own the requested slot ..")
            raise ValueError(
                "Requested slot does not belong to the requested doctor.")

        if slot.is_booked:
            logger.info("\nSlot already booked ..")
            raise ValueError("Slot already booked.")

        if not schedule.is_active:
            logger.info("\nSchedule in-active ..")
            raise ValueError("This schedule is no longer active ..")

        if (data.scheduled_date.weekday() + 1) not in schedule.weekdays:
            logger.info(
                "\n\nDate requested by patient was not part of the schedule ..")

            logger.debug(f"\nRqstd weekday: {data.scheduled_date.weekday()}")
            logger.debug(f"\nAll weekdays: {schedule.weekdays}")
            raise ValueError("Slot does not match schedule ...")

        if not data.clinic_id == schedule.clinic_id:
            logger.info(
                "Clinic and schedule requested by the user don't match")
            raise ValueError(
                "Contradicting clinic and schedule. Please check you request")

        patient = session.scalar(select(Patient).where(
            Patient.id == user.id))

        if patient is None:
            logger.info("\nPatient record not found for booking ..")
            patient = Patient(
                user_id=user.id,
                name=user.username
            )

            session.add(patient)
            session.commit()

        slot.is_booked = True
        created_appointment = Appointment(
            slot_id=slot.id,
            scheduled_date=data.scheduled_date,
            patient_id=patient.id,
            doctor_id=data.doctor_id,
            clinic_id=data.clinic_id
        )

        session.add(created_appointment)
        logger.info("\nAppointment added to session instance successfully ..\n")
        return created_appointment


#


    def del_bkng(self, session: Session, appointment_id: UUID, patient_id: UUID):
        logger.info("\nAppointment cancellation request recieved ...")

        stmt = (
            select(Appointment)
            .where(
                Appointment.id == appointment_id,
                Appointment.patient_id == patient_id
            ))

        result = session.execute(stmt).scalar()

        if not result:
            msg = "No such appointment record exists for you .."
            logger.debug(f"\nmsg")
            raise ValueError(msg)

        logger.info(f"\nResetting appointment to default state ...")

        result.slot.is_booked = False
        # result.patient_id = None
        result.status = AppointmentStatus.CANCELLED

        logger.info("\nAppointment successfully cancelled ..")
