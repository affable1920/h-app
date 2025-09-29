from fastapi import Depends
from fastapi.routing import APIRouter
from app.models.responses import DoctorResponse
from app.models.queryparams import QueryParameters
from app.services.doctorService import doctor_service

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=DoctorResponse)
async def get_docs(params: QueryParameters = Depends()):
    try:
        return doctor_service.get_doctors(**params.model_dump())

    except Exception as e:
        print(e)


@router.get("/{id}")
async def get_doctor(id: str):
    return doctor_service.get_doctor_by_id(id)


@router.get("/{id}/schedule")
async def get_doctor_for_schedule(id: str):
    return f"scheduling request for doctor with id {id} recieved !"

#
