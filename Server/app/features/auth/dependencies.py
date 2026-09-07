from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.database.models import Doctor, Patient
from app.features.auth.service import AuthService
from app.features.auth import security
from app.database.entry_async import get_db

bearer = OAuth2PasswordBearer(tokenUrl="auth")


async def get_current_user(
    token: str = Depends(bearer),
    session: AsyncSession = Depends(get_db),
):
    """
    This function uses the bearer as a dependency.

    The auth scheme automatically extracts the bearer token and the function itself returns
    the decoded user to any function which uses this function as a dependency

    [Return] - Token payload dict
    """

    identity = security.decode_access_token(token)

    return (await AuthService.get_current_user(
        session=session,
        user_id=identity.id,
        role=identity.role.value,
    ))


#
async def require_doctor(
        current_user: Doctor | Patient = Depends(get_current_user)
):
    if not isinstance(current_user, Doctor):
        raise ConflictError(
            message="You as a patient are not allowed to access this resource."
        )

    return current_user


#

async def require_patient(
        current_user: Doctor | Patient = Depends(get_current_user),
):
    if not isinstance(current_user, Patient):
        raise ConflictError(
            message="You as a doctor are not allowed to access this resource."
        )

    return current_user
