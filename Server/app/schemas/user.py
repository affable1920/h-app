from typing import Self

from pydantic import model_validator

from app.schemas.base import EntityResponse
from app.schemas.types import Email


class UserResponse(EntityResponse):
    email: Email
    name: str | None = None
    username: str | None = None

    @model_validator(mode="after")
    def validate_identity(self) -> Self:
        if self.name is None and self.username is None:
            raise ValueError("A user response requires a name or username.")
        return self
