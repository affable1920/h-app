from uuid import UUID
from datetime import datetime
from typing import Annotated, Generic, Self, Sequence,  TypeVar
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    PlainSerializer,
    computed_field,
    model_validator,
)
from app.schemas.Base import FromORM, IDMixin
from app.schemas.internals_ import Doctor, Review, Schedule, Slot
from app.schemas.enums import AppointmentStatus, Gender, Status, UserRoleV2


IDSerialized = Annotated[
    UUID, PlainSerializer(
        func=lambda x: str(x), return_type=str
    )
]


class AppointmentResponse(FromORM, IDMixin):
    patient_id: IDSerialized
    slot: Slot
    doctor_id: UUID
    created_at: datetime
    scheduled_date: datetime
    status: AppointmentStatus
    clinic_id: UUID


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """same GET response for clinics and doctors"""
    entities: list[T]
    count: int
    has_next: bool | None = None
    has_prev: bool = False


class PatientProfileResponse(FromORM, IDMixin):
    name: str | None = None
    email: EmailStr
    username: str | None = None
    appointments: list[AppointmentResponse] = []

    @model_validator(mode="after")
    def validate_identity(self) -> Self:
        if not self.name and not self.username:
            raise ValueError(
                "Missing email or username. Atleast one is required.")
        return self


class DrProfileResponse(Doctor):
    gender: Gender
    college_studied: str | None = None
    graduation_year: int | None = None
    license_number: str
    bio: str | None = ""
    primary_specialization: str
    verified: bool = False
    consults_online: bool = False
    credentials: str
    booking_enabled: bool = False
    base_consult_time: int | None = None
    currently_available: bool = False
    secondary_specializations: list[str] = []
    last_updated: Annotated[datetime | None, Field(...)] = None
    next_available: Annotated[datetime | None, Field(...)] = None
    schedules: list[Schedule] = []


class AuthHdrPayload(BaseModel):
    id: str
    exp: float
    iat: float
    role: UserRoleV2
    model_config = ConfigDict(use_enum_values=True)


class UserResponse(IDMixin, FromORM):
    email: EmailStr
    name: str | None = None
    username: str | None = None
