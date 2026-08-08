import logging
from typing import Optional
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.entry_async import get_db
from app.services.DrService import DoctorService
from app.schemas.models import DoctorHttpFull, DoctorHttpMinimal
from app.schemas.outputs import PaginatedResponse
from app.schemas.inputs import DrCreate, get_dr_onboarding
from app.schemas.response_modifiers import DrRouteFilters, PaginationParams


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/doctors")


@router.get("", response_model=PaginatedResponse[DoctorHttpMinimal])
async def get_doctors(
    filters: DrRouteFilters = Depends(),
    pagination_params: PaginationParams = Depends(),
    session: AsyncSession = Depends(get_db),
):
    count, objects = await DoctorService.get_all(
        session,
        pagination=pagination_params,
        filters=filters
    )

    response = DoctorService.create_pg_response(
        objs=objects,
        count=count,
        pagination=pagination_params
    )

    return response


@router.get("/{id}", response_model=Optional[DoctorHttpFull])
async def get_doctor(
    id: str,
    session: AsyncSession = Depends(get_db)
):
    dtr = await DoctorService.get_by_id(
        session=session, id=id
    )
    return dtr

#


@router.post("/onboard", response_model=DoctorHttpMinimal)
async def create(
    data: DrCreate = Depends(get_dr_onboarding),
    session: AsyncSession = Depends(get_db)
):
    try:
        async with session.begin():
            created = await DoctorService.create(session, data=data)
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
