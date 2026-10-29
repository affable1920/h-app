import math
import logging
from abc import ABC, abstractmethod
from typing import (
    Any,
    ClassVar,
    Generic,
    Sequence,
    Type,
    TypeVar,
)

from sqlalchemy import (
    exists,
    literal,
    select
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.schemas.pagination import (
    PaginatedResponse,
    PaginationParams,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


T = TypeVar("T", bound=DeclarativeBase)


class EntityService(Generic[T], ABC):
    entity: ClassVar[Type]

    @classmethod
    @abstractmethod
    def load_base_options(cls) -> list[_AbstractLoad]:
        pass

    @classmethod
    @abstractmethod
    def load_all_options(cls) -> list[_AbstractLoad]:
        pass

    @staticmethod
    def create_paginated_response(
        objs: Sequence | list,
        count: int,
        pagination: PaginationParams
    ) -> PaginatedResponse:
        last_page = math.ceil(count / pagination.page_size)
        has_next = pagination.page < last_page

        return PaginatedResponse(
            entities=objs,
            has_next=has_next,
        )

    @classmethod
    async def get_by_email(
        cls,
        email: str,
        session: AsyncSession,
    ) -> T | None:
        stmt = (select(cls.entity)
                .options(*cls.load_all_options())
                .where(getattr(cls.entity, "email") == email)
                )

        return await session.scalar(stmt)

    @classmethod
    async def get(
        cls,
        session: AsyncSession,
        ident_key: str,
        ident_val: Any,
    ) -> T | None:
        stmt = (select(cls.entity)
                .options(*cls.load_all_options())
                .where(
                    getattr(cls.entity, ident_key)
                    == ident_val
        )
        )

        return await session.scalar(stmt)

    @classmethod
    async def email_exists(
        cls,
        session: AsyncSession,
        email: str
    ):
        return await session.scalar(
            select(literal(True)).where(exists().where(
                getattr(cls.entity, "email") == email))
        ) is not None
