from typing import Sequence, Tuple, Type

from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session

from app.services.entities.main import EntityService
from app.schemas.doctor import DoctorSummary as DrSummarySchema, Doctor as DrSchema
from app.shared.enums import Status
from app.database.models import Doctor
from app.schemas.query_params import DrRouteFilters


class DoctorService(EntityService[Doctor]):
    def __init__(self, session: Session):
        super().__init__(session, Doctor)

    #

    def search(self, query: str) -> Sequence[Doctor]:
        stmt = select(Doctor).where(or_(
            Doctor.name.icontains(query),
            Doctor.primary_specialization.icontains(query)
        )
        )

        return self.session.scalars(stmt).all()

    #

    @staticmethod
    def to_schema(dr: Doctor, Model: Type[DrSummarySchema | DrSchema]):
        return Model.model_validate(dr)

    #

    def filter_by_spec(self, specialization: str):
        stmt = select(Doctor).where(
            Doctor.primary_specialization.ilike(
                specialization.lower()
            )
        )

        all = self.session.scalars(stmt).all()
        return [self.to_schema(dr, DrSummarySchema) for dr in all]

    #

    def filter(
        self, stmt: Select[Tuple[Doctor]], filters: DrRouteFilters
    ) -> Select[Tuple[Doctor]]:
        """
        (args): all filters to be used for doctors
        Return -> a query with only the doctors that meet the filter criteria.
        """
        if filters.specialization:
            stmt = stmt.where(
                Doctor.primary_specialization == filters.specialization
            )

        if filters.min_rating:
            stmt = stmt.where(
                Doctor.rating >= filters.min_rating)

        if filters.currently_available:
            stmt = stmt.where(Doctor.status == Status.AVAILABLE)

        if filters.consults_online:
            stmt = stmt.where(Doctor.consults_online)

        if filters.search_query:
            sq = filters.search_query
            stmt = stmt.where(
                or_(
                    Doctor.name.icontains(sq),
                    Doctor.primary_specialization.icontains(sq)
                )
            )

        return stmt
