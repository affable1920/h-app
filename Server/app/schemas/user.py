from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr

ROLE = Literal["doctor", "patient", "admin", "clinic", "guest", "ADMINISTRATOR", "user"]


class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class ResponseUser(BaseModel):
    id: str
    username: str
    role: ROLE = "guest"

    model_config = ConfigDict(from_attributes=True)
