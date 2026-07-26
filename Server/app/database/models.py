from uuid import UUID
from datetime import datetime, time
from typing import Annotated, ClassVar, Optional, Protocol

import sqlalchemy as sa
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship, mapped_column, Mapped

from app.database.entry_async import Base
from app.schemas.enums import AppointmentStatus, Gender, Mode, ReviewableEntity, Status

PrimaryKey = Annotated[UUID, mapped_column(
    primary_key=True, server_default=sa.text("gen_random_uuid()")
)]


class Reviewable(Protocol):
    id: PrimaryKey
    reviews: list["Review"]
    __reviewable_entity__: ClassVar[ReviewableEntity]


class TimeStampMixin:
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now())
    last_updated: Mapped[Optional[datetime]] = mapped_column(
        server_onupdate=sa.func.now(), server_default=sa.func.now())


class RatingMixin:
    """
    Mixin for any model that has a `reviews` relationship
    pointing to a Review row with `entity_id` + `rating`.
    """

    # each subclass must set this
    __reviewable_entity__: ClassVar[ReviewableEntity]

    @hybrid_property  # a hybrid property behaves differently on a class and an instance
    def avg_rating(self: Reviewable) -> float | None:  # pyright: ignore
        # Access on the instance e,g some_dr.avg_rating
        if not self.reviews:
            return None
        # else calculate aggregate
        return sum(r.rating for r in self.reviews) / len(self.reviews)

    #

    @avg_rating.expression
    def avg_rating(cls: type[Reviewable]):
        # This decorator (expression) lets us register the class-level behaviour separately
        # Access on the class e,g where(Doctor.avg_rating >= min_rating)
        return (
            sa.select(sa.func.avg(Review.rating))
            .where(
                Review.entity_id == cls.id,
                Review.entity == cls.__reviewable_entity__
            )
            .correlate_except(Review)
            .scalar_subquery()
        )


class Patient(TimeStampMixin, Base):
    __tablename__ = "patient"

    id: Mapped[PrimaryKey]

    username: Mapped[str] = mapped_column(nullable=False)
    hash: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False, index=True)

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan",
    )


junction = sa.Table(
    "doctor_clinics",
    Base.metadata,
    sa.Column("doctor_id", sa.ForeignKey("doctor.id"), primary_key=True),
    sa.Column("clinic_id", sa.ForeignKey("clinic.id"), primary_key=True),
)


class Doctor(RatingMixin, TimeStampMixin, Base):
    __tablename__ = "doctor"
    __reviewable_entity__ = ReviewableEntity.DOCTOR

    id: Mapped[PrimaryKey]

    name: Mapped[str] = mapped_column(index=True, nullable=False)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    hash: Mapped[str] = mapped_column(nullable=False)

    phone: Mapped[Optional[str]] = mapped_column(sa.String(length=10))
    image: Mapped[Optional[str]] = mapped_column(sa.Text)

    experience: Mapped[Optional[int]] = mapped_column()
    verified: Mapped[bool] = mapped_column(server_default="False")

    primary_specialization: Mapped[str] = mapped_column(
        nullable=False, index=True)
    secondary_focus_areas: Mapped[Optional[list[str]]] = mapped_column(
        sa.JSON, server_default="[]"
    )

    fee: Mapped[Optional[int]] = mapped_column()
    credentials: Mapped[str] = mapped_column(nullable=False)
    documents: Mapped[Optional[str]] = mapped_column(sa.Text)
    consults_online: Mapped[Optional[bool]] = mapped_column(default=True)
    status: Mapped[Optional[Status]] = mapped_column(
        sa.Enum(Status, name="doctor_availability_status"),
        default=Status.UNKNOWN,
        server_default=sa.text("'UNKNOWN'")
    )

    gender: Mapped[Gender] = mapped_column(
        sa.Enum(Gender, name="gender"), nullable=False)
    college_studied: Mapped[Optional[str]] = mapped_column(server_default="NA")
    license_number: Mapped[str] = mapped_column(nullable=False, unique=True)
    graduation_year: Mapped[Optional[int]] = mapped_column()
    bio: Mapped[Optional[str]] = mapped_column(sa.Text)

    """
    A dr has One to many relationship with schedules
    A dr can have mutiple schedules but a schedule can only be a single doctor's

    But a dr has many to many relationship with clinics, a clinic can have many drs and vice versa
    """

    clinics: Mapped[list["Clinic"]] = relationship(
        back_populates="doctors", secondary=junction
    )
    schedules: Mapped[list["Schedule"]] = relationship(
        back_populates="doctor", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        primaryjoin="and_(Review.entity=='DOCTOR', foreign(Review.entity_id)==Doctor.id)",
        viewonly=True,
    )


class Clinic(RatingMixin, Base):
    __tablename__ = "clinic"
    __reviewable_entity__ = ReviewableEntity.CLINIC

    id: Mapped[PrimaryKey]
    name: Mapped[str] = mapped_column(nullable=False, unique=True, index=True)
    owner: Mapped[Optional[str]] = mapped_column()
    pincode: Mapped[Optional[str]] = mapped_column()
    location: Mapped[str] = mapped_column(sa.VARCHAR, nullable=False)

    contact_numbers: Mapped[list[str]] = mapped_column(
        sa.ARRAY(sa.String(length=10)), server_default="{}"
    )
    whatsapp: Mapped[Optional[str]] = mapped_column(sa.String(length=10))
    facilities: Mapped[Optional[list[str]]] = mapped_column(
        sa.JSON, server_default="[]")
    specializations: Mapped[Optional[list[str]]] = mapped_column(
        sa.JSON, server_default="[]"
    )
    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="clinics", secondary=junction
    )

    reviews: Mapped[list["Review"]] = relationship(
        primaryjoin="and_(Review.entity=='CLINIC', foreign(Review.entity_id)==Clinic.id)",
        viewonly=True
    )


class Schedule(Base):
    __tablename__ = "schedule"

    id: Mapped[PrimaryKey]
    weekdays: Mapped[list[int]] = mapped_column(
        sa.ARRAY(sa.Integer), server_default="{}")

    is_active: Mapped[bool] = mapped_column(server_default="True")

    start_time: Mapped[time] = mapped_column(
        sa.Time(timezone=True), nullable=False
    )
    end_time: Mapped[time] = mapped_column(
        sa.Time(timezone=True), nullable=True
    )
    base_slot_duration: Mapped[int] = mapped_column(nullable=False, default=20)

    doctor_id: Mapped[str] = mapped_column(sa.ForeignKey("doctor.id"))
    clinic_id: Mapped[str] = mapped_column(sa.ForeignKey("clinic.id"))

    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")
    clinic: Mapped["Clinic"] = relationship()

    slots: Mapped[list["Slot"]] = relationship(
        back_populates="schedule", cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.CheckConstraint(
            sqltext="start_time < end_time", name="chk_schedule_timing"
        ),
    )


class Slot(TimeStampMixin, Base):
    __tablename__ = "slot"

    id: Mapped[PrimaryKey]
    is_booked: Mapped[bool] = mapped_column(default=False)
    duration: Mapped[Optional[int]] = mapped_column()
    slot_datetime: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False)
    mode: Mapped[Optional[Mode]] = mapped_column(
        sa.Enum(Mode, name="consultation_mode"),
        server_default=sa.text("'IN_PERSON'")
    )
    schedule_id: Mapped[UUID] = mapped_column(sa.ForeignKey("schedule.id"))
    schedule: Mapped[Schedule] = relationship(back_populates="slots")


class Appointment(TimeStampMixin, Base):
    __tablename__ = "appointment"

    id: Mapped[PrimaryKey]
    scheduled_date: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True))
    status: Mapped[AppointmentStatus] = mapped_column(
        sa.Enum(AppointmentStatus, name="appointment_status"),
        server_default=sa.text("'ACTIVE'"),
    )

    patient_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("patient.id")
    )
    patient: Mapped[Patient] = relationship(
        back_populates="appointments"
    )

    slot_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("slot.id"), unique=True)
    slot: Mapped[Slot] = relationship(lazy="immediate")

    doctor_id: Mapped[UUID] = mapped_column(sa.ForeignKey("doctor.id"))
    doctor: Mapped["Doctor"] = relationship()

    clinic_id: Mapped[UUID] = mapped_column(sa.ForeignKey("clinic.id"))
    clinic: Mapped["Clinic"] = relationship()

    """
    Add consultation link, a sql text type for online consultations later
    """


class Review(TimeStampMixin, Base):
    __tablename__ = "review"

    id: Mapped[PrimaryKey] = mapped_column()
    rating: Mapped[int] = mapped_column()
    comment: Mapped[Optional[str]] = mapped_column(sa.Text)
    entity: Mapped[ReviewableEntity] = mapped_column(sa.Enum(
        ReviewableEntity, name="reviewable_entity"), nullable=False)
    entity_id: Mapped[UUID] = mapped_column(nullable=False)

    patient_id: Mapped[UUID] = mapped_column(sa.ForeignKey("patient.id"))
    appointment_id: Mapped[UUID] = mapped_column(nullable=True)

    __table_args__ = (
        sa.CheckConstraint("rating >= 0 AND rating <= 5", "chk_review_rating"),
    )
