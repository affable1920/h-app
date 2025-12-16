from enum import Enum
from uuid import UUID, uuid4

from datetime import datetime
from typing import List

from app.database.entry import Base

from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy import (
    Uuid,
    JSON,
    Column,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Table,
    Enum as SQLEnum,
)


def gen_id():
    return uuid4()


class UserRole(Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC = "clinic"
    GUEST = "guest"


class Mode(Enum):
    ONLINE = "online"
    IN_PERSON = "in person"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        index=True,
        default=gen_id,
        unique=True,
    )

    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )

    username: Mapped[str] = mapped_column(index=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)

    role: Mapped[UserRole | None] = mapped_column(
        SQLEnum(UserRole), default=UserRole.PATIENT
    )

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "username": self.username,
        }


junction = Table(
    "doctor_clinics",
    Base.metadata,
    Column("doctor_id", String, ForeignKey("doctors.id"), primary_key=True),
    Column("clinic_id", String, ForeignKey("clinics.id"), primary_key=True),
)


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[str] = mapped_column(
        primary_key=True, unique=True, default=gen_id, index=True
    )

    password: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(nullable=False)

    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)

    rating: Mapped[Numeric] = mapped_column(Numeric(2), default=0.0)
    reviews: Mapped[int] = mapped_column(default=0)

    experience: Mapped[int]
    verified: Mapped[bool] = mapped_column(default=False)

    primary_specialization: Mapped[str]
    secondary_specializations: Mapped[list[str]] = mapped_column(
        JSON, server_default="[]"
    )

    fullname: Mapped[str]
    credentials: Mapped[str]

    base_fee: Mapped[int]
    consults_online: Mapped[bool]

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )

    """
    A dr has One to many relationship with schedules
    A dr can have mutiple schedules but a schedule can only be a single doctor's

    But, a dr has many to many relationship with clinics, a clinic can have many drs and vice versa
    """

    # cascade on clinics makes no sense, clinics are their own entities
    clinics: Mapped[list["Clinic"]] = relationship(
        back_populates="doctors", secondary=junction
    )

    """
    No reason to a keep a dr's schedule if the dr is not going to be in our table
    all -> propogate all changes
    delete-orphan -> delete a schedule, it's deleted from the database
    delete dr -> his|her schedules are also deleted.
    """

    schedules: Mapped[List["Schedule"]] = relationship(
        back_populates="doctor", cascade="all, delete-orphan", lazy="joined"
    )


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[str] = mapped_column(primary_key=True, default=gen_id)
    weekday: Mapped[int]

    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    hours_available = Mapped[int]

    is_active: Mapped[bool]
    is_recurring: Mapped[bool]

    start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    clinic_id: Mapped[str] = mapped_column(ForeignKey("clinics.id"), nullable=False)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctors.id"), nullable=False)

    """
    The dr id as a foreign key will be a column in this schedules table, where this id will 
    point to that particular dr whose schedule this is

    But the dr is simply for python -> so we can do schedule.doctor
    
    No reason to add clinic like dr bcz clinic being back populated doesn't make sense as we
    won't store clinic.schedules - at last intuition - where is the schedule taking place ?
    """

    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")
    clinic: Mapped["Clinic"] = relationship()
    slots: Mapped[list["Slot"]] = relationship(
        back_populates="schedule", cascade="all, delete-orphan"
    )


class Slot(Base):
    __tablename__ = "slots"

    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=gen_id)

    booked: Mapped[bool]
    duration: Mapped[int]

    begin: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    mode: Mapped[Mode] = mapped_column(SQLEnum(Mode), default="in person")

    schedule_id: Mapped[str] = mapped_column(ForeignKey("schedules.id"))
    schedule: Mapped["Schedule"] = relationship(back_populates="slots")


class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[str] = mapped_column(primary_key=True, default=gen_id, index=True)

    password: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(nullable=False)

    name: Mapped[str] = mapped_column(nullable=False, index=True)
    email: Mapped[str] = mapped_column(index=True, nullable=False)

    reviews: Mapped[int] = mapped_column(default=0)
    rating: Mapped[Numeric] = mapped_column(Numeric(2), default=0.0)

    address: Mapped[str] = mapped_column(nullable=False)

    facilities: Mapped[list[str]] = mapped_column(JSON, server_default="[]")
    specializations: Mapped[list[str]] = mapped_column(JSON, server_default="[]")

    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="clinics", lazy="joined", secondary=junction
    )
