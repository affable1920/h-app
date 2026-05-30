from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database.models import Patient
from app.schemas.inputs import PatientCreate
import app.middleware.auth_middleware as auth


class PatientService:
    def get_by_id(self, session: Session, id: str) -> Patient | None:
        stmt = select(Patient).where(Patient.id == id)
        return session.scalar(stmt)

    #

    def get_by_email(self, session: Session, email: str) -> Patient | None:
        stmt = select(Patient).where(Patient.email == email)
        return session.scalar(stmt)

    #

    def create(self, session: Session, user: PatientCreate) -> Patient:
        if self.get_by_email(session, user.email):
            raise ValueError(
                "Email id already in use. Try a different one or sign in.")

        created = Patient(
            username=user.username,
            hash=auth.hash(user.password),
            email=user.email,
        )

        session.add(created)
        session.flush([created])
        session.refresh(created)
        return created


pt_srvc = PatientService()
