from typing import Literal
from pydantic import BaseModel, EmailStr

ROLE = Literal["doctor", "patient", "admin", "clinic", "guest", "ADMINISTRATOR"]


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

    model_config = {
        "from_attributes": True,
    }
