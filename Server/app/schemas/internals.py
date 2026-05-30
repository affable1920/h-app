from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, Field, PlainSerializer


ALLOWED_SORT_COLS = Literal["rating", "reviews", "experience", "fee", "name"]


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    page: int = Field(default=1, gt=0)
    max: int = Field(default=10, gt=0, lt=25)

    sort_by: ALLOWED_SORT_COLS | None = Field(default="name", alias="sortBy")
    sort_order: SortOrder | None = Field(
        default=SortOrder.ASC,
        alias="sortOrder"
    )

    @property
    def offset(self):
        return (self.page - 1) * (self.max or 10)
#
#


class BaseFilters(BaseModel):
    search_query: Annotated[str | None, Field(alias="searchQuery")] = None
    min_rating: Annotated[float | None, Field(
        alias="minRating", gt=0, le=5.0)] = None
    max_distance: Annotated[int | None, Field(
        alias="maxDistance", gt=0)] = None


class DrRouteFilters(BaseFilters):
    consults_online: Annotated[Literal["1"] |
                               None, Field(alias="consultsOnline")] = None
    currently_available: Annotated[Literal["1"] |
                                   None, Field(alias="currentlyAvailable")] = None
    specialization: Annotated[str | None, PlainSerializer(
        func=lambda s: s.lower() if s else None, return_type=str)] = None
    experience: int | None = None


class ClinicRouteFilters(BaseFilters):
    facilities: list[str] | None = None
