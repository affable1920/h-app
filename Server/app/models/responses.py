from pydantic import BaseModel, Field
from typing import Generic, TypeVar

from app.models.doctor_models.DoctorExtraTypes import Slot


T = TypeVar("T")


class RouteResponse(BaseModel, Generic[T]):
    """ same GET response for clinics and doctors """
    entities: list[T]

    # has more boolean val for pagination
    has_more: bool

    total_count: int
    paginated_count: int
    applied_filters: list[tuple[str, str]]


class DrScheduleData(BaseModel):
    slot_id: str = Field(alias="slotId")
    clinic_id: str = Field(alias="clinicId")
    schedule_id: str = Field(alias="scheduleId")

    patient_name: str = Field(min_length=3, alias="patientName")
    patient_contact: str = Field(
        min_length=10, max_length=10, alias="patientContact")


class SlotRecord(BaseModel):
    patient_name: str
    patient_contact: str

    day: int
    dept: str
    doctor_name: str
    metadata: dict[str, Slot]
