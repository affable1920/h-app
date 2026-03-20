from enum import Enum
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException

from app.database.entry import get_db
from app.services.dr_service import DoctorNotFoundException, DoctorService

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.http import Appointment, BookingRequestData, PaginatedResponse
from app.schemas.query_params import FilterParams, PaginationParams


base_route = "/doctors"
tags: list[str | Enum] = ["doctors"]

router = APIRouter(prefix=base_route, tags=tags)


@router.get("", response_model=PaginatedResponse[DoctorSummary])
async def get_doctors(
    filters: FilterParams = Depends(),
    pagination_params: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    service = DoctorService(db)

    try:
        response = service.get_all(
            pagination=pagination_params, filters=filters)

        response_model = PaginatedResponse.model_validate(response)
        return response_model

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail={
                "detail": str(e),
                "type": "unexpected error",
                "msg": "an internal server error occurred.",
            },
        )


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: UUID, db: Session = Depends(get_db)):
    service = DoctorService(db=db)

    try:
        return service.get_by_id(id=id)

    except ValueError as e:
        raise HTTPException(status_code=404, detail={
                            "msg": e.__str__(), "type": "Invalid doctor id"})


@router.post("/{doctor_id}/book", response_model=Appointment)
async def book_schedule(
    doctor_id: UUID, booking_data: BookingRequestData, db: Session = Depends(get_db)
):
    service = DoctorService(db=db)

    try:
        created_appointment = service.book(
            doctor_id=doctor_id, **booking_data.model_dump())

        db.commit()
        return created_appointment

    except ValueError as e:
        print(e)
        db.rollback()
        raise HTTPException(
            status_code=400, detail={"msg": e.__str__(), "type": "Unavailable slot request."}
        )

    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "msg": e.__str__(),
                "type": "unexpected error",
            },
        )
