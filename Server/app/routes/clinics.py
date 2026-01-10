from enum import Enum
from fastapi import APIRouter

from app.schemas.dr_extra import Clinic
from app.schemas.http import PaginatedResponse
from app.services.clinic_service import service as clinic_service


base_route = "/clinics"
tags: list[str | Enum] = ["clinics"]

router = APIRouter(prefix=base_route, tags=tags)


@router.get("", response_model=PaginatedResponse[Clinic])
async def get_clinics():
    return clinic_service.get_clinics()


@router.get("/{clinic_id}")
async def get_clinic(id: str):
    return clinic_service.get_clinic_by_id(id)
