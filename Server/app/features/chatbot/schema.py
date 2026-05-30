import enum

from pydantic import ConfigDict
from app.schemas.Base import FromORM


class Role(enum.Enum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"
    DEVELOPER = "developer"


class BaseChatMessage(FromORM):
    role: Role
    content: str

    model_config = ConfigDict(use_enum_values=True)


#

class MessageRequest(BaseChatMessage):
    role: Role = Role.USER


#


class MessageResponse(BaseChatMessage):
    pass
