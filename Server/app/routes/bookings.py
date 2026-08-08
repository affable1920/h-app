import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks, HTTPException, APIRouter, Depends, HTTPException
# grep -r "from sqlalchemy.orm import Session" app
from app.database.models import Patient
from app.services import MailService
from app.schemas.outputs import AppointmentConfirmation
from app.schemas.inputs import BookingRequestData
from app.services.BookingService import BookingService
from app.database.entry_async import get_db
from app.middleware.auth_middleware import decode_access_token, get_curr_user


router = APIRouter(prefix="/bookings")

logger = logging.getLogger(__name__)


@router.post("", response_model=AppointmentConfirmation)
async def book(
    data: BookingRequestData, background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    user = await get_curr_user(
        payload=payload, session=session
    )

    if user is None or not isinstance(user, Patient):
        raise HTTPException(
            401,
            detail={
                "type": "authentication error",
                "msg": "Invalid user details. Doctors cannot book appointments for themselves yet."
            }
        )

    try:
        created = await BookingService.create_booking(
            session, user, data
        )

    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    except Exception as e:
        logger.debug(e)
        await session.rollback()
        raise HTTPException(
            500,
            detail={
                "msg": "An unexpected error occurred"
            }
        )

    mail = f"""
        Subject: Appointment Confirmation!


        Hi {user.username},

        Your appointment with Dr {created.doctor.name} is succesffuly scheduled at {created.clinic.name}
        for {created.scheduled_date.isoformat(sep="-")} at {data.scheduled_date.time().isoformat()}"""

    await session.commit()

    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient=user.email,
            msg=mail
        )
    )

    return created


#
@router.delete("/cancel/{booking_id}")
async def cancel_booking(
    booking_id: UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    user = await get_curr_user(
        session=session, payload=payload
    )

    if user is None or not isinstance(user, Patient):
        raise HTTPException(
            404,
            detail={
                "msg": "The user account does not exist. Please login first",
                "type": "No Result Found"
            }
        )

    try:
        await BookingService.cancel_booking(
            session=session,
            booking_id=booking_id,
            patient=user
        )

    except ValueError as e:
        await session.rollback()
        logger.debug(e)
        raise HTTPException(status_code=400, detail={"msg": str(e)})

    except Exception as e:
        logger.debug(e)
        await session.rollback()
        raise HTTPException(
            500,
            detail={
                "type": "Unexpected Error",
                "msg": "An unexpected error occurred and your slot could not be cancelled"
            }
        )

    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient=user.email,
            msg="Your appointment has been cancelled."
        )
    )
    return {"msg": "Slot cancelled successfully."}
