from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.services.AppointmentService import AppointmentService
from app.services.PatientService import PatientService
from app.schemas.patient import PatientProfileResponse
from app.features.auth.dependencies import require_patient
from app.database.models import Appointment, Patient
from app.schemas.appointment import AppointmentPatientResponse
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.database.entry_async import get_db


router = APIRouter(
    prefix="/patients/me",
    tags=["Patients"],
)


@router.get(
    path="",
    response_model=PatientProfileResponse
)
async def get_patient_profile(
    patient: Patient = Depends(require_patient)
):
    return patient


@router.get(
    "/appointments",
    response_model=PaginatedResponse[AppointmentPatientResponse]
)
async def get_patient_appointments(
    session: AsyncSession = Depends(get_db),
    patient: Patient = Depends(require_patient),
    pagination_params: PaginationParams = Depends()
):
    count, objs = await PatientService.get_appointments(
        patient_id=patient.id,
        session=session
    )

    return PatientService.create_pg_response(
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
        loader_opts=[
            joinedload(Appointment.doctor),
            joinedload(Appointment.slot),
            joinedload(Appointment.care_journey),
            joinedload(Appointment.clinic)
        ],
    )

    return appointment
