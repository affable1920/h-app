from sqlite3 import Time
from statistics import mean
from uuid import UUID
from typing import Annotated
from pydantic import ConfigDict, EmailStr, Field, PlainSerializer, computed_field

from datetime import datetime

from app.schemas.enums import Gender, Mode, ReviewableEntity, Status, UserRoleV2
from app.schemas.Base import FromORM, IDMixin

IDSerialized = Annotated[
    UUID, PlainSerializer(
        func=lambda x: str(x), return_type=str
    )
]


class Review(IDMixin):
    rating: float = Field(le=5)
    comment: str | None = None
    entity: ReviewableEntity
    entity_id: UUID
    appointment_id: str | None = None
    patient_id: IDSerialized

    model_config = ConfigDict(
        use_enum_values=True,
        from_attributes=True
    )


class Clinic(FromORM, IDMixin):
    name: str
    owner: str | None = None
    location: str | None = None
    facilities: list[str] = []
    pincode: int | None = None
    reviews: list[Review] = []
    contacts: list[int] = []

    @computed_field
    @property
    def rating(self) -> float:
        all_ratings = [review.rating for review in self.reviews]
        return round(mean(all_ratings if all_ratings else [0.0]), 2)


class Slot(FromORM, IDMixin):
    duration: int
    is_booked: bool = False
    mode: Mode | None = None
    slot_datetime: datetime
    schedule_id: UUID


class Schedule(FromORM, IDMixin):
    start_time: Time
    end_time: Time
    is_active: bool
    weekdays: list[int] = []
    base_slot_duration: int | None = 20
    clinic_id: UUID
    doctor_id: UUID
    clinic: Clinic | None = None
    slots: list[Slot] = []


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
    status: Annotated[Status | None, Field(...)] = Status.UNKNOWN
    consults_online: bool = False
    booking_enabled: bool = False
    secondary_focus_areas: list[str] = []
    last_updated: Annotated[datetime | None, Field(...)] = None
    schedules: list[Schedule] = []
    image: str | None = None
    gender: Gender
    credentials: str

    @computed_field
    @property
    def rating(self) -> float:
        all_ratings = [rev.rating for rev in self.reviews]
        return round(mean(all_ratings if all_ratings else [0.0]), 2)

    @computed_field
    @property
    def image_url(self) -> str | None:
        if self.image:
            return f"data:image/jpeg;base64,{self.image}"
        return None
