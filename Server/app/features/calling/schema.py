import enum
from typing import Annotated, Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer


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
