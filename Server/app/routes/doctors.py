import json
from enum import Enum
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException

from app.database.entry import get_db
from app.services.dr_service import DoctorService

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.query_params import FilterParams, PaginationParams
from app.schemas.http import BookingRequestData, PaginatedResponse, AppointmentRecord


base_route = "/doctors"
tags: list[str | Enum] = ["doctors"]

router = APIRouter(prefix=base_route, tags=tags)


@router.get("", response_model=PaginatedResponse[DoctorSummary])
async def get_doctors(
    pagination_params: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: Session = Depends(get_db),
):
    service = DoctorService(db)
    return service.get(pagination=pagination_params, filters=filters)


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: UUID, db: Session = Depends(get_db)):
    return DoctorService(db).get_by_id(id=id)


@router.post("/{id}/book", response_model=AppointmentRecord)
async def book_schedule(
    id: UUID, booking_data: BookingRequestData, db: Session = Depends(get_db)
):
    try:
        return DoctorService(db).book(id=id, **booking_data.model_dump())

    except ValueError as e:
        print(e)
        raise HTTPException(400, detail={"msg": str(e)})

    except Exception as e:
        print(e)
        raise HTTPException(
            500, detail={"msg": "Unexpected server error", "desc": json.dumps(e)}
        )
