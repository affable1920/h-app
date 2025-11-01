from pydantic import BaseModel
from typing import Generic, TypeVar


T = TypeVar("T")


""" same GET response for clinics and doctors """


class RouteResponse(BaseModel, Generic[T]):
    data: list[T]
    curr_count: int
    total_count: int
