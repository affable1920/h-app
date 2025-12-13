from uuid import uuid4
from datetime import datetime
from app.database.entry import Base
from sqlalchemy import Column, DateTime, String


def gen_id():
    return uuid4().hex


class User(Base):
    __tablename__ = "users"

    id = Column(String(), primary_key=True, default=lambda: gen_id(), index=True)

    created_at = Column(DateTime(), default=datetime.now)
    email = Column(String(), unique=True, index=True, nullable=False)

    username = Column(String(), nullable=False)
    password = Column(String(), nullable=False)

    role = Column(String(), default="user", nullable=False)
