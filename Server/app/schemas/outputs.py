from datetime import datetime
from typing import Generic, Literal, Self, Sequence, TypeVar
from uuid import UUID
from pydantic import (
    ConfigDict,
    EmailStr,
    Field,
    model_validator,
)
from app.schemas.types import Email
from app.schemas.Base import Aliased,  FromORM, IDMixin
from app.schemas.enums import AppointmentStatus, UserRoleV2
from app.schemas.models import (
    ClinicHttpMinimal,
    DoctorHttpFull,
    Slot,
    DoctorHttpMinimal
)


class AppointmentConfirmation(
    FromORM,
    IDMixin,
    Aliased
):
    patient_id: UUID
    scheduled_date: datetime
    created_at: datetime
    status: AppointmentStatus
    care_journey_id: UUID | None = None


class AppointmentResponse(
    AppointmentConfirmation,
    Aliased
):
    clinic_id: UUID
    doctor_id: UUID
    slot_id: UUID
    slot: Slot
    doctor: DoctorHttpMinimal
    clinic: ClinicHttpMinimal


T = TypeVar("T")


class PaginatedResponse(Aliased, Generic[T]):
    """same GET response for clinics and doctors"""
    entities: list[T] | Sequence[T]
    count: int
    has_next: bool | None = None


class PatientProfileResponse(
    FromORM, IDMixin, Aliased
):
    name: str | None = None
    email: Email
    username: str | None = None
    appointments: list[AppointmentResponse] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_identity(self) -> Self:
        if not self.name and not self.username:
            raise ValueError(
                "Missing email and username. Atleast one is required."
            )
        return self


#

class DrProfileResponse(
    DoctorHttpFull,
    Aliased
):
    college_studied: str | None = None
    graduation_year: int | None = None
    bio: str | None = ""
    license_number: str
    email: EmailStr
    email_verified: bool | None = False


class AuthHdrPayload(Aliased):
    id: str
    exp: float
    iat: float
    role: UserRoleV2
    model_config = ConfigDict(
        use_enum_values=True
    )


#
class UserResponse(
    IDMixin, FromORM, Aliased
):
    email: EmailStr
    name: str | None = None
    username: str | None = None


class ScheduleResponse(
    IDMixin, FromORM, Aliased
):
    weekdays: list[int]
    max_slots: int | Literal[False] = False
