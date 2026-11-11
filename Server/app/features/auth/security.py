import hashlib
from uuid import UUID

import jwt

from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.core.exceptions import AuthenticationError
from app.core.config import settings
from app.schemas.enums import UserRoleV2
from app.schemas.auth import AuthHdrPayload


__ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def hash(pwd: str) -> str:
    # hashes passwords
    return __ctx.hash(secret=pwd)


def authenticate_pwd(pwd: str, hash: str) -> bool:
    # verify password against hash
    return __ctx.verify(secret=pwd, hash=hash)


def create_access_token(
        id: UUID,
        role: UserRoleV2,
        exp_dur: timedelta = timedelta(days=2)
) -> str:
    iat = datetime.now()
    exp = iat + exp_dur

    payload = AuthHdrPayload(
        id=id,
        role=role,
        iat=iat.timestamp(),
        exp=exp.timestamp(),
    )

    return jwt.encode(
        payload=payload.model_dump(mode="json"),
        key=settings.jwt_secret,
        algorithm="HS256"
    )


def decode_access_token(token: str) -> AuthHdrPayload:
    try:
        decoded = jwt.decode(
            jwt=token,
            key=settings.jwt_secret,
            algorithms=["HS256"]
        )

        return AuthHdrPayload.model_validate(decoded)

    except jwt.ExpiredSignatureError:
        raise AuthenticationError(
            message="Session Expired",
            context={
                "headers": {
                    "x-session-expire": "true"
                }
            },
        )

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise AuthenticationError("Invalid session token..")

#


def hash_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
