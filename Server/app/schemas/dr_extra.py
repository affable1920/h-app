from enum import Enum
from uuid import uuid4
from typing import Annotated
from datetime import time, date
from pydantic import Field, BaseModel


def generate_id():
    return uuid4().hex


class Status(str, Enum):
    AWAY = "away"
    AVAILABLE = "available"
    IN_PATIENT = "in_patient"


class Fee(BaseModel):
    in_person: int = Field(gt=0)
    online: int | None = Field(gt=0, default=None)


class Location(BaseModel):
    lat: float
    lng: float


class Clinic(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    contact: str
    address: str
    facilities: list[str] = []
    location: Location | None = None
    whatsapp: str | None = None
    reviews: int | None = None
    rating: int | float = 0.0
    parking_available: bool = False


class Slot(BaseModel):
    id: str = Field(default_factory=generate_id)
    duration: int
    booked: bool = False
    mode: str | None = None
    begin: Annotated[time, Field(..., description="The slot start time")]


class Schedule(BaseModel):
    """

    use datetime as main schedule date getter if doctors
    don't seem to have a fixed schedule, else better off with weekdays

    """

    id: str = Field(default_factory=lambda: generate_id())

    dated: date | None = None
    weekday: int

    is_active: bool = True
    is_recurring: bool = True

    clinic: Clinic
    slots: list[Slot]

    # Use time objects for start/end later
    start: time = Field(...)
    hours_available: int | None = None
    end: time | None = Field(default=None)
