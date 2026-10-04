from enum import StrEnum
from typing import Annotated, Generic, Literal, Sequence, TypeVar

from pydantic import BaseModel, Field, PlainSerializer

from app.schemas.base import ApiSchema
from app.schemas.enums import Gender


T = TypeVar("T")


class PaginatedResponse(ApiSchema, Generic[T]):
    entities: list[T] | Sequence[T]
    count: int
    has_next: bool | None = None


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(ApiSchema):
    page: int = Field(default=1, gt=0)
    max: int = Field(default=10, gt=0)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.max


class SortParams(BaseModel):
    column: Annotated[str | None, Field(alias="sortColumn")] = None
    order: Annotated[SortOrder, Field(alias="sortOrder")] = SortOrder.ASC


class BaseFilters(ApiSchema):
    search_query: str | None = None
    min_rating: float | None = None
    max_distance: int | None = None


class DrRouteFilters(BaseFilters):
    consults_online: Literal["1"] | None = None
    currently_available: Literal["1"] | None = None
    verified: Literal["1"] | None = None
    specialization: Annotated[
        str | None,
        PlainSerializer(
            func=lambda value: value.lower() if value else None,
            return_type=str,
        ),
    ] = None

    experience: Annotated[int | None, Field(gt=0)] = None
    fee: Annotated[int | None, Field(gt=0)] = None
    gender: Gender | None = None


class ClinicRouteFilters(BaseFilters):
    facilities: list[str] | None = None
