from enum import Enum
from fastapi import Depends
from typing import Annotated
from fastapi.routing import APIRouter


from app.models.Responses import RouteResponse
from app.models.doctor_models.Doctor import Doctor
from app.models.QueryParams import QueryParameters
from app.services.dr_service import doctor_service


base_route = "/doctors"
tags: list[str | Enum] = ['doctors']

router = APIRouter(prefix=base_route, tags=tags)


@router.get("", response_model=RouteResponse[Doctor])
async def get_doctors(params: Annotated[QueryParameters, Depends()]):
    return doctor_service.get_doctors(**params.model_dump(exclude_none=True, exclude_unset=True))


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: str):
    return doctor_service.get_doctor_by_id(id)
