from enum import Enum
from fastapi import Depends
from fastapi import APIRouter


from app.schemas.query_params import DrQueryParams
from app.services.dr_service import DoctorHelper, DoctorService
from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.responses import DrScheduleData, RouteResponse, SlotRecord


base_route = "/doctors"
tags: list[str | Enum] = ["doctors"]

dr_service = DoctorService()
router = APIRouter(prefix=base_route, tags=tags)


@router.get("", tags=tags, response_model=RouteResponse[DoctorSummary])
async def get_doctors(params: DrQueryParams = Depends()):
    print(params)
    return dr_service.get(**params.model_dump(exclude_none=True, exclude_unset=True))


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: str):
    return dr_service.get_by_id(id)


@router.post("/{id}/book", response_model=SlotRecord)
async def book_schedule(data: DrScheduleData, helper: DoctorHelper = Depends()):
    items = data.model_dump(exclude={"clinic_id"})

    record = await helper.book(**items)
    return record


day_map = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
}
