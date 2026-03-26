from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException

from app.database.entry import get_db
from app.services.dr_service import DoctorService

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.http import PaginatedResponse
from app.schemas.query_params import FilterParams, PaginationParams


router = APIRouter(prefix="/doctors")


@router.get("", response_model=PaginatedResponse[DoctorSummary])
async def get_doctors(
    filters: FilterParams = Depends(),
    pagination_params: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    service = DoctorService(db)
    response = service.get_all(
        pagination=pagination_params, filters=filters)

    return response


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: UUID, db: Session = Depends(get_db)):
    service = DoctorService(session=db)

    try:
        return service.get_by_id(id=id)

    except Exception as e:
        raise HTTPException(status_code=404, detail={
                            "msg": e.__str__(), "type": "Doctor does not exist"})
