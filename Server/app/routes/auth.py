import json
from enum import Enum
from pathlib import Path
from datetime import timedelta

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter, HTTPException

from passlib.context import CryptContext
from jose import JWTError, jwt, ExpiredSignatureError

from app.services.users_service import users_service
from app.models.Auth import CreateUser, DBUser, LoginUser


base = "/auth"
tags: list[str | Enum] = ["auth"]

ALG = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"])

router = APIRouter(prefix="/auth", tags=tags)
users_file = Path("data/users.json")


def load_users():
    try:
        with open(users_file, "r") as f:
            return json.load(f)

    except FileNotFoundError:
        with open(users_file, "w") as f:
            json.dump([], f)
            return []


def create_access_token(data: dict, exp: timedelta | None = timedelta(hours=2)):
    payload = data.copy()
    if "pwd" in payload:
        del payload["pwd"]

    payload.update({"exp": exp})
    return jwt.encode(payload, key="secret", algorithm=ALG)


def decode_access_token(token: str):
    try:
        return jwt.decode(token, key="secret", algorithms=[ALG])

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register")
async def register(user: CreateUser):
    users = {}

    if user.email in users:
        return HTTPException(status_code=400, detail="Email already exists !")

    try:
        new_user = DBUser(**user.model_dump())
        print(new_user)
        users_service.save(new_user)

    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))

    token = create_access_token(user.model_dump())
    return JSONResponse(content=new_user, status_code=201, headers={"x-auth-token": token})


@router.post("/login")
async def login(user_cred: LoginUser):
    pass
