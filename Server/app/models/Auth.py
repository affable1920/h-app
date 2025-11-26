from uuid import uuid4
from datetime import datetime
from typing import Annotated, Literal
from pydantic import BaseModel, EmailStr, Field
from app.models.BaseModel import BaseModelConfig

ROLE = Literal["doctor", "patient", "admin",
               "clinic", "guest", "ADMINISTRATOR"]


class CreateUser(BaseModel):
    username: str
    email: EmailStr
    pwd: str


class LoginUser(BaseModel):
    username: str
    pwd: str


class DBUser(BaseModelConfig):
    # role: ROLE = "guest"
    id: Annotated[str, Field(default_factory=lambda: uuid4().hex)]
    username: str
    email: EmailStr
    pwd: str
    created_at: Annotated[datetime, Field(default_factory=datetime.now)]


class ResponseUser(BaseModelConfig):
    username: str
    email: EmailStr
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
