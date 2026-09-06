import logging
from typing import Optional
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.entry_async import get_db
from app.services.DrService import DoctorService
<<<<<<< Updated upstream
from app.schemas.models import DoctorHttpFull, DoctorHttpMinimal
from app.schemas.outputs import PaginatedResponse
from app.schemas.inputs import DrCreate, get_dr_onboarding
from app.schemas.response_modifiers import DrRouteFilters, PaginationParams, SortOrder, SortParams


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/doctors")
=======

from app.core.exceptions import EntityNotFoundException
from app.schemas.outputs import PaginatedResponse
from app.schemas.models import DoctorHttpFull, DoctorHttpMinimal
from app.schemas.response_modifiers import DrRouteFilters, PaginationParams, SortParams


logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
    dependencies=[Depends(get_db)]
)

ALLOWED_FIELDS = {
    "name",
    "phone",
    # "profile"
}
>>>>>>> Stashed changes


@router.get("", response_model=PaginatedResponse[DoctorHttpMinimal])
async def get_doctors(
    filters: DrRouteFilters = Depends(),
    pagination_params: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    session: AsyncSession = Depends(get_db),
):
    count, objects = await DoctorService.get_all(
        session,
        pagination=pagination_params,
        filters=filters,
        sort=sort
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
<<<<<<< Updated upstream
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
=======

    if doctor is None:
        raise EntityNotFoundException(
            entity_name="Doctor",
            identifier=id
        )

    return doctor


@router.put("/edit")
async def edit_doctor(
    q: str = Query(),
    val: str = Body(embed=True),
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    dr = (await get_curr_user(
        session=session,
        payload=payload
    ))

    if dr is None or not isinstance(dr, Doctor):
        raise EntityNotFoundException(
            entity_name="Doctor",
        )

    if q not in ALLOWED_FIELDS:
        raise HTTPException(
            400,
            detail={
                "code": "read_only_field_edit_error",
                "message": f"{q} is not an editable field.",
            }
        )

    setattr(dr, q, val)

    await session.commit()
    await session.refresh(dr)


# ================================================================================================
>>>>>>> Stashed changes
