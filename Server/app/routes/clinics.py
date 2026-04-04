import logging

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.schemas.dr_extra import Clinic
from app.services.clinic_service import ClinicService
from app.schemas.http import PaginatedResponse
from app.schemas.query_params import ClinicRouteFilters, PaginationParams
from app.database.entry import get_db


router = APIRouter(prefix="/clinics")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


@router.get("", response_model=PaginatedResponse[Clinic])
async def get(pagination_params: PaginationParams = Depends(),
              filter_params: ClinicRouteFilters = Depends(), session: Session = Depends(get_db)):
    try:
        logger.info("\nRecieved get all clinics request ..")

        srvc = ClinicService(session=session)
        objs = srvc.get_all(pagination=pagination_params,
                            filters=filter_params)

        logger.info(
            f"\n{len(objs)} clinics fetched from database.. Creating paginated response..")

        response = srvc.create_pg_response(
            objs=objs, pagination=pagination_params)

        return response

    except Exception as e:
        print(e)
        raise
