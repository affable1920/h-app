from typing import Tuple

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.schemas.internals import ClinicRouteFilters
from app.services.entities.main import EntityService
from app.database.models import Clinic


#

class ClinicService(EntityService[Clinic]):
    def __init__(self):
        super().__init__(Clinic)

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

    #

    async def create(self, session: Session, ident, data) -> Clinic:
        return Clinic()


clinic_srvc = ClinicService()
