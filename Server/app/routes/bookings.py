from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, APIRouter, Depends, HTTPException

from app.schemas.http import Appointment, BookingRequestData
from app.services.booking_service import BookingService
from app.database.models import Patient
from app.database.entry import get_db
from app.middleware.access import get_user


router = APIRouter(prefix="/bookings")


# add create later as the endpoint
@router.post("", response_model=Appointment)
async def book(rqst_data: BookingRequestData, session: Session = Depends(get_db)):
    try:
        with session.begin():
            srvc = BookingService(session=session)
            created_appointment = srvc.create_bkng(**rqst_data.model_dump())
            return created_appointment

    except ValueError as e:
        raise HTTPException(status_code=400, detail={"msg": e.__str__()})


#
@router.delete("/{booking_id}")
async def cancel_booking(booking_id: UUID, ptnt: Patient = Depends(get_user), session: Session = Depends(get_db)):
    with session.begin():
        srvc = BookingService(session=session)
        srvc.del_bkng(appointment_id=booking_id, patient_id=ptnt.id)
