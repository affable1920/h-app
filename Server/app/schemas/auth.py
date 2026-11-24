from typing import Annotated, Literal, Self

from pydantic import (
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)

from app.schemas.types import Email, Password
from app.schemas.base import ApiSchema, StrictRequest
from app.schemas.enums import UserRoleV2
from uuid import UUID


TokenType = Literal["access", "refresh"]


class AccessToken(ApiSchema):
    id: UUID
    exp: float
    iat: float
    role: UserRoleV2
    token_type: TokenType = "access"

    model_config = ConfigDict(use_enum_values=True)


class ForgottenPasswordBody(StrictRequest):
    email: Email


class ResetPasswordBody(StrictRequest):
    token: str
    password: Password
    confirm_password: Password

    @model_validator(mode="after")
    def do_password_match(self) -> "Self":
        if not (
            self.password == self.confirm_password
        ):
            raise ValueError("Passwords must match ..")
        return self
