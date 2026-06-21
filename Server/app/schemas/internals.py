from sqlite3 import Time
from statistics import mean
from uuid import UUID
from typing import Annotated
from pydantic import ConfigDict, EmailStr, Field, PlainSerializer, computed_field

from datetime import datetime

from app.schemas.enums import Mode, ReviewableEntity, UserRoleV2
from app.schemas.Base import FromORM, IDMixin

IDSerialized = Annotated[
    UUID, PlainSerializer(
        func=lambda x: str(x), return_type=str
    )
]


class Review(IDMixin, FromORM):
    rating: float = Field(le=5.0)
    comment: str | None = None
    entity: ReviewableEntity
    entity_id: IDSerialized
    appointment_id: str | None = None
    patient_id: IDSerialized

    model_config = ConfigDict(
        use_enum_values=True
    )

#


class ClinicHttpMinimal(FromORM, IDMixin):
    name: str
    location: str | None = None
    facilities: list[str] = []


class ClinicHttpFull(ClinicHttpMinimal):
    owner: str | None = None
    pincode: int | None = None
    reviews: list[Review] = []
    contacts: list[int] = []

    @computed_field
    @property
    def rating(self) -> float:
        all_ratings = [review.rating for review in self.reviews]
        return round(mean(all_ratings if all_ratings else [0.0]), 2)


#

class Slot(FromORM, IDMixin):
    duration: int
    is_booked: bool = False
    mode: Mode | None = None
    slot_datetime: datetime
    schedule_id: IDSerialized


#

class Schedule(FromORM, IDMixin):
    start_time: Time
    end_time: Time
    is_active: bool
    weekdays: list[int] = []
    base_slot_duration: int | None = 20
    clinic_id: IDSerialized
    doctor_id: IDSerialized
    clinic: ClinicHttpMinimal | None = None
    slots: list[Slot] = []

#


class User(FromORM, IDMixin):
    username: str
    email: EmailStr
    name: str | None = None
    role: UserRoleV2
