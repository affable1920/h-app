from typing import Iterable, Tuple
from groq.types.chat import ChatCompletionMessageParam

from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session

from app.services.entities.main import EntityService
from app.shared.enums import Status
from app.database.models import Doctor
from app.schemas.query_params import DrRouteFilters

msgs: Iterable[ChatCompletionMessageParam] = [
    {
        "role": "system",
        "content": ""
    },
    {
        "role": "user",
        "content": ""
    }
]


class DoctorService(EntityService[Doctor]):
    def __init__(self, session: Session):
        super().__init__(session, Doctor)

    #

    def search(self, query: str) -> Select[Tuple[Doctor]] | None:
        stmt = select(Doctor).where(or_(
            Doctor.name.icontains(query),
            Doctor.primary_specialization.icontains(query)
        ))

        return stmt

    #

    def filter(
        self, stmt: Select[Tuple[Doctor]], filters: DrRouteFilters
    ) -> Select[Tuple[Doctor]]:
        """
        (args): all filters to be used for doctors

        Return -> a query with only the doctors that meet the filter criteria.

        This utility func only extracts fields from the query params that we use,
        (in this route), to filter doctors.

        So, this func has nothing to do with sorting and paginating.
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
            search_stmt = self.search(filters.search_query)
            stmt = search_stmt if search_stmt is not None else stmt

        return stmt
