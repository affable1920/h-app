from typing import Tuple

from sqlalchemy import Select, any_, or_
from sqlalchemy.orm import Session

from app.schemas.query_params import ClinicRouteFilters
from app.services.entities.main import EntityService
from app.database.models import Clinic


#

class ClinicService(EntityService[Clinic]):
    def __init__(self, session: Session):
        super().__init__(session, Clinic)

    #
    def filter(
        self, stmt: Select, filters: ClinicRouteFilters
    ) -> Select[Tuple[Clinic]]:
        if filters.search_query:
            stmt = stmt.where(
                Clinic.name.icontains(f"%{filters.search_query}%"))

        if filters.min_rating:
            stmt = stmt.where(Clinic.rating >= filters.min_rating)

        if filters.facilities:
            stmt = stmt.where(Clinic.facilities.op("&&")(filters.facilities))

        return stmt
