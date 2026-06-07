import logging
from abc import ABC, abstractmethod
from typing import Generic, Sequence, Tuple, Type, TypeVar
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, DeclarativeBase
from app.schemas.outputs import PaginatedResponse
from app.schemas.internals import BaseFilters, PaginationParams, SortOrder

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


T = TypeVar("T", bound=DeclarativeBase)


class EntityService(Generic[T], ABC):
    def __init__(self, entity: Type[T]) -> None:
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

    def create_pg_response(self, objs: Sequence[T], count: int, pagination: PaginationParams):
        logger.info(
            f"\nSequence length for which create paginate response is called -> {len(objs)}")
        last_page = count // pagination.max
        has_next = (
            pagination.page < last_page and
            len(objs) >= pagination.max
        )
        return PaginatedResponse(
            entities=objs,
            count=count,
            has_next=has_next,
            has_prev=pagination.page > 1
        )

    #

    def get_all(self, session: Session, pagination: PaginationParams | None = None, filters: BaseFilters | None = None) -> Tuple[int, Sequence[T]]:
        """ Public API - combines abstract methods' implementations """
        stmt = select(self.entity)

        if filters:
            logger.info(f"Filtering params -> {filters}\n")
            stmt = self.filter(stmt, filters)

        if pagination:
            logger.info(f"pagination params -> {pagination}")
            stmt = self.paginate(stmt, pagination)

        result = session.scalars(stmt).all()
        count = session.scalar(
            select(func.count()).select_from(self.entity)) or 0

        return count, result

    #

    def get_by_id(self, session: Session, id: str) -> T | None:
        stmt = (
            select(self.entity)
            .where(getattr(self.entity, 'id') == id)
        )

        result = session.execute(stmt).scalar()
        return result

    #

    def get_by_email(self, session: Session, email: str) -> T | None:
        return session.scalar(
            select(self.entity).where(getattr(self.entity, "email") == email)
        )

    #

    def get(self, session: Session, identKey: str = "id", identVal: str = "") -> T | None:
        return session.scalar(
            select(self.entity).where(
                getattr(self.entity, identKey) == identVal)
        )

    #

    @abstractmethod
    async def create(self, session: Session, data) -> T:
        pass
