from enum import Enum
from fastapi import Depends
from fastapi import APIRouter
from fastapi.routing import APIRouter


from app.models.QueryParams import DrQueryParams
from app.services.dr_service import DoctorHelper, doctor_service
from app.models.doctor_models.Doctor import Doctor, DoctorSummary
from app.models.Responses import DrScheduleData, RouteResponse, SlotRecord


base_route = "/doctors"
tags: list[str | Enum] = ['doctors']

router = APIRouter(prefix=base_route, tags=tags)


@router.get("", tags=tags, response_model=RouteResponse[DoctorSummary])
async def get_doctors(params: DrQueryParams = Depends()):
    return doctor_service.get(**params.model_dump(exclude_none=True, exclude_unset=True))


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: str):
    return doctor_service.get_by_id(id)


@router.post("/{id}/book", response_model=SlotRecord)
async def book_schedule(data: DrScheduleData, helper: DoctorHelper = Depends()):
    return helper.book(data.schedule_id, data.slot_id,
                       patient_contact=data.patient_contact, patient_name=data.patient_name)


day_map = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
}
