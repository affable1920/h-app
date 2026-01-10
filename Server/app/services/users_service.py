from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError

from app.database.models import User


class UserService:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self, db):
        self.db: Session = db

    #

    def get_by_email(self, email: str) -> User | None:
        rqstd_user = self.db.query(User).filter(User.email == email).first()
        return rqstd_user if rqstd_user else None

    #

    def get_by_id(self, id: str) -> User | None:
        rqstd_user = self.db.query(User).filter(User.id == id).first()
        return rqstd_user if rqstd_user else None

    #

    def hash_pwd(self, pwd: str) -> str:
        return self.context.hash(pwd)

    #

    def verify_pwd(self, pwd: str, hash: str) -> bool:
        return self.context.verify(pwd, hash)

    #

    def save(self, email: str, password: str, username: str):
        hashed_pwd = self.hash_pwd(password)

        try:
            db_user = User(
                email=email,
                username=username,
                password=hashed_pwd,
            )

            self.db.add(db_user)
            self.db.commit()

            return db_user

        except SQLAlchemyError as e:
            print(e)
            self.db.rollback()
            raise HTTPException(
                500,
                {
                    "detail": e,
                    "type": "DATABASE ERROR",
                    "msg": "An unexpected error occurred.",
                },
            )

        except Exception as e:
            self.db.rollback()
            raise
