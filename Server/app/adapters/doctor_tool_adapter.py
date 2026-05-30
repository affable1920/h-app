import logging
from sqlalchemy.orm import Session
from app.schemas.internals_ import Doctor
from app.schemas.internals import DrRouteFilters
from app.services.DrService import dr_srvc

logger = logging.getLogger(__name__)


class DoctorToolAdapter:
    def find(
            self, specialization: str | None = None,
            min_rating: float | None = None,
            experience: int | None = None,
            **kwargs
    ):
        filters = DrRouteFilters(
            specialization=specialization,
            min_rating=min_rating,
            experience=experience,
            **kwargs
        )

        all = dr_srvc.get_all(
            pagination=None, filters=filters
        )

        return [dr_service.to_schema(dr, Doctor).model_dump_json() for dr in all]

    #

    def get_next_av(self, name: str):
        return dr_service.get_nxt_schedule(name=name)
