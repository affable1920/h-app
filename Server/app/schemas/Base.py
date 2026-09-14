from typing import Annotated
from uuid import UUID
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


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


class Aliased(BaseModel):
    model_config = ConfigDict(
        alias_generator=snake_to_camel,
        validate_by_name=True,
        serialize_by_alias=True
    )


class FromORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IDMixin(BaseModel):
    id: Annotated[
        UUID,
        Field(description="the unique identifier of the record"),
    ]
