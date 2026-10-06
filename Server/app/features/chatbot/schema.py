import enum
from typing import Self

from pydantic import ConfigDict, model_validator
from app.schemas.base import ORMResponse


class Role(str, enum.Enum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"
    TOOL = "tool"


class BaseChatMessage(ORMResponse):
    role: Role
    content: str


class MessageResponse(BaseChatMessage):
    pass
