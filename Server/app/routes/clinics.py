import logging

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.schemas.internals_ import Clinic
from app.services.ClinicService import clinic_srvc
from app.schemas.outputs import PaginatedResponse
from app.schemas.internals import ClinicRouteFilters, PaginationParams
from app.database.entry import get_db


router = APIRouter(prefix="/clinics")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


@router.get("", response_model=PaginatedResponse[Clinic])
async def get(
    pagination_params: PaginationParams,
    filter_params: ClinicRouteFilters,
    session: Session = Depends(get_db),
):
    try:
        logger.info("\nRecieved get all clinics request ..")

        count, objs = clinic_srvc.get_all(
            session=session,
            pagination=pagination_params,
            filters=filter_params
        )

        logger.info(
            f"\n{len(objs)} clinics fetched from database.. Creating paginated response..")

        response = clinic_srvc.create_pg_response(
            objs=objs,
            count=count,
            pagination=pagination_params
        )

        return response

    except Exception as e:
        print(e)
        raise
