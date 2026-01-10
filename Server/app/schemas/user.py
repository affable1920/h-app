from enum import Enum
from typing import Annotated
from uuid import UUID
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    PlainSerializer,
)


class UserRole(Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC_ADMIN = "clinic_admin"
    GUEST = "guest"


class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str

    # @field_serializer("role")
    # def serialize(self, val: UserRole):
    #     return val.value if val else None


class LoginUser(BaseModel):
    email: EmailStr
    password: str


def serialize(val: UUID):
    return str(val)


class ResponseUser(BaseModel):
    username: str
    email: EmailStr
    id: Annotated[UUID, PlainSerializer(serialize)]

    appointments: list | None = []
    model_config = ConfigDict(from_attributes=True)
