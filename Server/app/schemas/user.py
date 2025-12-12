from uuid import uuid4
from datetime import datetime
from typing import Annotated, Literal
from pydantic import BaseModel, EmailStr, Field

ROLE = Literal["doctor", "patient", "admin",
               "clinic", "guest", "ADMINISTRATOR"]


class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class DBUser(BaseModel):
    # role: ROLE = "guest"
    id: str = Field(default_factory=lambda: uuid4().hex)
    username: str
    email: EmailStr
    password: str
    created_at: Annotated[str, Field(
        default_factory=lambda: datetime.now().isoformat())]


class ResponseUser(DBUser):
    model_config = {
        "from_attributes": True,
    }
