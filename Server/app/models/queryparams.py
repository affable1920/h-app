from enum import Enum
from fastapi import Query
from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_serializer


# providing a default value -> field optional
# providing a default value but also using field for certain constraints -> field optional
# All three below are optional


MODES = Literal["online", "offline"]
FILTERS = Literal["specialization", "mode", "rating", "distance", "location"]


class RouteFilters(BaseModel):
    mode: MODES | None = None
    specialization: str | None = None
    currently_available: bool = False
    max_distance: int | None = Field(gt=0, default=None)
    min_rating: Annotated[int | None, Field(gt=0, lt=5, default=None)]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class Sort(BaseModel):
    by: str | None = "name"
    order: SortOrder = SortOrder.ASC


class BaseRouteParams(BaseModel):
    sort: Sort = Query(Sort())
    search_query: str | None = None

    max: int = Query(10, gt=0, lt=25)
    page: int = Query(gt=0, default=1)

    @field_serializer("search_query")
    def strip_lower(self, field: str):
        return field.strip().lower() if field else None


class DrQueryParams(BaseRouteParams):
    specialization: str | None = None
    currently_available: bool = False
    mode: Literal["online", "in_person"] | None = None
