import jwt
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends, status

from app.database.models import User
from app.database.entry import get_db
from app.services.users_service import UserService


ALG = "HS256"
SECRET = "SECRET"


auth_scheme = OAuth2PasswordBearer(tokenUrl="token")
"""
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" inside
the auth header

"""


def create_access_token(
    data: dict, exp_dur: timedelta | None = timedelta(hours=2)
) -> str:
    payload = data.copy()

    if "password" in payload:
        del payload["password"]

    iat = datetime.now()
    exp = iat + exp_dur if exp_dur else iat + timedelta(hours=2)

    payload.update(
        {
            "type": "access",
            "sub": payload.get("id"),
            "iat": iat.timestamp(),
            "exp": exp.timestamp(),
        }
    )

    try:
        return jwt.encode(payload, key=SECRET, algorithm=ALG)

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


def decode_and_get_current(
    token: str = Depends(auth_scheme), db: Session = Depends(get_db)
) -> dict | None:
    """
    This function uses the auth scheme as a dependency which
    automatically extracts the bearer token
    and the function itself returns the decoded user to any function which
    uses this function as a dependency
    """

    try:
        return jwt.decode(token, key=SECRET, algorithms=[ALG])

    except jwt.ExpiredSignatureError as e:
        print("Token expired:", e)
        raise HTTPException(
            headers={"x-session-expire": "true"},
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired ! Please log in again.",
        )

    except jwt.PyJWTError as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            {"msg": "Invalid token", "type": "Token decode error", "desc": str(e)},
        )
