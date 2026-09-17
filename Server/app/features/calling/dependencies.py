import jwt
from fastapi import Depends, HTTPException
from app.core.config import settings


def decode(token: str):
    try:
        return jwt.decode(token, settings.jwt_secret, ["HS256"])

    except jwt.ExpiredSignatureError:
        raise

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise


#

def get_usr(payload: dict = Depends(decode)):
    usr_id = payload.get("id")

    if usr_id is None:
        raise HTTPException(
            404, "The requested user could not be found."
        )

    return None
