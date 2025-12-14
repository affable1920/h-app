from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_serializer


# providing a default value -> field optional
# providing a default value but also using field for certain constraints -> field optional
# All three below are optional


MODES = Literal["online", "offline"]
FILTERS = Literal["specialization", "mode", "rating", "distance", "location"]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class Sort(BaseModel):
    by: str | None = Field(default="name", alias="sortBy")
    order: SortOrder = Field(default=SortOrder.ASC, alias="sortOrder")


class BaseRouteParams(BaseModel):
    sort: Sort = Field(default=Sort())
    search_query: str | None = Field(default=None, alias="searchQuery")

    max: int = Field(default=10, gt=0, lt=25)
    page: int = Field(default=1, gt=0, alias="currPage")

    max_distance: int | None = Field(gt=0, default=None, alias="maxDistance")
    min_rating: Annotated[
        int | None, Field(gt=0, le=5, default=None, alias="minRating")
    ]

    @field_serializer("search_query")
    def strip_lower(self, field: str):
        return field.strip().lower() if field else None


class DrQueryParams(BaseRouteParams):
    specialization: str | None = None
    mode: Literal["online", "in_person"] | None = None
    currently_available: bool = Field(default=False, alias="currentlyAvailable")
