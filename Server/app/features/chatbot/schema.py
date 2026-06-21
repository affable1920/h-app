import enum
from typing import Self

from pydantic import ConfigDict, model_validator
from app.schemas.Base import FromORM


class Role(str, enum.Enum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"
    TOOL = "tool"


class BaseChatMessage(FromORM):
    role: Role
    content: str


class MessageResponse(BaseChatMessage):
    pass
