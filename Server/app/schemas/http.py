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
    patient_id: IDSerialized
    slot: Slot
    scheduled_date: datetime

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


# Outgoing
class PaginatedResponse[T](BaseModel):
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


class Payload(IDMixin):
    id: IDSerialized
    exp: float
    iat: float
    role: UserRole
    token_type: str = "access"

    model_config = ConfigDict(use_enum_values=True)


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
