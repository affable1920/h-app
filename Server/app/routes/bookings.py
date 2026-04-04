from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, APIRouter, Depends, HTTPException

from app.services.users_service import UserService
from app.schemas.http import Appointment, BookingRequestData
from app.services.booking_service import BookingService
from app.database.entry import get_db
from app.middleware.access import get_user


router = APIRouter(prefix="/bookings")


# add create later as the endpoint
@router.post("", response_model=Appointment)
async def book(rqst_data: BookingRequestData, session: Session = Depends(get_db), ptnt_id: UUID = Depends(get_user)):
    try:
        with session.begin():
            srvc = BookingService(session=session)
            usr_srvc = UserService(db=session)
            res = usr_srvc.get_with_type(id=ptnt_id)

            if not res:
                print("\n\nPatient does not exist ..")
                raise ValueError("Patient does not exist ..")

            booking_data = rqst_data.model_dump()

            created_appointment = srvc.create_bkng(
                **booking_data, patient_id=res.id)
            return created_appointment

    except ValueError as e:
        raise HTTPException(status_code=400, detail={"msg": e.__str__()})


#
@router.delete("/cancel/{booking_id}")
async def cancel_booking(booking_id: UUID, ptnt_id: UUID = Depends(get_user), session: Session = Depends(get_db)):
    try:
        with session.begin():
            srvc = BookingService(session=session)
            srvc.del_bkng(appointment_id=booking_id, patient_id=ptnt_id)

        return {"msg": "Booking cancelled successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"msg": str(e)})
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail={
                            "msg": "An error occurred while cancelling the booking."})
