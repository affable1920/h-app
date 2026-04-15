from uuid import UUID

import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer

from fastapi import (
    HTTPException,
    Depends,
)
import sqlalchemy
import sqlalchemy.orm

from app.database.entry import get_db
from app.services.users_service import UserService
from app.shared.enums import UserRole
from app.core.config import JWT_SECRET, ALG

from app.schemas.http import Payload


TOKEN_KEY = "access_token"

"""

OAuth2PasswordBearer --
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" inside the auth header

"""

bearer = OAuth2PasswordBearer(tokenUrl="auth")


def create_access_token(id: UUID, role: UserRole, exp_dur: timedelta = timedelta(days=2)) -> str:
    # if "password" in payload:
    # del payload["password"]
    #
    iat = datetime.now()
    exp = iat + exp_dur

    payload = Payload(
        id=id, role=role,
        iat=iat.timestamp(),
        exp=exp.timestamp(),
    )

    try:
        return jwt.encode(payload.model_dump(), key=JWT_SECRET, algorithm=ALG)

    except jwt.PyJWTError as e:
        print(e)
        raise HTTPException(
            500,
            detail={
                "msg": "An internal server error occurred",
                "type": "Error creating access token",
                "detail": str(e),
            },
        )


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
            {"msg": "Token expired. please login again", "type": "Session expiry"},
            {"x-session-expire": "true"},
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
            401, {"msg": "Invalid token payload", "type": "Invalid credentials"})

    return UUID(payload["id"])


def decode(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, [ALG])

    except jwt.ExpiredSignatureError:
        raise

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise


#

def get_usr(payload: dict = Depends(decode), session: sqlalchemy.orm.Session = Depends(get_db)):
    usr_id = payload.get("id")

    if usr_id is None:
        raise HTTPException(
            404, "The requested user could not be found."
        )

    return UserService(db=session).get_by_id(id=usr_id)
