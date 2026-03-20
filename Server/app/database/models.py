from uuid import UUID

from datetime import datetime, time
from typing import Annotated, List, Optional

import sqlalchemy as sa
from sqlalchemy.orm import relationship, mapped_column, Mapped

from app.database.entry import Base
from app.shared.enums import UserRole, AppointmentStatus, Mode, Status

PrimaryKey = Annotated[UUID, mapped_column(
    primary_key=True, server_default=sa.text("gen_random_uuid()"))]


class TimeStampMixin:
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now())
    last_updated: Mapped[datetime] = mapped_column(
        server_onupdate=sa.func.now(), server_default=sa.func.now(), nullable=True)


class User(TimeStampMixin, Base):
    __tablename__ = "user"
    """
    The id attr which is defined as the "PrimaryKey" above - can be overridden below as well.
    """
    id: Mapped[PrimaryKey]

    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(index=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(nullable=True)

    role: Mapped[UserRole] = mapped_column(
        sa.Enum(UserRole, name="user_role"), server_default=sa.text("'PATIENT'"))

    __mapper_args__ = {
        "polymorphic_on": role,
        "polymorphic_identity": None
    }


class Patient(User):
    __tablename__ = "patient"

    id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("user.id"), primary_key=True)

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    __mapper_args__ = {
        "polymorphic_identity": UserRole.PATIENT
    }


junction = sa.Table(
    "doctor_clinics",
    Base.metadata,
    sa.Column("doctor_id", sa.ForeignKey("doctor.id"), primary_key=True),
    sa.Column("clinic_id", sa.ForeignKey("clinic.id"), primary_key=True),
)


class Doctor(User):
    __tablename__ = "doctor"
    id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("user.id"), primary_key=True)

    rating: Mapped[float] = mapped_column(
        sa.DECIMAL(2, 1), server_default="0.0")
    reviews: Mapped[int] = mapped_column(server_default="0")

    experience: Mapped[int]
    verified: Mapped[bool]

    primary_specialization: Mapped[str]
    secondary_specializations: Mapped[list[str]] = mapped_column(
        sa.JSON, server_default="[]"
    )

    fee: Mapped[int]
    credentials: Mapped[str] = mapped_column(nullable=False)
    consults_online: Mapped[bool]

    next_available: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    status: Mapped[Status] = mapped_column(
        sa.Enum(Status, name="doctor_availability_status"), default=Status.UNKNOWN)

    """
    A dr has One to many relationship with schedules
    A dr can have mutiple schedules but a schedule can only be a single doctor's

    But a dr has many to many relationship with clinics, a clinic can have many drs and vice versa
    """

    clinics: Mapped[list["Clinic"]] = relationship(
        back_populates="doctors", secondary=junction
    )
    schedules: Mapped[List["Schedule"]] = relationship(
        back_populates="doctor", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_identity": UserRole.DOCTOR
    }
    __table_args__ = (
        sa.CheckConstraint(
            sqltext="rating >= 0.0 and rating <= 5.0", name="chk_for_doctor_rating"),
    )


class Clinic(Base):
    __tablename__ = "clinic"
    id: Mapped[PrimaryKey]

    name: Mapped[str] = mapped_column(nullable=False)
    owner: Mapped[UUID] = mapped_column(sa.ForeignKey("user.id"))

    reviews: Mapped[int] = mapped_column(server_default="0")
    rating: Mapped[float] = mapped_column(
        sa.DECIMAL(2, 1), server_default="0.0")

    pincode: Mapped[int]
    location: Mapped[str] = mapped_column(sa.VARCHAR)

    contact_numbers: Mapped[list[str]] = mapped_column(
        sa.ARRAY(sa.String(length=10)), server_default="{}")
    whatsapp: Mapped[str] = mapped_column(sa.String(length=10))

    facilities: Mapped[list[str]] = mapped_column(sa.JSON, server_default="[]")
    specializations: Mapped[list[str]] = mapped_column(
        sa.JSON, server_default="[]")

    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="clinics", secondary=junction
    )

    __table_args__ = (
        sa.CheckConstraint(
            sqltext="rating >= 0.0 and rating <= 5.0", name="chk_for_clinic_rating"),
    )


class Schedule(Base):
    __tablename__ = "schedule"

    id: Mapped[PrimaryKey]
    weekdays: Mapped[list[int]] = mapped_column(sa.JSON, server_default="[]")

    scheduled_date: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True)
    hours_available: Mapped[Optional[int]]

    is_active: Mapped[bool] = mapped_column(default=True)
    is_recurring: Mapped[bool] = mapped_column(default=True)

    start_time: Mapped[time] = mapped_column(
        sa.Time(timezone=True), nullable=False)
    # end is a reserved keyword in sql
    end_time: Mapped[time] = mapped_column(
        sa.Time(timezone=True), nullable=False)
    base_slot_duration: Mapped[int] = mapped_column(default=20)

    doctor_id: Mapped[str] = mapped_column(
        sa.ForeignKey("doctor.id"), nullable=False)
    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")

    clinic_id: Mapped[str] = mapped_column(
        sa.ForeignKey("clinic.id"), nullable=False)
    clinic: Mapped["Clinic"] = relationship()

    slots: Mapped[list["Slot"]] = relationship(
        back_populates="schedule", cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.CheckConstraint(sqltext="start_time < end_time",
                           name="chk_for_schedule_timing"),
    )


class Slot(Base):
    __tablename__ = "slot"

    id: Mapped[PrimaryKey]

    booked: Mapped[bool]
    duration: Mapped[int]

    begin: Mapped[time] = mapped_column(sa.Time(timezone=True), nullable=False)
    mode: Mapped[Mode] = mapped_column(
        sa.Enum(Mode, name="consultation_mode"), server_default=sa.text("'IN_PERSON'"))

    schedule_id: Mapped[UUID] = mapped_column(sa.ForeignKey("schedule.id"))
    schedule: Mapped[Schedule] = relationship(back_populates="slots")


class Appointment(TimeStampMixin, Base):
    __tablename__ = "appointment"

    id: Mapped[PrimaryKey]

    patient_id: Mapped[Optional[UUID]] = mapped_column(
        sa.ForeignKey("patient.id"), nullable=True)
    patient: Mapped[Patient] = relationship(back_populates="appointments")

    guest_name: Mapped[Optional[str]] = mapped_column(nullable=True)
    guest_contact: Mapped[Optional[str]] = mapped_column(
        sa.String(length=10),  nullable=True)

    slot_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("slot.id"), nullable=False)
    slot: Mapped[Slot] = relationship()

    scheduled_date: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True))

    status: Mapped[AppointmentStatus] = mapped_column(
        sa.Enum(AppointmentStatus, name="appointment_status"),
        server_default=sa.text("'ACTIVE'"),
    )

    """
    if we wanted only one out of the patient_id or guest_name to be present, never both, we'd do
    -> (patient_id IS NOT NULL) != (guest_name IS NOT NULL)

    The != acts as the XOR operator in terms of postgresql
    """
    __table_args__ = (
        sa.CheckConstraint(
            sqltext="(patient_id IS NOT NULL) or (guest_name IS NOT NULL)", name="chk_patient_identity"),
    )
