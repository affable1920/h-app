from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


"""
posgresql database url format -

postgresql - the type of db, :// self-explanatory,  postgres - the supervisor name
: - part of the format after which the pwd should be typed
after the pwd, use @ sign followed by the hostname (eg localhost) and port_name (eg 5432)

"Note"
If a password contains a special char like @, you must encode it 
or otherwise the url would break

@ - after encoding is mapped to %40
"""

load_dotenv()


class Base(DeclarativeBase):
    pass


engine = create_engine(url=settings.database_url)
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)


def get_db():
    """
    Dependency to get DB session 
    Routes our other consumers must manually rollback and commit
    """

    session = SessionLocal()

    try:
        yield session

    finally:
        session.close()
