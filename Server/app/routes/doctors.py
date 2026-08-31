import logging
from typing import Optional
from fastapi import Body, Depends, APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Doctor
from app.database.entry_async import get_db
from app.middleware.auth_middleware import decode_access_token, get_curr_user
from app.services.DrService import DoctorService

from app.schemas.outputs import PaginatedResponse
from app.schemas.models import DoctorHttpFull, DoctorHttpMinimal
from app.schemas.inputs import DrCreate, get_dr_onboarding
from app.schemas.response_modifiers import DrRouteFilters, PaginationParams, SortParams


logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
    dependencies=[Depends(get_db)]
)

ALLOWED_FIELDS = {"name", "email", "phone"}


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
    doctor = await DoctorService.get_by_id(
        id=id,
        session=session
    )
    return doctor

#


@router.post("/onboard", response_model=DoctorHttpMinimal)
async def create_doctor(
    data: DrCreate = Depends(get_dr_onboarding),
    session: AsyncSession = Depends(get_db)
):
    try:
        async with session.begin():
            created = await DoctorService.create(session, data=data)
            logger.info(f"Created doctor instance -> {created}")
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
        raise HTTPException(
            404,
            detail={
                "msg": "No account found with the given details."
            }
        )

    if q not in ALLOWED_FIELDS:
        raise HTTPException(
            400,
            detail={
                "msg": f"{q} is not an editable field."
            }
        )

    setattr(dr, q, val)

    await session.commit()
    await session.refresh(dr)


# ================================================================================================
