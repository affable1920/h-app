from uuid import uuid4
from typing import Annotated
from datetime import datetime

from . import DoctorExtraTypes as DrType
from pydantic import BaseModel, EmailStr, Field

from app.models.BaseModel import BaseModelConfig


class DrEssentials(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    email: EmailStr
    credentials: str
    primary_specialization: str


class DrSecondaries(BaseModelConfig):
    fee: DrType.Fee
    status: DrType.Status = DrType.Status.UNKNOWN

    verified: bool = False
    reviews: int | None = None
    rating: int | float | None = None

    consults_online: bool = False
    booking_enabled: bool = False

    base_fee: int
    base_consult_time: int | None = None

    experience: int | None = None
    secondary_specializations: list[str] = []

    currently_available: bool | None = None
    last_updated: Annotated[datetime | None, Field(default=None)]
    next_available: Annotated[datetime | None, Field(default=None)]

    office: DrType.Clinic | None = None
    schedules: list[DrType.Schedule] = []


class Doctor(DrEssentials, DrSecondaries):
    pass
