import enum
from typing import Any
from pydantic import BaseModel, ConfigDict
from app.schemas.Base import snake_to_camel


class MsgType(str, enum.Enum):
    OFFER = "offer"
    ANSWER = "answer"
    ICE = "ice-candidate"
    USER_LEFT = "user-left"
    OFFLINE = "offline"
    HANG_UP = "hang-up"
    BROADCAST = "broadcast"
    OFFER_DECLINE = "offer-decline"


class Metadata(BaseModel):
    to_: str
    from_: str

    model_config = ConfigDict(
        alias_generator=snake_to_camel
    )


class WS_Message(BaseModel):
    msg_type: MsgType
    payload: Any | None = {}
    metadata: Metadata | None = None

    model_config = ConfigDict(
        extra="allow",
        from_attributes=True,
        use_enum_values=True,
        alias_generator=snake_to_camel,
        validate_by_name=True
    )
