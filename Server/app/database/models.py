from sqlite3 import Time
from uuid import UUID, uuid4

from datetime import datetime
from typing import Any, List


from app.database.entry import Base
from app.config import UserRole, Mode, Status

from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy import (
    Uuid,
    JSON,
    Column,
    DateTime,
    Time as SQLTime,
    ForeignKey,
    Numeric,
    String,
    Table,
    Enum as SQLEnum,
)


def gen_id():
    return uuid4()


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=gen_id,
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
    Column("doctor_id", Uuid, ForeignKey("doctors.id"), primary_key=True),
    Column("clinic_id", Uuid, ForeignKey("clinics.id"), primary_key=True),
)


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, unique=True, default=gen_id
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

    fee: Mapped[int]
    consults_online: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )

    currently_available: Mapped[bool] = mapped_column(default=True)
    next_available: Mapped[datetime | None] = mapped_column(default=None)

    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )

    status: Mapped[Status] = mapped_column(SQLEnum(Status), default=Status.AVAILABLE)

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

    def __getitem__(self, name: str) -> Any:
        return self[name] if name else self.username


class Schedule(Base):
    __tablename__ = "schedules"

    """
    A schedule resonates with a particular doctor's schedule 
    at a particular clinic for any set of given days of a week ( 0 - 6 )
    """

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=gen_id
    )
    weekdays: Mapped[List[int]] = mapped_column(JSON, server_default="[]")

    date: Mapped[datetime | None]
    hours_available: Mapped[int | None]

    is_active: Mapped[bool] = mapped_column(default=True)
    is_recurring: Mapped[bool] = mapped_column(default=True)

    start: Mapped[Time] = mapped_column(SQLTime, nullable=False)
    end: Mapped[Time] = mapped_column(SQLTime)

    clinic_id: Mapped[str] = mapped_column(ForeignKey("clinics.id"), nullable=False)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctors.id"), nullable=False)

    base_slot_duration: Mapped[int] = mapped_column(default=20)

    # effective_from: Mapped[datetime] = mapped_column(default=datetime.now)
    # effective_until: Mapped[datetime] = mapped_column(nullable=True)

    """
    The dr id as a foreign key will be a column in this schedules table, where this id will 
    point to that particular dr whose schedule this is

    But the dr is simply for python -> so we can do schedule.doctor
    
    No reason to add clinic like dr bcz clinic being back populated doesn't make sense as we
    won't store clinic.schedules - but at last intuition -> where is the schedule taking place ?
    """

    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")
    clinic: Mapped["Clinic"] = relationship(lazy="joined")
    slots: Mapped[list["Slot"]] = relationship(
        back_populates="schedule", cascade="all, delete-orphan"
    )


class Slot(Base):
    __tablename__ = "slots"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=gen_id
    )

    booked: Mapped[bool]
    duration: Mapped[int]

    begin: Mapped[Time] = mapped_column(SQLTime, nullable=False)
    mode: Mapped[Mode] = mapped_column(SQLEnum(Mode), default="in person")

    schedule: Mapped["Schedule"] = relationship(back_populates="slots")
    schedule_id: Mapped[str] = mapped_column(ForeignKey("schedules.id"))


class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=gen_id
    )

    head: Mapped[str] = mapped_column(nullable=False)
    owner_name: Mapped[str] = mapped_column(nullable=False, index=True)
    email: Mapped[str] = mapped_column(index=True, nullable=False)

    username: Mapped[str] = mapped_column(nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)

    reviews: Mapped[int] = mapped_column(default=0)
    rating: Mapped[Numeric] = mapped_column(Numeric(2), default=0.0)

    address: Mapped[str] = mapped_column(nullable=False)
    pincode: Mapped[int] = mapped_column(nullable=False)

    mobile: Mapped[str] = mapped_column(String(10))
    whatsapp: Mapped[str] = mapped_column(String(10))

    facilities: Mapped[list[str]] = mapped_column(JSON, server_default="[]")
    specializations: Mapped[list[str]] = mapped_column(JSON, server_default="[]")

    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="clinics", lazy="joined", secondary=junction
    )


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=gen_id
    )

    name: Mapped[str] = mapped_column(index=True, nullable=False)
    contact: Mapped[int] = mapped_column(Numeric(10), index=True, nullable=False)

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=gen_id
    )

    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[UUID] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    slot_id: Mapped[UUID] = mapped_column(ForeignKey("slots.id"), nullable=False)

    schedule_id: Mapped[UUID] = mapped_column(
        ForeignKey("schedules.id"), nullable=False
    )
    clinic_id: Mapped[UUID] = mapped_column(ForeignKey("clinics.id"), nullable=False)

    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )

    patient: Mapped[Patient] = relationship(back_populates="appointments")
