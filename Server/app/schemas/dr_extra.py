from sqlite3 import Time
from uuid import UUID
from typing import Annotated
from pydantic import ConfigDict, Field, BaseModel

from app.config import Mode


class Clinic(BaseModel):
    id: UUID
    head: str
    name: str
    owner_name: str

    address: str
    facilities: list[str] = []
    contact: str = Field(alias="mobile")

    whatsapp: str | None = None
    reviews: int | None = None
    rating: int | float = 0.0

    parking_available: bool = False

    model_config = ConfigDict(from_attributes=True)


class Slot(BaseModel):
    id: UUID
    duration: int

    booked: bool = False
    mode: Mode | None = None

    begin: Annotated[Time, Field(..., description="The slot start time")]
    model_config = ConfigDict(from_attributes=True)


class Schedule(BaseModel):
    """

    use datetime as main schedule date getter if doctors
    don't seem to have a fixed schedule, else better off with weekdays

    """

    id: UUID

    weekdays: list[int]

    is_active: bool = True
    is_recurring: bool = True

    clinic_id: UUID
    doctor_id: UUID

    slots: list[Slot]

    start: Time = Field(...)
    hours_available: int | None = Field(default=None)
    end: Time | None = Field(default=None)

    model_config = ConfigDict(from_attributes=True)
