from enum import Enum
import enum
from uuid import UUID
from datetime import datetime
from typing import Annotated, Any, Generic, TypeVar
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    PlainSerializer,
    field_serializer,
    model_serializer,
    model_validator,
)

from app.schemas.doctor import Doctor
from app.schemas.dr_extra import Slot
from app.shared.schemas import AppointmentStatus


T = TypeVar("T")

"""
This module has all pydantic models to be used for http rqsts and responses.
"""


def serialize(val: UUID) -> str:
    return str(val)


class UserRole(Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC_ADMIN = "clinic_admin"
    GUEST = "guest"


class Appointment(BaseModel):
    id: Annotated[UUID, PlainSerializer(serialize, str, when_used="unless-none")]
    doctor: Doctor
    patient_id: Annotated[UUID | None, PlainSerializer(serialize, str)]

    slot: Slot
    date: datetime

    guest_name: str | None
    guest_contact: int | None

    created_at: datetime
    status: AppointmentStatus

    # permits extra fields from sqlalchemy models
    model_config = ConfigDict(from_attributes=True, extra="allow")


# Incoming
class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class BookingRequestData(BaseModel):
    date: datetime
    patient_id: Annotated[
        UUID | None,
        Field(
            default=None,
            alias="patientId",
            description="the id of a existing user in our db if logged in.",
        ),
    ]

    email: EmailStr | None = None

    guest_name: Annotated[
        str | None,
        Field(
            default=None,
            alias="name",
            description="the patient's name, originally None, a string for a non-existing user.",
        ),
    ]

    guest_contact: Annotated[
        str | None, Field(default=None, min_length=10, max_length=10, alias="contact")
    ]

    slot_id: Annotated[UUID, Field(alias="slotId")]

    schedule_id: Annotated[UUID, Field(alias="scheduleId")]
    clinic_id: Annotated[UUID | None, Field(default=None, alias="clinicId")]

    @model_validator(mode="after")
    def check_patient(self):
        """
        Either the patient_id or guest_details required
        """

        is_guest = self.guest_contact and self.guest_name
        if not self.patient_id and not is_guest:
            raise ValueError("either log in or mention your name and contact.")

        return self


# Outgoing
class PaginatedResponse(BaseModel, Generic[T]):
    """same GET response for clinics and doctors"""

    entities: list[T]

    # has more boolean val for pagination
    has_next: bool
    has_prev: bool = False

    total_count: int
    paginated_count: int


class ResponseUser(BaseModel):
    """
    this class is purely for http responses so when creating a model using this class,
    it's safe to exclude the password even before creating this model as this model as nothing to
    do with our database
    """

    username: str
    email: EmailStr

    id: Annotated[UUID, PlainSerializer(serialize, str)]
    appointments: list[Appointment] = []

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    def check_pwd_in_response(cls, data: dict):
        """Remove password from response data before model creation & return"""
        if isinstance(data, dict) and "password" in data:
            data.pop("password")
        return data


class Payload(BaseModel):
    sub: UUID = Field(alias="id")
    exp: float
    iat: float

    email: str | None = None
    token_type: str = "access"

    model_config = ConfigDict()

    @field_serializer("sub", return_type=str, when_used="always")
    def serialize_uuid(self, val: UUID):
        return str(val) if str else None


class MsgType(enum.Enum):
    USER_JOIN = "user_join"
    OFFER = "offer"
    ANSWER = "answer"
    USER_LEFT = "user_left"
    OFFER_DECLINE = "offer_decline"


class Message(BaseModel):
    msg: str
    to: Annotated[str | UUID, PlainSerializer(serialize, str)]
    data: Any
    msg_type: MsgType = Field(alias="msgType")

    model_config = ConfigDict(use_enum_values=True)

    # @model_serializer()
    # def serialize_model(self):
    #     return self.model_dump(mode="json")
