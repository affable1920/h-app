from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import DATABASE_URL


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


class Base(DeclarativeBase):
    pass


engine = create_engine(url=DATABASE_URL)


def get_db():
    # Dependency to get DB session
    Session = sessionmaker(autoflush=False, autocommit=False, bind=engine)
    session = Session()

    try:
        yield session

    finally:
        session.close()
