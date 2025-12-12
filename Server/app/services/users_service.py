import json
from typing import Self
from pathlib import Path

from fastapi import HTTPException
from threading import Lock
from passlib.context import CryptContext
from app.schemas.user import DBUser


class UserService:
    instance = None
    users: dict[str, dict] = {}
    users_file = Path("data/users.json")
    lock = Lock()
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __new__(cls) -> Self:
        if not cls.instance:
            cls.instance = super().__new__(cls)
            cls.instance.load()

        return cls.instance

    #

    @classmethod
    def create_file(cls):
        with cls.lock:
            with open(cls.users_file, "w") as f:
                json.dump({}, f, indent=4)

    #

    @classmethod
    def load(cls):
        if not cls.users_file.exists() or cls.users_file.stat().st_size == 0:
            UserService.create_file()
            return {}

        try:
            with open(cls.users_file, "r") as f:
                cls.users = json.load(f)

        except json.JSONDecodeError as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error loading users !")

        except FileNotFoundError as e:
            print(e)
            cls.create_file()
            return {}

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error loading users !")

    #

    def get_user(self, email: str) -> DBUser | None:
        rqstd = self.users.get(email, None)
        return DBUser(**rqstd) if rqstd else None

    #

    def hash_pwd(self, pwd) -> str:
        return self.context.hash(pwd)

    #

    def verify_pwd(self, pwd, hash) -> bool:
        return self.context.verify(pwd, hash)

    #

    def save(self, user: dict) -> dict:
        db_user = DBUser(**user)

        hashed_pwd = self.hash_pwd(db_user.password)
        db_user.password = hashed_pwd

        updated_users = self.users.copy()
        updated_users[db_user.email] = db_user.model_dump()

        try:
            with open(self.users_file, "w") as f:
                json.dump(updated_users, f, indent=4)

                print("User successfully saved!")
                return db_user.model_dump(exclude={"password"})

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error saving users !")

    #

    def verify_user(self, email: str, password: str) -> dict:
        db_user = self.get_user(email)
        if not db_user:
            raise HTTPException(status_code=404, detail="Invalid email Id")

        pwd_is_valid = self.verify_pwd(password, db_user.password)

        if not pwd_is_valid:
            raise HTTPException(status_code=401, detail="Invalid password")

        return db_user.model_dump(exclude={"password"})
