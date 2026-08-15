
from datetime import datetime
from sqlite3 import Time
from statistics import mean
from typing import Annotated

from pydantic import ConfigDict, EmailStr, Field, computed_field

from app.schemas.Base import Aliased, FromORM, IDMixin, IDSerialized
from app.schemas.enums import Gender, Mode, ReviewableEntity, Status, UserRoleV2


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


class Slot(FromORM, IDMixin):
    duration: int
    is_booked: bool = False
    mode: Mode | None = None
    slot_datetime: datetime
    schedule_id: IDSerialized


#


class User(FromORM, IDMixin):
    username: str
    email: EmailStr
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
    reviews: list[Review] = Field(default=[], exclude=True)
    facilities: list[str] = []

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
    contacts: list[int] = []


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


class DoctorHttpFull(DoctorHttpMinimal):
    credentials: str
    gender: Gender
    consults_online: bool = False
    booking_enabled: bool = False
    secondary_focus_areas: list[str] = []
    last_updated: datetime | None = None
    schedules: list[Schedule] = []
