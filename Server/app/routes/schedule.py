from enum import Enum
from pydantic import BaseModel
from fastapi import APIRouter, Body, Depends, Query

from app.services.dr_service import DoctorHelper, doctor_service

base_route = "/schedule"
tags: list[str | Enum] = ["schedule"]

router = APIRouter(prefix=base_route, tags=tags)


class DrScheduleData(BaseModel):
    slot_id: str
    clinic_id: str


@router.get("{id}")
async def get_schedules(id: str):
    pass
