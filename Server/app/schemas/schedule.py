from datetime import time
from typing import Annotated, Any, Literal, Self
from uuid import UUID

from pydantic import Field, field_validator, model_validator

from app.schemas.models import ClinicHttpMinimal
from app.schemas.Base import (
    Aliased,
    FromORM,
    IDMixin,
    StrictRequest,
)

from app.schemas.recurrence import (
    Recurrence,
    recurrence_to_flat,
    with_recurrence,
)


class CreateSchedule(StrictRequest):
    clinic_id: UUID
    timezone: Literal["Asia/Kolkata"] = "Asia/Kolkata"
    start_time: time
    end_time: time
    base_slot_duration: Annotated[int, Field(ge=5, strict=True)]
    max_slots: Annotated[int | None, Field(ge=1, strict=True)] = None
    is_active: bool = True
    allow_online_consultations: bool = False
    recurrence: Recurrence

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_local_time(cls, value: time) -> time:
        if (
            value.tzinfo is not None
            or value.second != 0
            or value.microsecond != 0
        ):
            raise ValueError(
                "Use local hours and minutes without a timezone offset."
            )
        return value

    @model_validator(mode="after")
    def validate_time_window(self) -> Self:
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time.")

        start_minutes = self.start_time.hour * 60 + self.start_time.minute
        end_minutes = self.end_time.hour * 60 + self.end_time.minute

        if end_minutes - start_minutes < self.base_slot_duration:
            raise ValueError("The time window must fit at least one slot.")
        return self

    def persistence_fields(self) -> dict[str, Any]:
        """Return only the flat recurrence columns stored by Schedule."""

        return recurrence_to_flat(self.recurrence)


class ScheduleResponseBase(
    IDMixin,
    Aliased,
    FromORM
):
    timezone: str
    start_time: time
    end_time: time
    base_slot_duration: int
    max_slots: int | None = None
    is_active: bool
    allow_online_consultations: bool
    recurrence: Recurrence

    @model_validator(mode="before")
    @classmethod
    def project_flat_recurrence(cls, value: Any) -> Any:
        return with_recurrence(value)


class DoctorScheduleResponse(ScheduleResponseBase):
    clinic: ClinicHttpMinimal
