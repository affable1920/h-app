from typing import Sequence, Tuple

from sqlalchemy import Select, select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.strategy_options import _AbstractLoad
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.entities.QueryService import QueryService
from app.schemas.pagination import ClinicRouteFilters, PaginationParams
from app.services.entities.EntityService import EntityService
from app.database.models import Clinic


class ClinicService(EntityService[Clinic]):
    entity = Clinic

    @classmethod
    def filter(
        cls,
        stmt: Select,
        filters: ClinicRouteFilters
    ) -> Select[Tuple[Clinic]]:
        if filters.search_query:
            stmt = stmt.where(
                or_(
                    Clinic.name.icontains(
                        filters.search_query
                    ),
                    Clinic.location.icontains(
                        filters.search_query
                    )
                )
            )

        if filters.facilities:
            stmt = stmt.where(
                Clinic.facilities.op("&&")(filters.facilities)
            )

        if filters.min_rating:
            stmt = stmt.where(
                Clinic.avg_rating >= filters.min_rating
            )

        return stmt

    @classmethod
    def load_base_options(cls) -> list[_AbstractLoad]:
        return [
            selectinload(Clinic.reviews)
        ]

    @classmethod
    def load_all_options(cls) -> list[_AbstractLoad]:
        return cls.load_base_options()

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
        filters: ClinicRouteFilters | None = None,
        pagination_params: PaginationParams | None = None,
    ) -> Tuple[int, Sequence[Clinic]]:
        stmt = select(Clinic)

        if filters is not None:
            stmt = cls.filter(stmt, filters)

        return await QueryService.get_all(
            base_statement=stmt,
            session=session,
            pagination=pagination_params,
            loaders=cls.load_base_options()
        )
