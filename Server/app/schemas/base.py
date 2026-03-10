from typing import Annotated
from uuid import UUID
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
)


class FromORM(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")


class ContactMixin(BaseModel):
    contact: Annotated[str, Field(max_length=10, min_length=10)]
    whatsapp: Annotated[str | None, Field(max_length=10, min_length=10)]


class IDMixin(BaseModel):
    id: Annotated[
        UUID,
        Field(description="the unique identifier of the record"),
        PlainSerializer(func=lambda x: str(x), return_type=str),
    ]
