
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
from app.schemas.enums import UserRoleV2
from app.core.config import settings
from app.schemas.outputs import AuthHdrPayload
from sqlalchemy.ext.asyncio import AsyncSession
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

    return jwt.encode(payload.model_dump(), key=settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str = Depends(bearer)) -> dict:
    """
    This function uses the bearer as a dependency.

    The auth scheme automatically extracts the bearer token and the function itself returns
    the decoded user to any function which uses this function as a dependency
    """
    try:
        return jwt.decode(
            jwt=token,
            key=settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )

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


async def get_curr_user(
    session: AsyncSession,
    payload: dict,
):
    """
    Type Callable is used to define a type for a function,

    It takes an array of arguments as the first (type) argument 
    and the return type as the second argument -> i,e the type returned by the function
    in this case the function takes no arguments and returns an optional doctor or patient
    """

    role, user_id = payload.get("role"), payload.get("id")

    if not role or not user_id:
        raise ValueError("Invalid token.")

    if role == UserRoleV2.DOCTOR.value:
        stmt = select(Doctor).where(Doctor.id == user_id)

    elif role == UserRoleV2.PATIENT.value:
        stmt = select(Patient).where(Patient.id == user_id)

    else:
        return None

    result = await session.scalar(stmt)
    return result
