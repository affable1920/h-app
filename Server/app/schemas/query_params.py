from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field, PlainSerializer, field_serializer


ALLOWED_SORT_COLS = Literal["rating", "reviews", "experience", "fee", "name"]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    page: int = Field(default=1, gt=0)
    max: int = Field(default=10, gt=0, lt=25)

    sort_by: ALLOWED_SORT_COLS | None = Field(default="name", alias="sortBy")
    sort_order: SortOrder | None = Field(
        default=SortOrder.ASC, alias="sortOrder")

    @property
    def offset(self):
        return (self.page - 1) * (self.max or 10)
#
#


class BaseFilters(BaseModel):
    search_query: Annotated[str | None, Field(
        default=None, alias="searchQuery")]
    min_rating: Annotated[float | None, Field(
        default=None, alias="minRating", gt=0, le=5.0)]
    max_distance: Annotated[int | None, Field(
        default=None, alias="maxDistance", gt=0)]


class DrRouteFilters(BaseFilters):
    consults_online: Literal["1"] | None = None
    currently_available: Literal["1"] | None = Field(
        default=None, alias="currentlyAvailable")

    specialization: Annotated[str | None, PlainSerializer(
        func=lambda s: s.lower() if s else None, return_type=str), Field(default=None)]

    @field_serializer("specialization")
    def serialize(self, spec: str):
        return spec.lower() if spec else None


class ClinicRouteFilters(BaseFilters):
    facilities: Annotated[list[str] | None, Field(default=None)]
