from statistics import mean
from datetime import datetime
from typing import Annotated, Generic, Self, Sequence, TypeVar
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    computed_field,
    model_validator,
)
from app.schemas.for_tool_calls import DrMinimal
from app.schemas.Base import FromORM, IDMixin, IDSerialized
from app.schemas.enums import AppointmentStatus, Gender, Status, UserRoleV2
from app.schemas.internals import ClinicHttpMinimal, Review, Schedule, Slot


class AppointmentConfirmation(FromORM, IDMixin):
    patient_id: IDSerialized
    scheduled_date: datetime
    created_at: datetime
    status: AppointmentStatus


class AppointmentResponse(AppointmentConfirmation):
    clinic_id: IDSerialized
    doctor_id: IDSerialized
    slot_id: IDSerialized
    slot: Slot
    doctor: DrMinimal
    clinic: ClinicHttpMinimal


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """same GET response for clinics and doctors"""
    entities: list[T] | Sequence[T]
    count: int
    has_next: bool | None = None


class PatientProfileResponse(FromORM, IDMixin):
    name: str | None = None
    email: EmailStr
    username: str | None = None
    appointments: list[AppointmentResponse] = []

    @model_validator(mode="after")
    def validate_identity(self) -> Self:
        if not self.name and not self.username:
            raise ValueError(
                "Missing email or username. Atleast one is required."
            )
        return self


#


class DoctorHttpMinimal(FromORM, IDMixin):
    name: str
    primary_specialization: str
    experience: int
    reviews: list[Review] = []
    verified: bool = False
    status: Annotated[Status | None, Field(...)] = Status.UNKNOWN
    image: str | None = None

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

class DoctorHttpFull(DoctorHttpMinimal):
    credentials: str
    gender: Gender
    consults_online: bool = False
    booking_enabled: bool = False
    secondary_focus_areas: list[str] = []
    last_updated: datetime | None = None
    schedules: list[Schedule] = []


#

class DrProfileResponse(DoctorHttpFull):
    college_studied: str | None = None
    graduation_year: int | None = None
    bio: str | None = ""
    license_number: str


class AuthHdrPayload(BaseModel):
    id: str
    exp: float
    iat: float
    role: UserRoleV2
    model_config = ConfigDict(use_enum_values=True)


#
class UserResponse(IDMixin, FromORM):
    email: EmailStr
    name: str | None = None
    username: str | None = None
