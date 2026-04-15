from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs, create_async_engine, async_sessionmaker

from app.core.config import DATABASE_URL


class Base(AsyncAttrs, DeclarativeBase):
    pass


def create_url_async() -> str:
    global DATABASE_URL
    postgresql, config = DATABASE_URL.split("://")

    DATABASE_URL = postgresql + "+asyncpg://" + config
    return DATABASE_URL


engine = create_async_engine(url=create_url_async(), pool_size=10)


async def get_db():
    """
    create_async_engine args:

    [arg 1] url
    [arg 2] pool_size -> max persistent connections    

    The expire_on_commit boolean paramter to the async_sessionmaker is critical.

    By default, after we commit in sqlalchemy, attributes are expired, 
    triggering lazy loading which is fine in sync sessions.

    But accessing lazy attrs outside a session for a given async session 'll
    raise an error. This flag prevents that.
    """

    # Async session maker -> a factory for new Async sessions
    AsyncSession = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        autoflush=False,
    )

    async with AsyncSession() as session:
        yield session
