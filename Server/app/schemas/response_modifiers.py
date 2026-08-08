from enum import Enum
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, PlainSerializer

from app.schemas.Base import Aliased, snake_to_camel
from app.schemas.enums import Gender


class SortOrder(Enum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(Aliased):
    page: int = Field(default=1, gt=0)
    max: int = Field(default=10, gt=0, lt=25)
    sort_by: str | None = None
    sort_order: SortOrder | None = Field(default=None)

    @property
    def offset(self):
        return (self.page - 1) * (self.max)


class BaseFilters(Aliased):
    search_query: str | None = None
    min_rating: float | None = None
    max_distance: int | None = None


class DrRouteFilters(BaseFilters):
    consults_online: Literal["1"] | None = None
    currently_available: Literal["1"] | None = None
    specialization: Annotated[
        str | None,
        PlainSerializer(
            func=lambda s: s.lower() if s else None, return_type=str
        )
    ] = None

    experience: int | None = Field(default=None, gt=0)
    fee: int | None = None
    gender: Gender | None = None


class ClinicRouteFilters(BaseFilters):
    facilities: list[str] | None = None
