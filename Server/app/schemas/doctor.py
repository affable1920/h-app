from uuid import UUID
from typing import Annotated
from datetime import datetime

from app.schemas.base import FromORM, IDMixin

from . import dr_extra as DrType
from pydantic import ConfigDict, EmailStr, Field

from app.shared.enums import Status


class DoctorSummary(FromORM, IDMixin):
    fee: int
    name: str
    email: EmailStr
    rating: float
    reviews: int
    status: Status
    experience: int
    credentials: str
    verified: bool = False
    primary_specialization: str


class Doctor(DoctorSummary):
    consults_online: bool = False
    booking_enabled: bool = False

    base_consult_time: int | None = None

    currently_available: bool = False
    secondary_specializations: list[str] = []

    last_updated: Annotated[datetime | None, Field(default=None)]
    next_available: Annotated[datetime | None, Field(default=None)]

    office: DrType.Clinic | None = None
    schedules: list[DrType.Schedule] = []
