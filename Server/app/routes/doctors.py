from enum import Enum
from fastapi import Depends, APIRouter


from app.schemas.query_params import DrQueryParams
from app.schemas.doctor import Doctor, DoctorSummary
from app.services.dr_service import DoctorHelper, DoctorService
from app.schemas.responses import DrScheduleData, RouteResponse, SlotRecord


base_route = "/doctors"
tags: list[str | Enum] = ["doctors"]

dr_service = DoctorService()
router = APIRouter(prefix=base_route, tags=tags)


@router.get("", response_model=RouteResponse[DoctorSummary])
async def get_doctors(params: DrQueryParams = Depends()):
    return dr_service.get(params)


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: str):
    return dr_service.get_by_id(id)


@router.post("/{id}/book", response_model=SlotRecord)
async def book_schedule(data: DrScheduleData, helper: DoctorHelper = Depends()):
    items = data.model_dump(exclude={"clinic_id"})

    record = await helper.book(**items)
    return record
