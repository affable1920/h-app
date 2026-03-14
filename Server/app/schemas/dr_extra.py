from sqlite3 import Time
from uuid import UUID
from typing import Annotated
from pydantic import EmailStr, Field

from app.shared.enums import Mode
from app.schemas.base import ContactMixin, FromORM, IDMixin


class Clinic(FromORM, IDMixin, ContactMixin):
    name: str

    email: EmailStr
    username: str
    owner_name: str

    address: str
    facilities: list[str]
    pincode: int
    reviews: int = Field(default=0)
    rating: float


class Slot(FromORM, IDMixin):
    duration: int
    booked: bool = False
    mode: Mode | None = None
    begin: Annotated[Time, Field(..., description="The slot start time")]


class Schedule(FromORM, IDMixin):
    """
    use datetime as main schedule date getter if doctors
    don't seem to have a fixed schedule, else better off with weekdays
    """

    weekdays: list[int]

    is_active: bool
    is_recurring: bool

    clinic_id: UUID
    doctor_id: UUID

    clinic: Clinic | None = None

    slots: list[Slot]

    start_time: Time
    hours_available: int | None = Field(default=None)
    end_time: Time
