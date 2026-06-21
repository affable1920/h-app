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


class IDMixin(BaseModel):
    id: Annotated[
        UUID,
        Field(description="the unique identifier of the record"),
        PlainSerializer(func=lambda x: str(x), return_type=str),
    ]


IDSerialized = Annotated[
    UUID, PlainSerializer(
        func=lambda x: str(x), return_type=str
    )
]


def snake_to_camel(field_name: str):
    if field_name.find("_") == -1:
        return field_name

    parts = field_name.split("_")

    alias = "".join(
        [
            part if i == 0 else part.title()
            for (i, part) in enumerate(parts)
        ]
    )

    return alias
