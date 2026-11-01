from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.AppointmentService import AppointmentService
from app.services.PatientService import PatientService
from app.features.auth.dependencies import require_patient
from app.database.models import Patient
from app.schemas.appointment import AppointmentFilters, AppointmentPatientResponse
from app.schemas.pagination import PaginatedResponse, PaginationParams, SortParams
from app.database.entry_async import get_db


router = APIRouter(
    prefix="/patients/me",
    tags=["Patients"],
)


@router.get(
    "/appointments",
    response_model=PaginatedResponse[AppointmentPatientResponse]
)
async def get_patient_appointments(
    session: AsyncSession = Depends(get_db),
    patient: Patient = Depends(require_patient),
    pagination_params: PaginationParams = Depends(),
    filters: AppointmentFilters = Depends(),
    sort_params: SortParams = Depends()
):
    count, objs = await AppointmentService.get_all_for_participant(
        session=session,
        participant=patient,
        pagination_params=pagination_params,
        filters=filters,
        sort_params=sort_params
    )

    return PatientService.create_paginated_response(
        objs=objs,
        count=count,
        pagination=pagination_params
    )


@router.get(
    "/appointments/{appointment_id}",
    response_model=AppointmentPatientResponse
)
async def get_appointment_for_patient(
    appointment_id: UUID,
    session: AsyncSession = Depends(get_db),
    patient: Patient = Depends(require_patient)
):
    appointment = await AppointmentService.get_for_participant(
        session=session,
        appointment_id=appointment_id,
        participant=patient,
    )

    return appointment
