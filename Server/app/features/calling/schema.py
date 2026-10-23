import enum
from typing import Annotated, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.base import snake_to_camel


class WS_Schema(BaseModel):
    model_config = ConfigDict(
        alias_generator=snake_to_camel,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientMessageType(enum.StrEnum):
    INIT = "init"
    OFFER = "offer"
    ANSWER = "answer"
    OFFER_DECLINE = "offer-decline"
    ICE = "ice-candidate"
    HANG_UP = "hang-up"


class ServerMessageType(enum.StrEnum):
    CONFIRMATION = "confirmation"
    ERROR = "error"
    TIMEOUT = "timeout"
    OFFLINE = "offline"
    OFFER = "offer"
    ANSWER = "answer"
    OFFER_DECLINE = "offer-decline"
    ICE = "ice-candidate"
    HANG_UP = "hang-up"


class ClientMetadata(WS_Schema):
    to: UUID
    appointment_id: UUID


class ServerMetadata(WS_Schema):
    from_: Annotated[UUID | None, Field(
        alias="from"
    )] = None

    appointment_id: UUID | None = None


class ClientMessage(WS_Schema):
    msg_type: ClientMessageType
    payload: Any | None = None
    metadata: ClientMetadata


class ServerMessage(WS_Schema):
    msg_type: ServerMessageType
    payload: Any | None = None
    metadata: ServerMetadata | None = None
