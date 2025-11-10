from pydantic import BaseModel
from typing import Generic, TypeVar


T = TypeVar("T")


class RouteResponse(BaseModel, Generic[T]):
    """ same GET response for clinics and doctors """
    entities: list[T]

    # has more boolean val for pagination
    has_more: bool

    total_count: int
    paginated_count: int
    applied_filters: list[str]
