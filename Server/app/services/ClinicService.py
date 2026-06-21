from typing import Tuple

from sqlalchemy import Select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.response_modifiers import ClinicRouteFilters
from app.services.entities.main import EntityService
from app.database.models import Clinic


class ClinicService(EntityService[Clinic]):
    entity = Clinic

    @classmethod
    def filter(
        cls, stmt: Select, filters: ClinicRouteFilters
    ) -> Select[Tuple[Clinic]]:
        if filters.search_query:
            stmt = stmt.where(
                Clinic.name.icontains(filters.search_query)
            )

        if filters.facilities:
            stmt = stmt.where(Clinic.facilities.op("&&")(filters.facilities))

        return stmt

    #

    @classmethod
    def load_options(cls) -> list:
        return [
            selectinload(Clinic.reviews)
        ]

    #

    @classmethod
    def load_options_full(cls):
        return super().load_options_full()

    #

    @classmethod
    async def create(cls, session: AsyncSession, data) -> Clinic:
        return Clinic()


clinic_srvc = ClinicService()
