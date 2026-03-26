from uuid import UUID
from fastapi import Depends

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.shared.enums import Mode, Status
from app.database.models import Doctor as DBDoctor

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.query_params import FilterParams, PaginationParams, SortOrder


class DoctorService:
    def __init__(self, session: Session):
        self.session = session

    @staticmethod
    def get_model_partial(dr: DBDoctor) -> DoctorSummary:
        return DoctorSummary.model_validate(dr)

    #

    @staticmethod
    def get_model(dr: DBDoctor) -> Doctor:
        return Doctor.model_validate(dr)

    #
    @staticmethod
    def __filter(
        query: Select, filters: FilterParams = Depends()
    ) -> Select:
        """
        (args): all filters to be used for doctors

        Return -> a query with only the doctors that meet the filter criteria.

        This utility func only extracts fields from the query params that we use,
        (in this route), to filter doctors.

        So, this func has nothing to do with sorting and paginating.
        """
        resultant_query = query

        if filters.specialization:
            resultant_query = query.where(
                DBDoctor.primary_specialization == filters.specialization
            )

        if filters.min_rating:
            resultant_query = query.where(
                DBDoctor.rating >= filters.min_rating)

        if filters.currently_available:
            resultant_query = query.filter(DBDoctor.status == Status.AVAILABLE)

        if filters.search_query:
            resultant_query = query.where(
                DBDoctor.name.icontains(filters.search_query))

        if filters.mode == Mode.ONLINE:
            resultant_query = query.where(DBDoctor.consults_online)

        return resultant_query

    #

    def get_all(self, pagination: PaginationParams, filters: FilterParams):
        stmt = select(DBDoctor)
        stmt = self.__filter(stmt, filters)

        if pagination.sort_by:
            sort_column = getattr(DBDoctor, pagination.sort_by)

            if pagination.sort_order == SortOrder.DESC:
                sort_column = sort_column.desc()

            stmt = stmt.order_by(sort_column)
        stmt = stmt.offset(pagination.offset).limit(pagination.max)

        result = self.session.scalars(stmt)
        doctors = [self.get_model_partial(dr) for dr in result]

        count = self.session.execute(
            select(func.count()).select_from(DBDoctor)).scalar()

        last_page = (count or 0) // pagination.max
        response = {
            "entities": doctors, "count": count, "has_prev": pagination.page >= 1,
            "has_next": pagination.page < last_page
        }
        return response

    #

    def get_by_id(self, id: UUID) -> Doctor:
        stmt = select(DBDoctor).where(DBDoctor.id == id)

        result = self.session.execute(stmt).scalar_one()
        return self.get_model(result)
