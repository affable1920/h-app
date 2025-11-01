from datetime import datetime, time
from enum import Enum
from uuid import uuid4
from typing import Annotated
from pydantic import Field, BaseModel

from app.models.BaseModel import BaseModelConfig


def generate_id():
    return str(uuid4())


class Status(str, Enum):
    AWAY = "away"
    BUSY = "busy"
    UNKNOWN = "unknown"
    AVAILABLE = "available"


class Fee(BaseModel):
    in_person: int = Field(gt=0)
    online: int | None = Field(gt=0, default=None)


class Location(BaseModel):
    lat: float
    lng: float


class Clinic(BaseModel):
    id: str = Field(default_factory=lambda: generate_id())
    name: str
    contact: str
    address: str
    facilities: list[str] = []
    location: Location | None = None
    whatsapp: str | None = None
    parking_available: bool = False


class Slot(BaseModelConfig):
    id: str = Field(default_factory=lambda: generate_id())
    begin: Annotated[time | None, Field(
        default=None, description="The slot start time")]
    duration: int
    booked: bool = False
    mode: str | None = None


class Schedule(BaseModelConfig):
    """

    use datetime as main schedule date getter if doctors 
    don't seem to have a fixed schedule, else better off with weekdays

    """
    weekday: int
    slots: list[Slot]
    date: datetime | None = None
    clinic: Clinic | None = None

    # Use time objects for start/end later
    end: time | None = Field(default=None)
    start: time | None = Field(default=None)
    hours_available: int | None = None
