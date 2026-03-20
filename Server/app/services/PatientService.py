from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.services.users_service import UserService
from app.shared.enums import AppointmentStatus
from app.database.models import Appointment


class PatientService(UserService):
    def __init__(self, db: Session):
        self.session = db

    async def unbook(self, appointment_id: UUID, patient_id: UUID):
        stmt = (select(Appointment)
                .where(Appointment.id == appointment_id,
                       Appointment.patient_id == patient_id,
                       Appointment.status == AppointmentStatus.ACTIVE)
                )
        appointment = self.session.execute(stmt).scalar()

        if not appointment:
            raise ValueError("No such appointment record exists for you ..")

        appointment.slot.booked = False
        if appointment.patient_id:
            appointment.patient_id = None
        else:
            appointment.guest_name = None
            appointment.guest_contact = None

        appointment.status = AppointmentStatus.CANCELLED

        self.session.flush([appointment])
