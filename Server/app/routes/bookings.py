import logging

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks, HTTPException, APIRouter, Depends, HTTPException
# grep -r "from sqlalchemy.orm import Session" app
from app.core.exceptions import ConflictError, EntityNotFoundException
from app.database.models import Patient
from app.services import MailService
from app.schemas.outputs import AppointmentConfirmation
from app.schemas.inputs import BookingRequestData
from app.services.BookingService import BookingService
from app.database.entry_async import get_db
from app.middleware.auth_middleware import require_patient


router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
    dependencies=[Depends(require_patient)]
)
logger = logging.getLogger(__name__)


@router.post("", response_model=AppointmentConfirmation)
async def book(
    data: BookingRequestData,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    pt: Patient = Depends(require_patient)
):
    try:
        created = await BookingService.create_booking(
            session=session,
            user=pt,
            data=data
        )

    except EntityNotFoundException as e:
        raise HTTPException(
            404,
            detail={
                "code": "not_found",
                "message": e.message,
            }
        )

    except ConflictError as e:
        raise HTTPException(
            409,
            detail={
                "code": e.code,
                "message": e.message
            }
        )

    mail = f"""
        Subject: Appointment Confirmation!


        Hi {pt.username},

        Your appointment with Dr {created.doctor.name} is succesffuly scheduled at {created.clinic.name}
        for {created.scheduled_date.isoformat(sep="-")} at {data.scheduled_date.time().isoformat()}.

        Thank you for using our service!"""

    await session.commit()

    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient=pt.email,
            msg=mail
        )
    )

    return created


#
@router.delete("/cancel/{booking_id}")
async def cancel_booking(
    booking_id: str,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    user: Patient = Depends(require_patient)
):
    await BookingService.cancel_booking(
        session=session,
        booking_id=booking_id,
        patient=user
    )

    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient=user.email,
            msg="Your appointment has been cancelled."
        )
    )
