from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.SchedulingService import schedule_service

from app.database.models import Doctor
from app.database.entry_async import get_db

from app.schemas.inputs import CreateSchedule
from app.schemas.outputs import ScheduleResponse

from app.middleware.auth_middleware import require_doctor


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
                "type": "Feature Not-Implemented!",
                "msg": "Creating schedules on a monthly basis is not supported yet."
            }
        )

    created = (await schedule_service.create_schedule(
        doctor_id=str(doctor.id),
        session=session,
        payload=data
    ))

    await session.commit()
    return ScheduleResponse.model_validate(created)


#

@router.delete("/{schedule_id}")
async def remove_schedule(
    schedule_id: str,
    doctor: Doctor = Depends(require_doctor),
    session: AsyncSession = Depends(get_db)
):
    target = next(
        (schedule for schedule in doctor.schedules if
            str(schedule.id) == schedule_id
         ),
        None
    )

    if target is None:
        raise HTTPException(
            404,
            detail={
                "msg": "The schedule you want to delete does not exist. "
                "Please reload and retry."
            }
        )

    doctor.schedules.remove(target)
    await session.commit()

#


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

    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    except Exception:
        await session.rollback()
        raise HTTPException(
            500,
            detail={
                "msg": "An unexpected error occurred.",
            }
        )
