import logging
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException, APIRouter, Depends, HTTPException

from app.database.models import Patient
from app.services import MailService
from app.schemas.outputs import AppointmentResponse
from app.schemas.inputs import BookingRequestData
from app.services.BookingService import BookingService
from app.database.entry import get_db
from app.middleware.auth_middleware import get_curr_user


router = APIRouter(prefix="/bookings")
booker = BookingService()

logger = logging.getLogger(__name__)


@router.post("", response_model=AppointmentResponse)
async def book(
    data: BookingRequestData, background_tasks: BackgroundTasks,
    session: Session = Depends(get_db),
    user: Patient = Depends(get_curr_user)
):
    if user is None or not isinstance(user, Patient):
        raise ValueError(
            "Invalid user details. "
        )

    try:
        created = await booker.create_booking(
            session, user, data
        )

    except ValueError as e:
        logger.error("Error booking slot for patient \n", user)
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    except Exception as e:
        logger.debug(e)
        raise HTTPException(
            500,
            detail={
                "msg": "An unexpected error occurred"
            }
        )

    session.add(created)
    session.commit()

    session.refresh(created)

    mail = f"""
        Subject: Appointment Confirmation!


        Hi {user.username},

        Your appointment with Dr {created.doctor.name} is succesffuly scheduled at {created.clinic.name}
        for {created.scheduled_date.isoformat(sep="-")} at {data.scheduled_date.time().isoformat()}
"""

    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient="affableshamik12@gmail.com",
            msg=mail
        )
    )

    return created


#
@router.delete("/cancel/{booking_id}")
async def cancel_booking(booking_id: UUID, user: Patient = Depends(get_curr_user), session: Session = Depends(get_db)):
    try:
        booker.cancel_booking(
            session=session,
            booking_id=booking_id,
            patient=user
        )

        session.commit()
        return {"msg": "Slot cancelled successfully."}

    except ValueError as e:
        session.rollback()
        logger.debug(e)
        raise HTTPException(status_code=400, detail={"msg": str(e)})
    except Exception as e:
        logger.debug(e)
        raise HTTPException(
            500,
            detail={
                "type": "Unexpected Error",
                "msg": "An unexpected error occurred and your slot could not be cancelled"
            }
        )
