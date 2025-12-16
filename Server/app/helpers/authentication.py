import jwt
from jose import JWTError
from datetime import datetime, timedelta

from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session

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
        {"sub": payload.get("id"), "iat": iat.timestamp(), "exp": exp.timestamp()}
    )

    try:
        return jwt.encode(payload, key=SECRET, algorithm=ALG)

    except jwt.PyJWTError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error creating access token")


def decode_and_get_current(
    token: str = Depends(auth_scheme), db: Session = Depends(get_db)
):
    """
    This function uses the auth scheme as a dependency which
    automatically extracts the bearer token
    and the function itself returns the decoded user to any function that in turn
    uses this function as a dependency
    """

    try:
        payload = jwt.decode(token, key=SECRET, algorithms=[ALG])

    except jwt.ExpiredSignatureError as e:
        print("Token expired:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired ! Please log in again.",
            headers={"x-session-expire": "true"},
        )

    except JWTError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    curr_user = UserService(db).get_user(email=email)
    if not curr_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    return curr_user
