from datetime import datetime
from typing import Generic, Self, Sequence, TypeVar
from pydantic import (
    ConfigDict,
    EmailStr,
    model_validator,
)
from app.schemas.Base import Aliased, FromORM, IDMixin, IDSerialized
from app.schemas.enums import AppointmentStatus, UserRoleV2
from app.schemas.models import ClinicHttpMinimal, DoctorHttpFull, Slot, DoctorHttpMinimal


class AppointmentConfirmation(FromORM, IDMixin, Aliased):
    patient_id: IDSerialized
    scheduled_date: datetime
    created_at: datetime
    status: AppointmentStatus


class AppointmentResponse(AppointmentConfirmation, Aliased):
    clinic_id: IDSerialized
    doctor_id: IDSerialized
    slot_id: IDSerialized
    slot: Slot
    doctor: DoctorHttpMinimal
    clinic: ClinicHttpMinimal


T = TypeVar("T")


class PaginatedResponse(Aliased, Generic[T]):
    """same GET response for clinics and doctors"""
    entities: list[T] | Sequence[T]
    count: int
    has_next: bool | None = None


class PatientProfileResponse(FromORM, IDMixin, Aliased):
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

class DrProfileResponse(DoctorHttpFull, Aliased):
    college_studied: str | None = None
    graduation_year: int | None = None
    bio: str | None = ""
    license_number: str


class AuthHdrPayload(Aliased):
    id: str
    exp: float
    iat: float
    role: UserRoleV2
    model_config = ConfigDict(use_enum_values=True)


#
class UserResponse(IDMixin, FromORM, Aliased):
    email: EmailStr
    name: str | None = None
    username: str | None = None
