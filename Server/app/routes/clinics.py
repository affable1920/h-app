import logging
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ClinicService import ClinicService
from app.schemas.clinic import ClinicHttpFull, ClinicHttpMinimal
from app.schemas.pagination import ClinicRouteFilters, PaginatedResponse, PaginationParams
from app.database.entry_async import get_db


router = APIRouter(
    prefix="/clinics",
    tags=["clinics"]
)

logger = logging.getLogger(__name__)


@router.get(
    "",
    response_model=PaginatedResponse[ClinicHttpMinimal]
)
async def get_clinics(
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


@router.get(
    "/{clinic_id}",
    response_model=Optional[ClinicHttpFull]
)
async def get_clinic(
    clinic_id: UUID,
    session: AsyncSession = Depends(get_db)
):
    return await ClinicService.get_by_id(
        entity_id=clinic_id,
        session=session
    )
