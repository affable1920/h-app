from uuid import uuid4
from pydantic import BaseModel, Field, field_serializer


class Clinic(BaseModel):
    name: str
    fee: int
    address: str
    contact: str
    day_time: list[str]
    whats_app: str | int | None = None
    location: dict[str, int] | None = None


class Doctor(BaseModel):
    id: str = Field(default=str(uuid4()))
    name: str
    fee: int
    status: str | None = None
    rating: int | float
    reviews: int
    contact: str | None = None
    clinics: list[Clinic]
    verified: bool = False
    last_updated: int
    online_consult: bool
    booking_enabled: bool
    avg_consult_time: int
    queued_patients: int | None = None
    primary_specialization: str
    secondary_specializations: list[str]
    credentials: str
    experience: int | None = None
    next_available: str | None = None
    currently_available: bool
    waiting_time: str | int | None = None
    office: dict[str, str]
