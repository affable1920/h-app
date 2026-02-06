from uuid import UUID
from typing import Annotated
from datetime import datetime

from . import dr_extra as DrType
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.shared.schemas import Status


class DoctorSummary(BaseModel):
    id: UUID
    fee: int
    fullname: str
    email: EmailStr
    rating: float
    reviews: int
    status: Status
    experience: int
    credentials: str
    verified: bool = False
    primary_specialization: str

    model_config = ConfigDict(from_attributes=True)


class Doctor(DoctorSummary, BaseModel):
    consults_online: bool = False
    booking_enabled: bool = False

    base_consult_time: int | None = None

    currently_available: bool = False
    secondary_specializations: list[str] = []

    last_updated: Annotated[datetime | None, Field(default=None)]
    next_available: Annotated[datetime | None, Field(default=None)]

    office: DrType.Clinic | None = None
    schedules: list[DrType.Schedule] = []

    # Flexible metadata for future flags without breaking changes

    model_config = ConfigDict(from_attributes=True, extra="allow")
