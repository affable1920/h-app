from sqlite3 import Time
from statistics import mean
from uuid import UUID
from typing import Annotated
from pydantic import EmailStr, Field, computed_field

from datetime import datetime

from app.schemas.enums import Mode, Status, UserRoleV2
from app.schemas.Base import FromORM, IDMixin


class Review(FromORM, IDMixin):
    rating: int = Field(le=5)
    comment: str | None = None
    doctor: "Doctor | None" = None
    clinic: "Clinic | None" = None
    appointment_id: str
    patient_id: str


class Clinic(FromORM, IDMixin):
    name: str
    owner: str | None = None
    location: str | None = None
    facilities: list[str] = []
    pincode: int | None = None
    reviews: int = 0
    rating: float = 0.0
    contacts: list[int] = []


class Slot(FromORM, IDMixin):
    duration: int
    booked: bool = False
    mode: Mode | None = None
    begin: Annotated[Time, Field(..., description="The slot start time")]
    schedule_id: UUID


class Schedule(FromORM, IDMixin):
    weekdays: list[int] = []
    is_active: bool
    is_recurring: bool
    clinic_id: UUID
    doctor_id: UUID
    clinic: Clinic | None = None
    slots: list[Slot] = []
    start_time: Time
    hours_available: int | None = None
    end_time: Time


class User(FromORM, IDMixin):
    username: str
    email: EmailStr
    name: str | None = None
    role: UserRoleV2


class Doctor(FromORM, IDMixin):
    name: str
    primary_specialization: str
    experience: int
    reviews: list[Review] = []
    verified: bool = False
    license_number: str
    status: Annotated[Status | None, Field(...)] = Status.UNKNOWN
    consults_online: bool = False
    booking_enabled: bool = False
    base_consult_time: int | None = None
    currently_available: bool = False
    secondary_focus_areas: list[str] = []
    last_updated: Annotated[datetime | None, Field(...)] = None
    next_available: Annotated[datetime | None, Field(...)] = None
    schedules: list[Schedule] = []
    image: str | None = None

    @computed_field
    @property
    def rating(self) -> int:
        all_ratings = [rev.rating for rev in self.reviews]
        return round(mean(all_ratings) if len(all_ratings) else 0)

    @computed_field
    @property
    def image_url(self) -> str | None:
        if self.image:
            return f"data:image/jpeg;base64,{self.image}"
        return None
