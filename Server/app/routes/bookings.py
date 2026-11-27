import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks, APIRouter, Depends
from app.database.models import Patient
from app.services.MailService import MailService
from app.schemas.appointment import AppointmentConfirmation, BookingRequestData
from app.services.BookingService import BookingService
from app.database.entry_async import get_db
from app.features.auth.dependencies import require_patient


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
    patient: Patient = Depends(require_patient)
):
    created = await BookingService.create_booking(
        session=session,
        user=patient,
        payload=data
    )

    mail = f"""
        Hi {patient.username},

        Your appointment with <strong><em>Dr. {created.doctor.name}</em></strong>
        is scheduled to be held at {created.clinic.name} on {created.scheduled_date.date().isoformat()} 
        at {created.scheduled_date.time().isoformat(timespec="minutes")}.

        Thank you for using our service ..! """

    await session.commit()

    background_tasks.add_task(
        MailService.send_mail,
        recipient=patient.email,
        content=("Appointment Confirmation!", mail)
    )

    return created


@router.delete("/{booking_id}")
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

    await session.commit()
    background_tasks.add_task(
        MailService.send_mail,
        recipient=user.email,
        content=(
            "Appointment Cancellation.",
            "Your appointment was sucessfully cancelled !"
        )
    )
