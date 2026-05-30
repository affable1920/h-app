import logging
from typing import Optional
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.middleware.auth_middleware import get_user
from app.database.entry import get_db
from app.database.models import Doctor as DoctorDB
from app.services.DrService import dr_srvc
from app.schemas.internals_ import Doctor
from app.schemas.outputs import PaginatedResponse
from app.schemas.inputs import DrCreate, get_dr_onboarding
from app.schemas.internals import DrRouteFilters, PaginationParams


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/doctors")


@router.get("", response_model=PaginatedResponse[Doctor])
async def get_doctors(
    filters: DrRouteFilters = Depends(),
    pagination_params: PaginationParams = Depends(),
    session: Session = Depends(get_db),
):
    count, objects = dr_srvc.get_all(
        session,
        pagination=pagination_params,
        filters=filters
    )

    response = dr_srvc.create_pg_response(
        objs=objects,
        count=count,
        pagination=pagination_params
    )

    return response


@router.get("/{id}", response_model=Optional[Doctor])
async def get_doctor(id: str, session: Session = Depends(get_db)):
    return dr_srvc.get_by_id(session, id=id)

#


def get_doctor_user(id: str, session: Session) -> bool:
    row = session.execute(
        select(DoctorDB).where(DoctorDB.id == id)).scalar()

    return row is not None


@router.post("/onboard", response_model=Doctor)
async def create(
    data: DrCreate = Depends(get_dr_onboarding),
    session: Session = Depends(get_db)
):
    try:
        with session.begin():
            created = await dr_srvc.create(session, data=data)
            logger.info(created)
            return created

    except ValueError as e:
        logger.debug(e)
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    except Exception as e:
        logger.debug(e)
        raise HTTPException(
            500,
            detail={
                "msg": str(e)
            }
        )
