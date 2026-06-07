from fastapi import Depends, HTTPException
import jwt
import sqlalchemy.orm

from app.database.entry import get_db
from app.core.config import settings


def decode(token: str):
    try:
        return jwt.decode(token, settings.jwt_secret, [settings.jwt_algorithm])

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

    return None
