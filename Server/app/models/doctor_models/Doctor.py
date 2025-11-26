from uuid import uuid4
from typing import Annotated
from datetime import datetime

from . import DoctorExtraTypes as DrType
from pydantic import BaseModel, EmailStr, Field

from app.models.BaseModel import BaseModelConfig


def generate_id():
    return uuid4().hex


class DrEssentials(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    email: EmailStr
    credentials: str
    primary_specialization: str


class DrSecondaries(BaseModelConfig):
    fee: DrType.Fee
    status: DrType.Status

    verified: bool = False
    reviews: int = 0
    rating: int | float = 0.0

    consults_online: bool = False
    booking_enabled: bool = False

    base_fee: int
    base_consult_time: int | None = None

    experience: int | None = None
    secondary_specializations: list[str] = []

    currently_available: bool = False
    last_updated: Annotated[datetime | None, Field(default=None)]
    next_available: Annotated[datetime | None, Field(default=None)]

    office: DrType.Clinic | None = None
    schedules: list[DrType.Schedule] = []

    # Flexible metadata for future flags without breaking changes
    metadata: dict = Field(
        default_factory=dict, description="Extensible metadata for future flags and settings")


class Doctor(DrEssentials, DrSecondaries):
    pass


class DoctorSummary(DrEssentials, BaseModelConfig):
    """Lightweight doctor model for list views - excludes schedules/slots"""
    fee: DrType.Fee
    status: DrType.Status
    verified: bool = False
    reviews: int = 0
    rating: int | float = 0.0
    consults_online: bool = False
    experience: int | None = None
    currently_available: bool = False
    next_available: Annotated[datetime | None, Field(default=None)]
