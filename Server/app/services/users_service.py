import json
from pathlib import Path
from typing_extensions import Self

from app.models.Auth import DBUser


class UsersService():
    _instance = None
    _users: dict[str, dict] = {}
    _file_path = Path("data/users.json")

    def __new__(cls) -> Self:
        if not cls._instance:
            cls.load()
            cls._instance = super().__new__(cls)

        return cls._instance

    @classmethod
    def load(cls):
        try:
            with open(cls._file_path, "r") as f:
                cls._users = json.load(f)

        except FileNotFoundError:
            with open(cls._file_path, "w") as f:
                json.dump([], f)
                cls._users = {}

    @classmethod
    def dump(cls, user: DBUser):
        upd_users = cls._users.copy()
        upd_users[user.id] = user.model_dump()

        with open(cls._file_path, "w") as f:
            json.dump(upd_users, f, indent=4)

    def get_by_id(self, id: str) -> dict | None:
        return self._users.get(id)

    def get_by_email(self, email: str) -> dict | None:
        for id, user in self._users.items():
            if user["email"] == email:
                return user

    def has(self, id: str) -> bool:
        return id in self._users

    def save(self, user: DBUser):
        self.dump(user)


users_service = UsersService()
