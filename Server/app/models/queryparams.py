from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_validator


# providing a default value -> field optional
# providing a default value but also using field for certain constraints -> field optional
# All three below are optional


MODES = Literal["online", "offline"]
FILTERS = Literal["specialization", "mode", "rating", "distance", "location"]


class RouteFilters(BaseModel):
    mode: MODES | None = None
    specialization: str | None = None
    distance: int | None = Field(gt=0, default=None)
    rating: Annotated[int | None, Field(gt=0, lt=5, default=None)]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class Sort(BaseModel):
    by: str | None = "name"
    order: SortOrder = SortOrder.ASC


class QueryParameters(RouteFilters, BaseModel):
    max: int = Field(ge=1, default=5)
    page: Annotated[int, Field(ge=1, default=1)]

    search_query: str | None = Field(default=None, alias="searchQuery")
    sort: Sort | None = Sort()

    @field_validator("search_query")
    @classmethod
    def strip_lower_sq(cls, sq: str) -> str | None:
        return sq.strip().lower() if sq else None
