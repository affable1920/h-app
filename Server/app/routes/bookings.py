from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException, APIRouter, Depends, HTTPException

from app.services import MailService
from app.schemas.outputs import AppointmentResponse
from app.schemas.inputs import BookingRequestData
from app.services.BookingService import BookingService
from app.database.entry import get_db
from app.middleware.auth_middleware import get_user


router = APIRouter(prefix="/bookings")
booker = BookingService()
# add create later as the endpoint


@router.post("", response_model=AppointmentResponse)
async def book(
    data: BookingRequestData, background_tasks: BackgroundTasks,
    session: Session = Depends(get_db),
    user_id: str = Depends(get_user)
):
    try:
        with session.begin():
            user = {}
            if not user:
                raise ValueError("Patient does not exist")

            created = booker.create_bkng(
                session,
                data=data,
                user=user
            )

    except ValueError as e:
        print(e)
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    mail = (
        f"""
        Subject: Appointment Confirmation!
               
                
        Hi {""},
        Your appointment with is scheduled on
        {created.scheduled_date.isoformat(sep="-")}"""
    )
    background_tasks.add_task(
        lambda: MailService.send_mail(
            "affableshamik12@gmail.com",
            msg=mail
        )
    )
    return created


#
@router.delete("/cancel/{booking_id}")
async def cancel_booking(booking_id: UUID, ptnt_id: UUID = Depends(get_user), session: Session = Depends(get_db)):
    try:
        with session.begin():
            booker.del_bkng(
                session,
                appointment_id=booking_id,
                patient_id=ptnt_id
            )
        return {"msg": "Booking cancelled successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"msg": str(e)})
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail={
                            "msg": "An error occurred while cancelling the booking."})
