
from datetime import datetime, time
from statistics import mean
from typing import Annotated
from uuid import UUID

from pydantic import ConfigDict, Field, computed_field

from app.schemas.types import Email
from app.schemas.Base import Aliased, FromORM, IDMixin
from app.schemas.enums import (
    Gender,
    Mode,
    ReviewableEntity,
    Status,
    UserRoleV2
)


class Review(IDMixin, FromORM):
    rating: float = Field(le=5.0)
    comment: str | None = None
    entity: ReviewableEntity
    entity_id: UUID
    appointment_id: str | None = None
    patient_id: UUID

    model_config = ConfigDict(
        use_enum_values=True
    )

#


class Slot(FromORM, IDMixin):
    duration: int
    is_booked: bool = False
    mode: Mode | None = None
    slot_datetime: datetime
    schedule_id: UUID


#


class User(FromORM, IDMixin):
    username: str
    email: Email
    name: str | None = None
    role: UserRoleV2


class DoctorHttpMinimal(FromORM, IDMixin, Aliased):
    name: str
    primary_specialization: str
    experience: int
    verified: bool = False
    status: Annotated[Status | None, Field(...)] = Status.UNKNOWN

    """
    exclude=True makes sure the properties are available for the computed field internally,
    but is not serialized into JSOn for the response.
    """

    reviews: list[Review] = Field(default=[], exclude=True)
    image: Annotated[str | None, Field(exclude=True)]

    @computed_field
    @property
    def review_count(self) -> int:
        return len(self.reviews)

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


#

class ClinicHttpMinimal(FromORM, IDMixin, Aliased):
    name: str
    location: str | None = None
    reviews: list[Review] = Field(
        default_factory=list,
        exclude=True
    )
    facilities: list[str] = Field(default_factory=list)

    @computed_field
    def rating(self) -> float:
        all_ratings = [review.rating for review in self.reviews]
        return round(mean(all_ratings if all_ratings else [0.0]), 2)

    @computed_field
    def review_count(self) -> int:
        return len(self.reviews)


class ClinicHttpFull(ClinicHttpMinimal, Aliased):
    owner: str | None = None
    pincode: int | None = None
    contacts: list[int] = Field(default_factory=list)


class Schedule(FromORM, IDMixin):
    start_time: time
    end_time: time
    is_active: bool
    weekdays: list[int] = Field(default_factory=list)
    base_slot_duration: int | None = 20
    clinic_id: UUID
    doctor_id: UUID
    clinic: ClinicHttpMinimal | None = None
    slots: list[Slot] = Field(
        default_factory=list
    )

#


class DoctorHttpFull(DoctorHttpMinimal):
    credentials: str
    gender: Gender
    consults_online: bool = False
    booking_enabled: bool = False
    secondary_focus_areas: list[str] = Field(
        default_factory=list
    )
    last_updated: datetime | None = None
    schedules: list[Schedule] = Field(
        default_factory=list
    )
