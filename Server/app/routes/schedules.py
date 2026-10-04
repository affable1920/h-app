import logging
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EntityNotFoundException, ScheduleHasAppointments
from app.features.auth.dependencies import require_doctor
from app.services.SchedulingService import ScheduleService

from app.database.models import Doctor
from app.database.entry_async import get_db

from app.schemas.schedule import CreateSchedule, DoctorScheduleResponse


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
    payload: CreateSchedule,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
):
    created = await ScheduleService.create_schedule(
        doctor_id=doctor.id,
        session=session,
        payload=payload
    )

    await session.commit()
    return created


@router.put("/{schedule_id}")
async def edit_schedule(
    schedule_id: UUID,
    q: str,
    val=Body(embed=True),
    session: AsyncSession = Depends(get_db),
    doctor: Doctor = Depends(require_doctor)
):
    try:
        await ScheduleService.edit_schedule(
            schedule_id=schedule_id,
            doctor_id=doctor.id,
            session=session,
            field_name=q,
            val=val
        )

    except EntityNotFoundException:
        raise HTTPException(
            404,
            detail={
                "code": "not_found",
                "message": "The schedule you are trying to edit does not exist.",
            }
        )


#

@router.delete(
    path="/{schedule_id}",
    response_model=None,
    status_code=204
)
async def remove_schedule(
    schedule_id: UUID,
    confirm: bool = Query(
        False,
        description="Confirm deletion of schedule by setting this to true."
    ),
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db)
):
    try:
        await ScheduleService.remove_schedule(
            schedule_id=schedule_id,
            doctor_id=doctor.id,
            session=session,
            confirm=confirm
        )

    except ScheduleHasAppointments as e:
        raise HTTPException(
            409,
            detail={
                "message": e.message,
                "code": e.code,
            }
        )
