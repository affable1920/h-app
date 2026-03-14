from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError

from app.shared.enums import AppointmentStatus
from app.database.models import Appointment, User


class UserService:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self, db):
        self.db: Session = db

    #

    def get_by_email(self, email: str) -> User | None:
        rqstd_user = self.db.query(User).where(User.email == email).first()
        return rqstd_user if rqstd_user else None

    #

    def get_by_id(self, id: str) -> User | None:
        rqstd_user = self.db.get(User, ident=id)
        return rqstd_user if rqstd_user else None

    #

    def hash_pwd(self, pwd: str) -> str:
        return self.context.hash(pwd)

    #

    def verify_pwd(self, pwd: str, hash: str) -> bool:
        return self.context.verify(pwd, hash)

    #

    def save(self, email: str, password: str, username: str, commit: bool = False):
        try:
            hashed_pwd = self.hash_pwd(password)

            db_user = User(
                email=email,
                username=username,
                password=hashed_pwd,
            )

            self.db.add(db_user)

            if commit:
                self.db.commit

            else:
                self.db.flush()

            return db_user

        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                500,
                {
                    "detail": e,
                    "type": "DATABASE ERROR",
                    "msg": "An unexpected error occurred.",
                },
            )

        except Exception:
            self.db.rollback()
            raise

    def cancel_booking(self, appointment_id: UUID, patient_id: UUID):
        appointment = self.db.get(Appointment, ident=appointment_id)

        if not appointment or not appointment.patient_id == patient_id:
            raise ValueError([400, "invalid appointment"])

        try:
            appointment.slot.booked = False
            appointment.status = AppointmentStatus.CANCELLED

            self.db.commit()
            self.db.refresh(appointment)

            return "appointment successfully cancelled!"

        except SQLAlchemyError as e:
            print(e)
            self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail={
                    "msg": "an internal server error occurred",
                    "type": "db error",
                    "details": str(e),
                },
            )
