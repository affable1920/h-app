from typing import Literal

from pydantic import ConfigDict

from app.schemas.base import ApiSchema
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
