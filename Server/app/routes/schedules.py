import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ScheduleHasAppointments
from app.features.auth.dependencies import require_doctor
from app.services.SchedulingService import schedule_service

from app.database.models import Doctor
from app.database.entry_async import get_db

from app.schemas.schedule import (
    CreateSchedule,
    DoctorScheduleResponse,
    ScheduleActivationUpdate
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    dependencies=[Depends(require_doctor)]
)


@router.post(
    path="",
    response_model=DoctorScheduleResponse,
    status_code=201
)
async def create_schedule(
    data: CreateSchedule,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
):
    created = await schedule_service.create_schedule(
        doctor_id=doctor.id,
        session=session,
        payload=data
    )

    await session.commit()
    return DoctorScheduleResponse.model_validate(created)


@router.patch(
    "/{schedule_id}/activation",
    status_code=204
)
async def alter_schedule_activation(
    schedule_id: UUID,
    activation_value: ScheduleActivationUpdate,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
):
    await schedule_service.alter_schedule_activation(
        schedule_id=schedule_id,
        doctor_id=doctor.id,
        session=session,
        val=activation_value.is_active
    )

    await session.commit()

#


@router.delete(
    path="/{schedule_id}",
    response_model=None,
    status_code=204
)
async def remove_schedule(
    schedule_id: UUID,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db)
):
    try:
        await schedule_service.remove_schedule(
            schedule_id=schedule_id,
            doctor_id=doctor.id,
            session=session,
        )

        await session.commit()

    except ScheduleHasAppointments as e:
        raise HTTPException(
            409,
            detail={
                "message": e.message,
                "code": e.code,
            }
        )
