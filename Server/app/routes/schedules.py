import logging

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exception_handlers import ErrorHttp
from app.core.exceptions import EntityNotFoundException, ScheduleHasAppointments
from app.middleware.auth_middleware import require_doctor
from app.services.SchedulingService import schedule_service

from app.database.models import Doctor
from app.database.entry_async import get_db

from app.schemas.inputs import CreateSchedule
from app.schemas.outputs import ScheduleResponse


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    dependencies=[Depends(require_doctor)]
)


@router.post(
    path="/create",
    response_model=ScheduleResponse,
    status_code=201
)
async def create_schedule(
    data: CreateSchedule,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db),
):
    if data.orientation == "month":
        raise HTTPException(
            400,
            detail={
                "code": "feature_not_implemented!",
                "message": "Creating schedules on a monthly basis is not supported yet."
            }
        )

    created = await schedule_service.create_schedule(
        doctor_id=str(doctor.id),
        session=session,
        payload=data
    )

    await session.commit()
    return ScheduleResponse.model_validate(created)


@router.put("/{id}")
async def edit_schedule(
    id: str,
    q: str,
    val=Body(embed=True),
    session: AsyncSession = Depends(get_db),
    doctor: Doctor = Depends(require_doctor)
):
    try:
        await schedule_service.edit(
            id=str(id),
            doctor_id=str(doctor.id),
            session=session,
            field_name=q,
            val=val
        )

    except EntityNotFoundException as e:
        raise HTTPException(
            404,
            detail={
                "code": "not_found",
                "message": "The schedule you are trying to edit does not exist.",
                "detail": str(e)
            }
        )


#

@router.delete(
    path="/{schedule_id}",
    response_model=None,
    status_code=204
)
async def remove_schedule(
    schedule_id: str,
    confirm: bool = Query(
        False,
        description="Confirm deletion of schedule by setting this to true."
    ),
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db)
):
    try:
        await schedule_service.remove_schedule(
            schedule_id=schedule_id,
            doctor_id=str(doctor.id),
            session=session,
            confirm=confirm
        )

    except ScheduleHasAppointments as e:
        raise HTTPException(
            409,
            detail=ErrorHttp(
                message=e.message,
                code=e.code,
                status=e.status_code or 409
            ).model_dump(mode="json")
        )
