from enum import Enum
from typing import Annotated
from pydantic import BaseModel, Field, field_validator


# providing a default value -> field optional
# providing a default value but also using field for certain constraints -> field optional
# All three below are optional

class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class StatusOrder(Enum):
    AVAILABLE = 0
    BUSY = 1
    AWAY = 2
    UNKNOWN = 3


class QueryParameters(BaseModel):
    max: int = Field(ge=1, default=5)
    page: Annotated[int, Field(ge=1, default=1)]

    search_query: str | None = Field(default=None, alias="searchQuery")
    sort_by: tuple[str, SortOrder] | None = ("name", SortOrder.ASC)

    @field_validator("search_query")
    @classmethod
    def strip_lower_sq(cls, sq: str) -> str | None:
        return sq.strip().lower() if sq else None
