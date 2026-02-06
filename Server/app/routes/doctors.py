from enum import Enum
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException, status

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
    db: Session = Depends(get_db),
    filters: FilterParams = Depends(),
    pagination_params: PaginationParams = Depends(),
):
    try:
        service = DoctorService(db)
        return service.get(pagination=pagination_params, filters=filters)

    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "detail": str(e),
                "type": "unexpected error",
                "msg": "an internal server error occurred.",
            },
        )


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: UUID, db: Session = Depends(get_db)):
    try:
        return DoctorService(db).get_by_id(id=id)

    except DoctorNotFoundException as e:
        raise HTTPException(404, detail={"msg": str(e), "type": "not found"})


@router.post("/{id}/book", response_model=Appointment)
async def book_schedule(
    id: UUID, booking_data: BookingRequestData, db: Session = Depends(get_db)
):
    try:
        return DoctorService(db).book(id=id, **booking_data.model_dump(by_alias=False))

    except ValueError as e:
        print(e)
        raise HTTPException(
            400, detail={"msg": str(e), "type": "bad request", "detail": str(e)}
        )

    except Exception as e:
        print(e)
        raise HTTPException(
            500,
            detail={
                "msg": "Unexpected server error",
                "type": "unexpected error",
                "detail": str(e),
            },
        )
