from typing import (
    Any,
    Sequence,
    TypeVar
)

import logging
from uuid import UUID

from sqlalchemy import (
    ColumnExpressionArgument,
    Select,
    func,
    select,
)
from sqlalchemy.orm import DeclarativeBase

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.schemas.pagination import (
    PaginationParams,
)


T = TypeVar("T", bound=DeclarativeBase)

logger = logging.getLogger(__name__)


class QueryService:
    """Completely model-agnostic query utility."""

    @staticmethod
    async def get_all(
            base_statement: Select,
            session: AsyncSession,
            where_clauses: list[ColumnExpressionArgument] | None = None,
            ordering_clauses: list[Any] | None = None,
            pagination: PaginationParams | None = None,
            loaders: list[_AbstractLoad] | None = None,
    ) -> tuple[int, Sequence[T]]:
        stmt = base_statement

        if where_clauses is not None:
            stmt = stmt.where(*where_clauses)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        count = await session.scalar(count_stmt) or 0

        if ordering_clauses is not None:
            stmt = stmt.order_by(*ordering_clauses)

        if pagination is not None:
            stmt = QueryService.paginate(stmt, pagination)

        if loaders is not None:
            stmt = stmt.options(*loaders)

        objs = await session.scalars(stmt)
        return count, objs.all()

    @staticmethod
    def paginate(stmt: Select, pagination: PaginationParams) -> Select:
        """ Concrete method - pagination logic is truly generic """
        stmt = stmt.offset(pagination.offset).limit(pagination.page_size)
        return stmt

    @staticmethod
    async def get_by_id(
        model: type[T],
        entity_id: UUID,
        session: AsyncSession,
        where_clauses: list[ColumnExpressionArgument] | None = None,
        loader_options: list[_AbstractLoad] = []
    ) -> T | None:
        where = [
            *(
                where_clauses
                if where_clauses is not None
                else []
            ),
            getattr(model, "id") == entity_id
        ]
        stmt = (
            select(model)
            .where(*where)
            .options(*loader_options)
        )

        result = await session.scalar(stmt)
        return result
