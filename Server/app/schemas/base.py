from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


def snake_to_camel(field_name: str) -> str:
    """Convert internal snake_case names to the JSON camelCase contract."""
    head, *tail = field_name.split("_")
    return head + "".join(part.title() for part in tail)


class ApiSchema(BaseModel):
    """Base for every API model, both requests and responses."""

    model_config = ConfigDict(
        alias_generator=snake_to_camel,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class StrictRequest(ApiSchema):
    """Request payload that rejects fields outside its public contract."""

    model_config = ConfigDict(extra="forbid")


class ORMResponse(ApiSchema):
    """Response model that can read attributes from SQLAlchemy instances."""

    model_config = ConfigDict(from_attributes=True)


class EntityResponse(ORMResponse):
    """Common response base for persisted entities."""

    id: Annotated[
        UUID,
        Field(description="The unique identifier of the record."),
    ]
