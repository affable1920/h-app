import logging
from typing import Optional
from uuid import UUID
from fastapi import Body, Depends, APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.services.AppointmentService import AppointmentService
from app.services.entities.main import EntityService
from app.database.models import Appointment, Clinic, Doctor
from app.features.auth.dependencies import require_doctor
from app.schemas.appointment import AppointmentDoctorResponse
from app.schemas.clinic import DoctorClinicResponse
from app.schemas.doctor import DoctorHttpFull, DoctorHttpMinimal
from app.schemas.pagination import (
    DrRouteFilters,
    PaginatedResponse,
    PaginationParams,
    SortParams,
)
from app.schemas.schedule import DoctorScheduleResponse
from app.database.entry_async import get_db
from app.services.DrService import DoctorService


logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
    dependencies=[Depends(get_db)]
)

ALLOWED_FIELDS = {
    "name",
    "phone",
    "profile",
    "email"
}


@router.get("", response_model=PaginatedResponse[DoctorHttpMinimal])
async def get_doctors(
    filters: DrRouteFilters = Depends(),
    pagination_params: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    session: AsyncSession = Depends(get_db),
):
    count, objects = await DoctorService.get_all(
        session,
        pagination=pagination_params,
        filters=filters,
        sort=sort
    )

    response = DoctorService.create_pg_response(
        objs=objects,
        count=count,
        pagination=pagination_params
    )

    return response


@router.get(
    "/{doctor_id}",
    response_model=Optional[DoctorHttpFull]
)
async def get_doctor(
    doctor_id: UUID,
    session: AsyncSession = Depends(get_db)
):
    return await DoctorService.get_by_id(
        entity_id=doctor_id,
        session=session
    )


@router.put("/me")
async def edit_doctor(
    q: str = Query(),
    val: str = Body(embed=True),
    session: AsyncSession = Depends(get_db),
    doctor: Doctor = Depends(require_doctor)
):
    if q not in ALLOWED_FIELDS:
        raise HTTPException(
            400,
            detail={
                "code": "read_only_field_edit_error",
                "message": f"{q} is not an editable field.",
            }
        )

    if q == "email" and doctor.email_verified:
        raise HTTPException(
            409,
            detail={
                "code": "unauthorized_error",
                "message": "You cannot change your email address as your email is already verified."
            }
        )

    setattr(doctor, q, val)
    await session.commit()

    await session.refresh(doctor)


@router.get(
    "/me/appointments",
    response_model=PaginatedResponse[AppointmentDoctorResponse]
)
async def get_doctor_appointments(
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
    pagination_params: PaginationParams = Depends()
):
    count, objs = await DoctorService.get_appointments(
        session=session,
        doctor_id=doctor.id,
        pagination_params=pagination_params
    )

    return EntityService.create_pg_response(
        objs=objs,
        count=count,
        pagination=pagination_params
    )


@router.get(
    "/me/appointments/{appointment_id}",
    response_model=AppointmentDoctorResponse
)
async def get_doctor_appointment(
    appointment_id: UUID,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
):
    return await AppointmentService.get_for_participant(
        session=session,
        appointment_id=appointment_id,
        participant=doctor,
        loader_opts=[
            joinedload(Appointment.patient),
            joinedload(Appointment.slot),
            joinedload(Appointment.care_journey),
            joinedload(Appointment.clinic).selectinload(Clinic.reviews),
        ],
    )


@router.get(
    "/me/schedules",
    response_model=PaginatedResponse[DoctorScheduleResponse]
)
async def get_doctor_schedules(
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
    pagination_params: PaginationParams = Depends()
):
    count, objs = await DoctorService.get_schedules(
        session=session,
        doctor_id=doctor.id,
        pagination_params=pagination_params
    )

    return EntityService.create_pg_response(
        objs,
        count,
        pagination_params
    )


@router.get(
    path="/me/clinics",
    response_model=PaginatedResponse[DoctorClinicResponse]
)
async def get_doctor_clinics(
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
    pagination_params: PaginationParams = Depends()
):
    count, objs = await DoctorService.get_clinics(
        session=session,
        doctor_id=doctor.id,
        pagination_params=pagination_params
    )

    return EntityService.create_pg_response(
        objs=objs,
        count=count,
        pagination=pagination_params
    )


@router.put(
    path="/me/clinics/{clinic_id}",
    response_model=DoctorClinicResponse
)
async def associate_doctor_clinic(
    clinic_id: UUID,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db)
):
    clinic = await DoctorService.associate_clinic(
        session=session,
        doctor_id=doctor.id,
        clinic_id=clinic_id
    )

    await session.commit()
    return clinic


@router.delete(
    path="/me/appointments/{appointment_id}",
)
async def cancel_appointment(
    appointment_id: UUID,
    session: AsyncSession = Depends(get_db),
    doctor: Doctor = Depends(require_doctor),
):
    await AppointmentService.cancel_appointment(
        session=session,
        appointment_id=appointment_id,
        participant=doctor,
    )

    await session.commit()


@router.post(
    "/me/appointments/{appointment_id}/complete",
    response_model=AppointmentDoctorResponse
)
async def complete_appointment(
    appointment_id: UUID,
    session: AsyncSession = Depends(get_db),
    doctor: Doctor = Depends(require_doctor),
):
    appointment = await AppointmentService.complete_appointment(
        appointment_id=appointment_id,
        session=session,
        participant=doctor
    )

    await session.commit()
    return appointment
