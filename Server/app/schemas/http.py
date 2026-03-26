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
    model_validator,
)

from app.schemas.base import FromORM, IDMixin
from app.schemas.dr_extra import Slot
from app.shared.enums import AppointmentStatus, UserRole


T = TypeVar("T")

"""
This module has all pydantic models to be used for http rqsts and responses.
"""


IDSerialized = Annotated[UUID, PlainSerializer(
    func=lambda x: str(x), return_type=str)]


class Appointment(FromORM, IDMixin):
    patient_id: IDSerialized | None
    slot: Slot
    scheduled_date: datetime

    guest_name: str | None
    guest_contact: int | None

    created_at: datetime
    status: AppointmentStatus


# Incoming
class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class BookingRequestData(FromORM):
    scheduled_date: Annotated[datetime, Field(alias="date")]

    doctor_id: Annotated[UUID, Field(alias="doctorId")]
    slot_id: Annotated[UUID, Field(alias="slotId")]

    patient_id: Annotated[UUID | None, Field(default=None, alias="patientId")]
    guest_name: Annotated[
        str | None,
        Field(
            default=None,
            alias="name",
            description="the patient's name, originally None, a string specifically for a non-existing user.",
        ),
    ]

    guest_contact: Annotated[
        str | None, Field(default=None, min_length=10,
                          max_length=10, alias="contact")
    ]

    @model_validator(mode="after")
    def check_patient(self):
        """
        Either the patient_id or guest_details required
        """
        if not self.patient_id and not self.guest_name:
            raise ValueError("either log in or mention your name and contact.")

        return self


# Outgoing
class PaginatedResponse(BaseModel, Generic[T]):
    """same GET response for clinics and doctors"""

    entities: list[T]

    # has more boolean val for pagination
    count: int
    has_next: bool | None = None
    has_prev: bool = False


class ResponseUser(FromORM, IDMixin):
    """
    this class is purely for http responses so when creating a model using this class,
    it's safe to exclude the password even before creating this model as this model as nothing to
    do with our database
    """
    username: str
    email: EmailStr
    role: UserRole


class ResponsePtnt(ResponseUser):
    appointments: list[Appointment] = []


class ResponseDr(ResponseUser):
    pass


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


# Websocket communication


class MsgType(str, enum.Enum):
    JOIN = "join"
    ACK = "acknowledgement"
    OFFER = "offer"
    ANSWER = "answer"
    USER_LEFT = "user-left"
    OFFER_DECLINE = "offer-decline"
    ICE = "ice-candidate"
    TEXT = "text"
    OFFLINE = "offline"
    BROADCAST = "broadcast"


class Metadata(BaseModel):
    to_: Annotated[str, Field(alias="to")]
    # Annotated[
    #     UUID,
    #     Field(serialization_alias="to"),
    #     PlainSerializer(serialize, str, when_used="always"),
    # ]
    from_: Annotated[UUID | None, PlainSerializer(
        func=lambda x: str(x)), Field(alias="from")]


class WS_Message(BaseModel):
    msg_type: MsgType = Field(alias="type")
    payload: Any
    metadata: Metadata | None = None

    model_config = ConfigDict(
        extra="allow",
        from_attributes=True,
        use_enum_values=True,
        serialize_by_alias=True,
    )
