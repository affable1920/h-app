from pydantic import BaseModel
from typing import Generic, TypeVar


T = TypeVar("T")


class RouteResponse(BaseModel, Generic[T]):
    data: list[T]
    curr_count: int
    total_count: int
