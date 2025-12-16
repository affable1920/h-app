from fastapi import HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database.models import User, UserRole


class UserService:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self, db):
        self.db: Session = db

    #

    def get_user(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    #

    def hash_pwd(self, pwd: str) -> str:
        return self.context.hash(pwd)

    #

    def verify_pwd(self, pwd: str, hash: str) -> bool:
        return self.context.verify(pwd, hash)

    #

    def create(self, email: str, password: str, username: str, role: UserRole) -> User:
        created_user = User(
            email=email, username=username, password=password, role=role
        )
        return created_user

    #

    def save(self, email: str, password: str, username: str, role: UserRole):
        hashed_pwd = self.hash_pwd(password)

        try:
            db_user = self.create(
                email=email, username=username, password=hashed_pwd, role=role
            )

            self.db.add(db_user)
            self.db.commit()

        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=500,
                detail="Error saving users !",
            )
