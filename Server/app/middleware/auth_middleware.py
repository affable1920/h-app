
from typing import Callable, Optional, Union

import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer

from fastapi import (
    HTTPException,
    Depends,
)
from sqlalchemy import select

from app.database.models import Doctor, Patient
from app.database.entry import get_db
from app.schemas.enums import UserRoleV2
from app.core.config import JWT_SECRET, ALG
from app.schemas.outputs import AuthHdrPayload
from sqlalchemy.orm import Session
from passlib.context import CryptContext


__ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def hash(pwd: str) -> str:
    return __ctx.hash(secret=pwd)


def authenticate_pwd(pwd: str, hash: str) -> bool:
    return __ctx.verify(secret=pwd, hash=hash)


"""

OAuth2PasswordBearer --
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" inside the auth header

"""

bearer = OAuth2PasswordBearer(tokenUrl="auth")


def create_access_token(id: str, role: UserRoleV2, exp_dur: timedelta = timedelta(days=2)) -> str:
    iat = datetime.now()
    exp = iat + exp_dur

    payload = AuthHdrPayload(
        id=id, role=role,
        iat=iat.timestamp(),
        exp=exp.timestamp(),
    )

    return jwt.encode(payload.model_dump(), key=JWT_SECRET, algorithm=ALG)


def decode_access_token(token: str = Depends(bearer)) -> dict:
    """
    This function uses the bearer as a dependency.

    The auth scheme automatically extracts the bearer token and the function itself returns
    the decoded user to any function which uses this function as a dependency
    """
    try:
        return jwt.decode(jwt=token, key=JWT_SECRET, algorithms=[ALG])

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            401,
            detail={
                "msg": "Token expired. please login again",
                "type": "Session expiry"
            },
            headers={"x-session-expire": "true"},
        )

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise HTTPException(
            401, {"type": "generic jwt error", "msg": "invalid token"})

#


def get_user(
    payload: dict = Depends(decode_access_token),
):
    if payload.get("id") is None:
        raise HTTPException(
            401,
            {
                "msg": "Invalid token payload",
                "type": "Invalid credentials"
            }
        )

    return payload["id"]


def get_curr_user(
    payload: dict = Depends(decode_access_token),
    session: Session = Depends(get_db)
):
    if not payload or payload.get("role") is None:
        return None

    model_map: dict[str, Callable[[], Optional[Doctor | Patient]]] = {
        "doctor": lambda: session.execute(
            select(Doctor).where(Doctor.id == payload["id"])
        ).scalar(),
        "patient": lambda: session.execute(
            select(Patient).where(Patient.id == payload["id"])
        ).scalar()
    }

    getter = model_map.get(payload["role"])

    if getter:
        return getter()
