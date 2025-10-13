from datetime import datetime
from typing import Annotated
from uuid import uuid4
from . import DoctorExtraTypes as DrType
from pydantic import BaseModel, EmailStr, Field


class DrEssentials(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    email: EmailStr
    credentials: str
    primary_specialization: str


class DrSecondaries(BaseModel):
    status: str
    fee: DrType.Fee

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
    last_updated: Annotated[str | None, Field(default=None)]
    next_available: Annotated[str | None, Field(default=None)]

    office: DrType.Clinic | None = None
    schedules: list[DrType.Schedule] = []


class Doctor(DrEssentials, DrSecondaries):
    pass
