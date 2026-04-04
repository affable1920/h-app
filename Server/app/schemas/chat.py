import enum
from typing import Literal

from pydantic import ConfigDict, Field

from app.schemas.base import FromORM, IDMixin


class Role(enum.Enum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"


class BaseChatMessage(FromORM):
    role: Role
    message: str

    model_config = ConfigDict(use_enum_values=True)


#

class MessageRequest(BaseChatMessage):
    role: Role = Role.USER


#


class MessageResponse(BaseChatMessage):
    pass
