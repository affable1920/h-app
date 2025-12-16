from enum import Enum
from pydantic import BaseModel, ConfigDict, EmailStr


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


class ResponseUser(BaseModel):
    id: str
    username: str
    model_config = ConfigDict(from_attributes=True)
