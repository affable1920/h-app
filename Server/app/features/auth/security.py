import asyncio

import jwt
import hashlib
from uuid import UUID

from passlib.context import CryptContext
from datetime import (
    datetime,
    timedelta,
    timezone
)

from pydantic import ValidationError

from app.core.exceptions import AuthenticationError
from app.core.config import settings
from app.schemas.enums import UserRoleV2
from app.schemas.auth import AccessToken


__ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(pwd: str) -> str:
    return __ctx.hash(secret=pwd)


def hash_password_aio(pwd: str):
    return asyncio.to_thread(hash_password, pwd)


def authenticate_password(pwd: str, hash: str) -> bool:
    return __ctx.verify(secret=pwd, hash=hash)


def authenticate_password_aio(pwd: str, hash: str):
    return asyncio.to_thread(authenticate_password, pwd, hash)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def decode_access_token(token: str) -> AccessToken:
    try:
        decoded = jwt.decode(
            jwt=token,
            key=settings.jwt_secret,
            algorithms=["HS256"]
        )

        return AccessToken.model_validate(decoded)

    except ValidationError as e:
        raise AuthenticationError(
            message="Bad token recieved",
            details={
                "code": "invalid_token"
            }
        )

    except jwt.ExpiredSignatureError as e:
        raise AuthenticationError(
            message="Session Expired",
            headers={
                    "x-session-expire": "true"
            },
        ) from e

    except jwt.PyJWTError as e:
        raise AuthenticationError("Invalid token recieved.") from e


def create_access_token(
        user_id: UUID,
        role: UserRoleV2,
        exp_dur: timedelta = timedelta(minutes=15)
) -> str:
    iat = datetime.now(tz=timezone.utc)
    exp = iat + exp_dur

    payload = AccessToken(
        id=user_id,
        role=role,
        iat=iat.timestamp(),
        exp=exp.timestamp(),
    )

    return jwt.encode(
        payload=payload.model_dump(mode="json"),
        key=settings.jwt_secret,
        algorithm="HS256"
    )
