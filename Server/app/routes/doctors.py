from time import time
from fastapi import Depends
from pydantic import BaseModel
from fastapi.routing import APIRouter


from app.models.doctorModel.Doctor import Doctor
from app.models.QueryParams import QueryParameters
from app.services.doctorService import doctor_service


router = APIRouter(prefix="/doctors", tags=["doctors"])


class DoctorResponse(BaseModel):
    doctors: list[Doctor]
    curr_count: int
    total_count: int


@router.get("", response_model=DoctorResponse)
async def get_doctors(params: QueryParameters = Depends()):
    try:
        response = doctor_service.get_doctors(params)
        return response

    except Exception as e:
        print(f"Exception in doctors route\n{e}")


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: str):
    return doctor_service.get_doctor_by_id(id)
#
