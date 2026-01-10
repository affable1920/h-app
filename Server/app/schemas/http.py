from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Annotated, Generic, TypeVar

from app.schemas.doctor import Doctor
from app.schemas.dr_extra import Clinic, Slot


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """same GET response for clinics and doctors"""

    entities: list[T]

    # has more boolean val for pagination
    has_next: bool
    has_prev: bool = False

    total_count: int
    paginated_count: int


class Patient(BaseModel):
    name: str = Field(min_length=2)
    contact: str = Field(min_length=10, max_length=10)


class BookingRequestData(BaseModel):
    date: datetime
    patient: Patient

    slot_id: UUID = Field(alias="slotId")
    schedule_id: UUID = Field(alias="scheduleId")
    clinic_id: Annotated[UUID | None, Field(default=None, alias="clinicId")]


class AppointmentRecord(BaseModel):
    slot: Slot
    date: datetime
    doctor: Doctor
    clinic: Clinic
    patient: Patient
