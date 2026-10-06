from pydantic import ConfigDict

from app.schemas.base import ApiSchema
from app.schemas.enums import UserRoleV2
from uuid import UUID


class AuthHdrPayload(ApiSchema):
    id: UUID
    exp: float
    iat: float
    role: UserRoleV2

    model_config = ConfigDict(use_enum_values=True)
