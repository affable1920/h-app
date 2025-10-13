from uuid import uuid4
from typing import Annotated
from pydantic import Field, BaseModel


def generate_id():
    return str(uuid4())


class Fee(BaseModel):
    online: int = Field(gt=0)
    in_person: int = Field(gt=0)


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


class Slot(BaseModel):
    id: str = Field(default_factory=lambda: generate_id())
    begin: Annotated[str | None, Field(default=None)]
    duration: int
    booked: bool = False
    mode: str | None = None


class Schedule(BaseModel):
    weekday: str
    slots: list[Slot]
    clinic: Clinic | None = None
    # Use time objects for start/end
    end: str | None = Field(default=None)
    start: str | None = Field(default=None)
    hours_available: int | None = None
