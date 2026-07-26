import math
import logging
from abc import ABC, abstractmethod
from typing import ClassVar, Generic, Sequence, Tuple, Type, TypeVar
from sqlalchemy import Select, exists, func, literal, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm.strategy_options import _AbstractLoad
from app.schemas.outputs import PaginatedResponse
from app.schemas.response_modifiers import BaseFilters, PaginationParams, SortOrder

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


T = TypeVar("T", bound=DeclarativeBase)


class EntityService(Generic[T], ABC):
    entity: ClassVar[Type]

    #

    @classmethod
    @abstractmethod
    def filter(cls, stmt: Select, filters) -> Select:
        """
        Abstract method - 
        Apply entity-specific filters. Must be implemented by subclass.

        Keep as is (not async) - only builds a query, makes no DB call
        """
        pass

    #

    @classmethod
    @abstractmethod
    def load_options(cls) -> list[_AbstractLoad]:
        pass

    #

    @classmethod
    @abstractmethod
    def load_options_full(cls) -> list[_AbstractLoad]:
        pass

    #

    @classmethod
    def sort(
        cls, stmt: Select,
        sort_col: str,
        sort_order: SortOrder
    ) -> Select:
        col = getattr(cls.entity, sort_col, None)
        logger.info(
            f"Request to sort entities by column ({sort_col}) in order: ({sort_order})"
        )

        if col is not None:
            if sort_order == SortOrder.DESC:
                col = col.desc()

            stmt = stmt.order_by(col)
        return stmt

    #

    @classmethod
    def paginate(cls, stmt: Select, pagination: PaginationParams) -> Select:
        """ Concrete method - pagination logic is truly generic """
        stmt = stmt.offset(pagination.offset).limit(pagination.max)
        return stmt

    #

    @staticmethod
    def create_pg_response(objs: Sequence[T], count: int, pagination: PaginationParams) -> PaginatedResponse:
        last_page = math.ceil(count / pagination.max)
        has_next = pagination.page < last_page

        return PaginatedResponse(
            entities=objs,
            count=count,
            has_next=has_next,
        )

    #

    @classmethod
    async def get_all(
        cls, session: AsyncSession,
        pagination: PaginationParams | None = None,
        filters: BaseFilters | None = None
    ) -> Tuple[int, Sequence[T]]:
        """ Public API - combines abstract methods' implementations """
        stmt = select(cls.entity)

        if filters:
            stmt = cls.filter(stmt, filters)

        count = await session.scalar(
            select(func.count()).select_from(
                stmt.subquery()
            )
        ) or 0

        if pagination is not None:
            if pagination.sort_by:
                stmt = cls.sort(
                    stmt,
                    pagination.sort_by,
                    pagination.sort_order if pagination.sort_order else SortOrder.ASC
                )

            stmt = cls.paginate(stmt, pagination)

        stmt = stmt.options(*cls.load_options())

        result = await session.scalars(stmt)
        return count, result.all()

    #

    @classmethod
    async def get_by_id(cls, session: AsyncSession, id: str) -> T | None:
        stmt = (
            select(cls.entity)
            .options(*cls.load_options_full())
            .where(getattr(cls.entity, 'id') == id)
        )

        result = await session.scalar(stmt)
        return result

    #

    @classmethod
    async def get_by_email(cls, session: AsyncSession, email: str) -> T | None:
        stmt = (select(cls.entity)
                .options(*cls.load_options_full())
                .where(getattr(cls.entity, "email") == email)
                )

        return await session.scalar(stmt)

    #

    @classmethod
    async def get(cls, session: AsyncSession, identKey: str = "id", identVal: str = "") -> T | None:
        stmt = (select(cls.entity)
                .options(*cls.load_options_full())
                .where(getattr(cls.entity, identKey) == identVal
                       ))

        return await session.scalar(stmt)

    #

    @classmethod
    async def email_exists(cls, session: AsyncSession, email: str):
        return await session.scalar(
            select(literal(True)).where(exists().where(
                getattr(cls.entity, "email") == email))
        ) is not None

    #

    @classmethod
    @abstractmethod
    async def create(cls, session: AsyncSession, data) -> T:
        pass
