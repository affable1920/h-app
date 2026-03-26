import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer

from fastapi import (
    HTTPException,
    Depends,
)
from sqlalchemy.orm import Session

from app.database.models import User
from app.database.entry import get_db
from app.core.config import JWT_SECRET, ALG
from app.services.users_service import UserService

from app.schemas.http import Payload


TOKEN_KEY = "access_token"

"""

OAuth2PasswordBearer --
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" inside the auth header

"""

bearer = OAuth2PasswordBearer(tokenUrl="auth")


def create_access_token(data: dict, exp_dur: timedelta = timedelta(days=2)) -> str:
    payload = data.copy()

    if "password" in payload:
        del payload["password"]

    iat = datetime.now()
    exp = iat + exp_dur

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
    session: Session = Depends(get_db),
) -> User | None:
    service = UserService(db=session)
    usr = service.get_by_id(id=payload.get("sub", ""))

    if not usr:
        raise HTTPException(
            404, {"msg": "User does not exist ..", "type": "Invalid credentials"})

    return usr
