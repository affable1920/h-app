from abc import abstractmethod
import logging
from typing import Generic, Sequence, Type, TypeVar
from uuid import UUID

from sqlalchemy import Select, func, select

from sqlalchemy.orm import Session, DeclarativeBase, selectin_polymorphic

from app.database.models import User
from app.schemas.query_params import BaseFilters, PaginationParams, SortOrder

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


T = TypeVar("T", bound=DeclarativeBase)


class EntityService(Generic[T]):
    def __init__(self, session: Session, entity: Type[T]) -> None:
        self.session = session
        self.entity = entity

    #

    @abstractmethod
    def filter(self, stmt: Select, filters) -> Select:
        """
        Abstract method - 
        Apply entity-specific filters. Must be implemented by subclass.
        """
        pass

    #

    def paginate(self, stmt: Select, pagination: PaginationParams) -> Select:
        """ Concrete method - pagination logic is truly generic """
        if pagination.sort_by:
            col = getattr(self.entity, pagination.sort_by, None)

            if col is not None:
                if pagination.sort_order == SortOrder.DESC:
                    col = col.desc()

                stmt = stmt.order_by(col)

        stmt = stmt.offset(pagination.offset).limit(pagination.max)
        return stmt

    #

    def create_pg_response(self, objs: Sequence, pagination: PaginationParams):
        count = self.session.scalar(
            select(func.count()).select_from(self.entity)) or 0
        last_page = count // pagination.max

        return ({
            "entities": objs, "count": count,
            "has_next": pagination.page < last_page, "has_prev": pagination.page > 1
        })

    #

    def get_all(self, pagination: PaginationParams, filters: BaseFilters | None = None) -> Sequence[T]:
        """ Public API - combines abstract methods' implementations """
        logger.info(
            f"\nget all request for {self.entity}")
        loader_opt = selectin_polymorphic(User, [self.entity])
        stmt = select(self.entity).options(loader_opt)

        if filters:
            stmt = self.filter(stmt, filters)

        stmt = self.paginate(stmt, pagination)

        result = self.session.scalars(stmt).all()
        return result

    #

    def get_by_id(self, id: UUID) -> T | None:
        stmt = select(self.entity).where(getattr(self.entity, 'id') == id)
        result = self.session.scalar(stmt)
        return result
