from fastapi import Depends, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError
)
from app.database.models import Doctor, Patient
from app.features.auth.service import AuthService
from app.features.auth import security
from app.database.entry_async import get_db

bearer = OAuth2PasswordBearer(tokenUrl="auth")


__MAX_COOKIE_AGE = 60 * 60 * 24 * 14  # 14 days


async def get_current_user(
    token: str = Depends(bearer),
    session: AsyncSession = Depends(get_db),
) -> Doctor | Patient:
    """
    This function uses the bearer as a dependency automatically extracting the authorization header. 
    The function then itself returns the decoded user to any function 
    which uses this function as a dependency.
    """

    identity = security.decode_access_token(token)

    current_user = await AuthService.get_current_user(
        session=session,
        user_id=identity.id,
        role=identity.role,
    )

    if current_user is None:
        raise AuthenticationError(
            message="You could not be authenticated. Please login and re-try."
        )

    return current_user


async def require_doctor(
        current_user: Doctor | Patient = Depends(get_current_user)
) -> Doctor:
    if not isinstance(current_user, Doctor):
        raise AuthorizationError(
            message="You as a patient are not allowed to access this resource."
        )

    return current_user


async def require_patient(
        current_user: Doctor | Patient = Depends(get_current_user),
) -> Patient:
    if not isinstance(
        current_user,
        Patient
    ):
        raise AuthorizationError(
            message="You as a doctor are not allowed to access this resource."
        )

    return current_user


def extract_cookie(
        request: Request
) -> str:
    cookie = request.cookies.get("refresh_token")

    if cookie is None:
        raise AuthenticationError(
            message="Refresh token not found.",
            code="invalid_request"
        )

    return cookie


def set_auth_headers(
        response: Response,
        access_token: str,
        refresh_token: str
):
    response.headers["x-auth-token"] = access_token
    response.headers["Cache-Control"] = "no-store"

    response.set_cookie(
        key="refresh_token", value=refresh_token,
        path="/auth", httponly=True, secure=True,
        samesite="none", max_age=__MAX_COOKIE_AGE
    )
