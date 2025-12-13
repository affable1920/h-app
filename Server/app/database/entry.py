from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


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


DATABASE_URL = "postgresql://postgres:Ss%402332253@localhost:5432/sopore_i_fix"
Base = declarative_base()
engine = create_engine(url=DATABASE_URL)

# Dependency to get DB session


def get_db():
    Session = sessionmaker(autoflush=False, autocommit=False, bind=engine)
    session = Session()

    try:
        yield session

    finally:
        session.close()
