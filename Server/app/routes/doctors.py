from uuid import UUID
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException

from app.database.entry import get_db
from app.services.dr_service import DoctorService

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.http import PaginatedResponse
from app.schemas.query_params import DrRouteFilters, PaginationParams


router = APIRouter(prefix="/doctors")


@router.get("", response_model=PaginatedResponse[DoctorSummary])
async def get_doctors(
    filters: DrRouteFilters = Depends(),
    pagination_params: PaginationParams = Depends(),
    session: Session = Depends(get_db),
):
    srvc = DoctorService(session)

    # Call get_all and create_paginated_res methods defined on the super class

    objects = srvc.get_all(
        pagination=pagination_params,
        filters=filters
    )

    response = srvc.create_pg_response(
        objs=objects,
        pagination=pagination_params
    )

    return response


@router.get("/{id}", response_model=Doctor)
async def get_doctor(id: UUID, session: Session = Depends(get_db)):
    service = DoctorService(session=session)

    try:
        return service.get_by_id(id=id)

    except NoResultFound as e:
        raise HTTPException(
            404, {
                "msg": "The requested doctor does not exist ..",
                "detail": str(e)
            }
        )
