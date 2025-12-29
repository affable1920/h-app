from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_serializer

from app.config import Mode


# providing a default value -> field optional
# providing a default value but also using field for certain constraints -> field optional
# All three below are optional


FILTERS = Literal["specialization", "mode", "rating", "distance", "location"]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    page: int = Field(default=1, gt=0)
    max: int = Field(default=10, gt=0, lt=25)

    sort_by: str | None = Field(default="fullname", alias="sortBy")
    sort_order: SortOrder | None = Field(default=SortOrder.ASC, alias="sortOrder")

    @property
    def offset(self):
        return (self.page - 1) * (self.max or 10)


class FilterParams(BaseModel):
    specialization: str | None = None
    mode: Literal[Mode.ONLINE] | None = None
    currently_available: bool = Field(default=False, alias="currentlyAvailable")

    search_query: str | None = Field(default=None, alias="searchQuery")
    max_distance: int | None = Field(gt=0, default=None, alias="maxDistance")
    min_rating: Annotated[
        int | None, Field(gt=0, le=5, default=None, alias="minRating")
    ]

    @field_serializer("specialization")
    def serialize(self, spec: str):
        return spec.lower() if spec else None
