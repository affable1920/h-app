from datetime import datetime, time
from typing import Generic, Self, Sequence, TypeVar
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
    Schedule,
    Slot,
    DoctorHttpMinimal
)


class UserResponse(
    IDMixin, FromORM, Aliased
):
    email: EmailStr
    name: str | None = None
    username: str | None = None


class CareJourneyResponse(
    FromORM, IDMixin, Aliased
):
    reason_for_visit: str | None = None


class AppointmentConfirmation(
    FromORM,
    IDMixin,
    Aliased
):
    scheduled_date: datetime
    created_at: datetime
    status: AppointmentStatus
    care_journey: CareJourneyResponse | None = None


class AppointmentPatientResponse(
    AppointmentConfirmation,
    Aliased
):
    slot: Slot
    doctor: DoctorHttpMinimal
    clinic: ClinicHttpMinimal


class AppointmentDoctorResponse(
    AppointmentConfirmation,
    FromORM,
    IDMixin,
    Aliased,
):
    slot: Slot
    clinic: ClinicHttpMinimal
    patient: UserResponse


# =============
#  Generic Response
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
    email_verified: bool | None = False
    appointments: list[AppointmentPatientResponse] = Field(
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
    schedules: list[Schedule] = Field(exclude=True)


class AuthHdrPayload(Aliased):
    id: UUID
    exp: float
    iat: float
    role: UserRoleV2
    model_config = ConfigDict(
        use_enum_values=True
    )


#


class DoctorScheduleResponse(
    IDMixin,
    FromORM,
    Aliased
):
    clinic: ClinicHttpMinimal
    weekdays: list[int]
    is_active: bool
    start_time: time
    end_time: time
