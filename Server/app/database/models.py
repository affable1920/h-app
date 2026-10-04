from uuid import UUID
from datetime import date, datetime, time
from typing import Annotated, ClassVar, Protocol

import sqlalchemy as sa
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship, mapped_column, Mapped

from app.database.entry_async import Base
from app.schemas.enums import (
    AppointmentStatus,
    Gender,
    Mode,
    ReviewableEntity,
    ScheduleKind,
    Status,
    UserRoleV2,
)

PrimaryKey = Annotated[UUID, mapped_column(
    sa.UUID(as_uuid=True),
    primary_key=True,
    server_default=sa.text("gen_random_uuid()")
)]


class Reviewable(Protocol):
    __reviewable_entity__: ClassVar[ReviewableEntity]

    id: PrimaryKey
    reviews: list["Review"]


class TimeStampMixin:
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now()
    )

    last_updated: Mapped[datetime | None] = mapped_column(
        server_onupdate=sa.func.now(),
        server_default=sa.func.now()
    )


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

    @avg_rating.expression
    def avg_rating(cls: type[Reviewable]):
        # This decorator (expression) lets us register the class-level behaviour separately
        # Access on the class e,g where(Doctor.avg_rating >= min_rating)
        return (
            sa.select(sa.func.avg(Review.rating))
            .where(
                Review.entity == cls.__reviewable_entity__,
                Review.entity_id == cls.id
            )
            .correlate_except(Review)
            .scalar_subquery()
        )

    #

    @hybrid_property
    def review_count(self: Reviewable):  # pyright: ignore
        if not self.reviews:
            return 0
        else:
            return len(self.reviews)

    @review_count.expression
    def review_count(cls: type[Reviewable]):
        return (
            sa.select(sa.func.count(Review.id))
            .where(
                Review.entity == cls.__reviewable_entity__,
                Review.entity_id == cls.id
            )
            .correlate_except(Review)
            .scalar_subquery()
        )


class Patient(
    TimeStampMixin,
    Base
):
    __tablename__ = "patient"

    id: Mapped[PrimaryKey]

    username: Mapped[str] = mapped_column(
        index=True,
    )

    hash: Mapped[str] = mapped_column()

    email: Mapped[str] = mapped_column(
        unique=True,
        index=True
    )

    email_verified: Mapped[bool] = mapped_column(
        server_default=sa.text("false")
    )

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


class Doctor(
    RatingMixin,
    TimeStampMixin,
    Base
):
    __tablename__ = "doctor"
    __reviewable_entity__ = ReviewableEntity.DOCTOR

    id: Mapped[PrimaryKey]

    name: Mapped[str] = mapped_column(
        index=True,
    )

    email: Mapped[str] = mapped_column(
        unique=True,
        index=True,
    )

    hash: Mapped[str]

    phone: Mapped[str | None] = mapped_column(
        sa.String(length=10)
    )

    image: Mapped[str | None] = mapped_column(sa.Text)
    email_verified: Mapped[bool] = mapped_column(
        server_default=sa.false()
    )

    experience: Mapped[int | None] = mapped_column(index=True)

    verified: Mapped[bool] = mapped_column(
        server_default=sa.false(),
        index=True
    )

    primary_specialization: Mapped[str] = mapped_column(
        index=True,
        nullable=False
    )

    secondary_focus_areas: Mapped[list[str] | None] = mapped_column(
        sa.JSON,
        server_default="[]"
    )

    fee: Mapped[int | None] = mapped_column(index=True)
    credentials: Mapped[str]

    documents: Mapped[str | None] = mapped_column(sa.Text)
    consults_online: Mapped[bool | None] = mapped_column(
        server_default=sa.true()
    )

    status: Mapped[Status] = mapped_column(
        sa.Enum(Status, name="doctor_availability_status"),
        default=Status.UNKNOWN,
        server_default=sa.text("'UNKNOWN'")
    )

    gender: Mapped[Gender] = mapped_column(
        sa.Enum(Gender, name="gender"),
    )

    college_studied: Mapped[str] = mapped_column(
        server_default="NA"
    )

    license_number: Mapped[str] = mapped_column(
        unique=True
    )

    graduation_year: Mapped[int | None]
    bio: Mapped[str | None] = mapped_column(sa.Text)

    """
    A dr has One to many relationship with schedules
    A dr can have mutiple schedules but a schedule can only be a single doctor's

    But a dr has many to many relationship with clinics, a clinic can have many drs and vice versa
    """

    clinics: Mapped[list["Clinic"]] = relationship(
        back_populates="doctors",
        secondary=junction
    )

    schedules: Mapped[list["Schedule"]] = relationship(
        back_populates="doctor",
        cascade="all, delete-orphan"
    )

    reviews: Mapped[list["Review"]] = relationship(
        primaryjoin="and_(Review.entity=='DOCTOR', foreign(Review.entity_id)==Doctor.id)",
        viewonly=True,
    )

    def __repr__(self) -> str:
        super().__repr__()
        return f"{self.__class__.__name__}(name={self.name})"


class Clinic(
    TimeStampMixin,
    RatingMixin,
    Base
):
    __tablename__ = "clinic"
    __reviewable_entity__ = ReviewableEntity.CLINIC

    id: Mapped[PrimaryKey]

    name: Mapped[str] = mapped_column(
        unique=True,
        index=True
    )

    owner: Mapped[str | None]
    pincode: Mapped[str | None] = mapped_column(
        sa.String(6)
    )

    location: Mapped[str] = mapped_column(
        sa.VARCHAR,
    )

    whatsapp: Mapped[str | None] = mapped_column(
        sa.String(length=10)
    )

    contact_numbers: Mapped[list[str]] = mapped_column(
        sa.ARRAY(
            sa.String(length=10)
        ),
        server_default="{}"
    )

    facilities: Mapped[list[str] | None] = mapped_column(
        sa.JSON,
        server_default="[]"
    )

    specializations: Mapped[list[str] | None] = mapped_column(
        sa.JSON,
        server_default="[]"
    )

    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="clinics",
        secondary=junction
    )

    reviews: Mapped[list["Review"]] = relationship(
        primaryjoin="and_(Review.entity=='CLINIC', foreign(Review.entity_id)==Clinic.id)",
        viewonly=True
    )


class Schedule(
    TimeStampMixin,
    Base
):
    __tablename__ = "schedule"

    id: Mapped[PrimaryKey]

    recurrence_kind: Mapped[ScheduleKind] = mapped_column(
        sa.Enum(ScheduleKind, name="schedule_kind"),
        index=True
    )

    timezone: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default=sa.text("'Asia/Kolkata'")
    )

    starts_on: Mapped[date] = mapped_column(
        sa.Date,
    )

    ends_on: Mapped[date | None] = mapped_column(
        sa.Date,
    )

    interval: Mapped[int] = mapped_column(
        server_default="1"
    )

    weekdays: Mapped[list[int] | None] = mapped_column(
        sa.ARRAY(sa.Integer)
    )

    month_days: Mapped[list[int] | None] = mapped_column(
        sa.ARRAY(sa.Integer)
    )

    start_time: Mapped[time] = mapped_column(sa.Time)
    end_time: Mapped[time] = mapped_column(sa.Time)

    base_slot_duration: Mapped[int]

    is_active: Mapped[bool] = mapped_column(
        server_default=sa.true()
    )

    allow_online_consultations: Mapped[bool] = mapped_column(
        server_default=sa.false()
    )

    max_slots: Mapped[int | None]
    doctor_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("doctor.id"),
        nullable=False
    )

    clinic_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("clinic.id"),
        nullable=False
    )

    clinic: Mapped["Clinic"] = relationship()
    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")

    slots: Mapped[list["Slot"]] = relationship(
        back_populates="schedule",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.CheckConstraint(
            sqltext="start_time < end_time",
            name="chk_schedule_timing"
        ),
        sa.CheckConstraint(
            sqltext="base_slot_duration >= 5",
            name="chk_schedule_slot_duration"
        ),
        sa.CheckConstraint(
            sqltext="ends_on IS NULL OR ends_on >= starts_on",
            name="chk_schedule_date_range"
        ),
        sa.CheckConstraint(
            sqltext="interval >= 1",
            name="check_schedule_interval"
        )
    )

    def __repr__(self) -> str:
        super().__repr__()
        return f"{self.__class__.__name__}(id={self.id})"


class Slot(
    TimeStampMixin,
    Base
):
    __tablename__ = "slot"

    id: Mapped[PrimaryKey]

    slot_datetime: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        index=True
    )

    duration: Mapped[int]

    is_booked: Mapped[bool] = mapped_column(
        server_default=sa.false(),
    )

    mode: Mapped[Mode] = mapped_column(
        sa.Enum(Mode, name="consultation_mode"),
    )

    schedule_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("schedule.id"),
        nullable=False
    )

    schedule: Mapped[Schedule] = relationship(back_populates="slots")

    __table_args__ = (
        sa.UniqueConstraint(
            "schedule_id",
            "slot_datetime",
            name="uq_schedule_datetime"
        ),
        sa.CheckConstraint(
            sqltext="duration >= 5",
            name="check_slot_duration"
        )
    )

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id})"


class Appointment(
    TimeStampMixin,
    Base
):
    __tablename__ = "appointment"

    id: Mapped[PrimaryKey]

    scheduled_date: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True)
    )

    status: Mapped[AppointmentStatus] = mapped_column(
        sa.Enum(
            AppointmentStatus,
            name="appointment_status"
        ),
        server_default=sa.text("'ACTIVE'"),
    )

    patient_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("patient.id"),
        nullable=False
    )

    patient: Mapped[Patient] = relationship(
        back_populates="appointments"
    )

    slot_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("slot.id"),
        nullable=False
    )

    slot: Mapped[Slot] = relationship(lazy="immediate")

    doctor_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("doctor.id"),
        nullable=False
    )

    doctor: Mapped["Doctor"] = relationship()
    clinic_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("clinic.id"),
        nullable=False
    )

    clinic: Mapped["Clinic"] = relationship()
    care_journey_id: Mapped[UUID | None] = mapped_column(
        sa.ForeignKey("care_journey.id")
    )

    care_journey: Mapped["CareJourney | None"] = relationship()

    __table_args__ = (
        sa.Index(
            "uq_appointment_active_slot",
            "slot_id",
            unique=True,
            postgresql_where=status != "CANCELLED"
        ),
    )


class Review(
    TimeStampMixin,
    Base
):
    __tablename__ = "review"

    id: Mapped[PrimaryKey]
    rating: Mapped[int]

    comment: Mapped[str | None] = mapped_column(sa.Text)

    entity_id: Mapped[UUID]
    entity: Mapped[ReviewableEntity] = mapped_column(
        sa.Enum(
            ReviewableEntity, name="reviewable_entity"
        ),
        nullable=False
    )

    patient_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("patient.id"),
    )

    appointment_id: Mapped[UUID | None] = mapped_column(
        nullable=True
    )

    __table_args__ = (
        sa.CheckConstraint("rating >= 0 AND rating <= 5", "chk_review_rating"),
        sa.Index(
            "ix_review_entity_entity_id", "entity", "entity_id"
        )
    )


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_token"

    id: Mapped[PrimaryKey] = mapped_column()

    user_id: Mapped[UUID] = mapped_column(
        index=True
    )

    user_role: Mapped[UserRoleV2] = mapped_column(
        sa.Enum(
            UserRoleV2,
            name="user_role",
        ),
    )

    hash: Mapped[str] = mapped_column(
        unique=True,
        index=True
    )

    exp: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
    )

    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now()
    )

    used_at: Mapped[datetime | None] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True
    )


class CareJourney(
    TimeStampMixin,
    Base
):
    __tablename__ = "care_journey"

    id: Mapped[PrimaryKey]

    patient_id: Mapped[UUID] = mapped_column(
        sa.ForeignKey("patient.id"),
        nullable=False
    )

    reason_for_visit: Mapped[str | None] = mapped_column(
        sa.Text,
    )
