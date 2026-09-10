import jwt

from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.core.exceptions import InvalidTokenError
from app.core.config import settings
from app.schemas.enums import UserRoleV2
from app.schemas.outputs import AuthHdrPayload


# Passwords

__ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def hash(pwd: str) -> str:
    # hashes passwords
    return __ctx.hash(secret=pwd)


def authenticate_pwd(pwd: str, hash: str) -> bool:
    # verify password against hash
    return __ctx.verify(secret=pwd, hash=hash)


"""

OAuth2PasswordBearer --
OAuth2PwdBearer is a dependency that auomatically extracts the bearer "token" 
inside the auth header

"""

# =============================================================================

# JWT


def create_access_token(
        id: str,
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
        payload=payload.model_dump(),
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
        raise InvalidTokenError(
            message="Session Expired",
            context={
                "headers": {
                    "x-session-expire": "true"
                }
            },
        )

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise InvalidTokenError()

#
