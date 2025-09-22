from fastapi.responses import JSONResponse
from pydantic import BaseModel


class BaseResponse(BaseModel):
    status: int
    msg: str | None = None
    details: dict | None = None


class DoctorResponse(BaseModel):
    doctors: list[dict]
    curr_count: int
    total_count: int
