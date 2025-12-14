from enum import Enum
from uuid import uuid4

from typing import Literal
from datetime import datetime

from app.database.entry import Base
from sqlalchemy import Column, DateTime, String, Enum as SQLEnum


def gen_id():
    return uuid4().hex


class UserRole(Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC_ADMIN = "clinic_admin"
    GUEST = "guest"


ROLES = Literal["admin", "doctor", "patient", "clinic_admin", "guest"]


class User(Base):
    __tablename__ = "users"

    id = Column(String(), primary_key=True, default=lambda: gen_id(), index=True)

    created_at = Column(DateTime(), default=lambda: datetime.now())
    email = Column(String(), unique=True, index=True, nullable=False)

    username = Column(String(), nullable=False)
    password = Column(String(), nullable=False)

    role = Column(SQLEnum(UserRole), default=UserRole.GUEST, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "username": self.username,
        }


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(String(), primary_key=True, default=lambda: gen_id(), index=True)

    def to_dict(self):
        return self.__dict__
