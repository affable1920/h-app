import logging
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ClinicService import ClinicService
from app.schemas.outputs import PaginatedResponse
from app.schemas.models import ClinicHttpMinimal, ClinicHttpFull
from app.schemas.response_modifiers import ClinicRouteFilters, PaginationParams
from app.database.entry_async import get_db


router = APIRouter(prefix="/clinics")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


@router.get("", response_model=PaginatedResponse[ClinicHttpMinimal])
async def get_all(
    pagination_params: PaginationParams = Depends(),
    filter_params: ClinicRouteFilters = Depends(),
    session: AsyncSession = Depends(get_db),
):

    count, objs = await ClinicService.get_all(
        session=session,
        pagination=pagination_params,
        filters=filter_params
    )

    response = ClinicService.create_pg_response(
        objs=objs,
        count=count,
        pagination=pagination_params
    )

    return response


@router.get("/{id}", response_model=Optional[ClinicHttpFull])
async def get_one(
    id: str,
    session: AsyncSession = Depends(get_db)
):
    clinic = await ClinicService.get_by_id(
        id=id, session=session
    )

    return clinic
