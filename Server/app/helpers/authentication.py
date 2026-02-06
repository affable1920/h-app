from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta

from fastapi import (
    HTTPException,
    Depends,
    status,
)
from sqlalchemy.orm import Session

from app.database.entry import get_db
from app.database.models import Patient
from app.core.config import JWT_SECRET, ALG
from app.services.users_service import UserService

from app.schemas.http import Payload


TOKEN_KEY = "access_token"

"""

OAuth2PasswordBearer --
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" inside the auth header

"""

bearer = OAuth2PasswordBearer(tokenUrl="auth")


def create_access_token(
    data: dict, exp_dur: timedelta | None = timedelta(hours=2)
) -> str:
    payload = data.copy()

    if "password" in payload:
        del payload["password"]

    iat = datetime.now()
    exp = iat + exp_dur if exp_dur else iat + timedelta(hours=2)

    payload = Payload(
        **data,
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
    if not token:
        raise HTTPException(
            status_code=401, detail={"msg": "no token found", "type": "missing token"}
        )

    try:
        return jwt.decode(token, key=JWT_SECRET, algorithms=[ALG])

    except jwt.ExpiredSignatureError as e:
        print("Token expired:", e)
        raise HTTPException(
            headers={"x-session-expire": "true"},
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired ! Please log in again.",
        )

    except (jwt.InvalidTokenError, jwt.PyJWTError) as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            {"msg": "Invalid token", "type": "Token decode error", "detail": str(e)},
        )


def get_curr_user(
    access_token: str = Depends(decode_access_token),
    session: Session = Depends(get_db),
) -> Patient:
    if not access_token:
        print("no access token found in cookie...")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "No token found", "type": "auth"},
        )

    print("access token recieved in auth dependency", access_token)
    service = UserService(db=session)

    payload = decode_access_token(access_token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "Invalid token", "type": "auth"},
        )

    user = service.get_by_id(id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"msg": "User not found", "type": "auth"},
        )

    return user
