from sqlalchemy import select
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.models import User

import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class UserService:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self, db):
        self.session: Session = db

    #

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)

        result = self.session.scalar(stmt)
        logger.debug(f"\nQuerying user database...\nUsing email: {result}")
        return result

    #

    def get_by_id(self, id: str) -> User | None:
        stmt = select(User).where(User.id == id)

        result = self.session.scalar(stmt)
        return result

    #

    def hash_pwd(self, pwd: str) -> str:
        return self.context.hash(pwd)

    #

    def verify_pwd(self, pwd: str, hash: str) -> bool:
        return self.context.verify(pwd, hash)

    #

    def save(self, email: str, password: str, username: str):
        created_user = User(
            email=email,
            username=username,
            password=self.hash_pwd(pwd=password),
        )

        self.session.add(created_user)
        self.session.flush([created_user])

        return created_user
