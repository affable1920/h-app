import asyncio
import logging
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Cookie,
    Depends,
    Form,
    Query,
    Response
)

from app.services.MailService import MailService
from app.database.entry_async import get_db
from app.schemas.enums import UserRoleV2
from app.schemas.user import UserResponse
from app.database.models import Doctor, Patient
from app.features.auth.service import AuthService
from app.features.auth.EmailVerificationService import EmailVerificationService

from app.core.exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError
)
from app.features.auth.dependencies import (
    clear_auth_headers,
    extract_cookie,
    get_current_user,
    set_auth_headers
)
from app.schemas.doctor import (
    DoctorLogin,
    DrCreate,
    DrProfileResponse,
)
from app.schemas.patient import (
    PatientProfileResponse,
    PatientCreate,
    PatientLogin
)


router = APIRouter(prefix="/auth")
logger = logging.getLogger(__name__)


@router.post(
    "/register/patient",
    response_model=UserResponse | str,
    status_code=201
)
async def register_patient(
    user: PatientCreate,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    created = await AuthService.register_patient(
        session=session,
        payload=user
    )

    try:
        async with session.begin():
            access_token, refresh_token = AuthService.issue_session(
                session=session,
                user_id=created.id,
                role=UserRoleV2.PATIENT
            )

    except Exception:
        logger.exception(
            """Session issuance failed after successfull registration ...
            user_id: %s
            email: %s""",
            created.id,
            created.email
        )

        response.headers["x-session-issued"] = "false"
        return """Your account has been sucessfully created, but we could not log you in
        Please login manually ..!"""

    set_auth_headers(response, access_token, refresh_token)
    return created


@router.post(
    "/register/doctor",
    response_model=UserResponse | str
)
async def register_doctor(
    response: Response,
    data: Annotated[DrCreate, Form()],
    session: AsyncSession = Depends(get_db)
):
    created = await AuthService.register_doctor(
        session=session,
        payload=data
    )

    try:
        async with session.begin():
            access_token, refresh_token = AuthService.issue_session(
                session,
                created.id,
                UserRoleV2.DOCTOR
            )

    except Exception:
        logger.exception(
            """Session issuance failed after successfull registration ...
            user_id: %s
            email: %s""",
            created.id,
            created.email
        )

        response.headers["x-session-issued"] = "false"
        return (
            """
        Your account has been sucessfully created, but we could not log you in 
        Please login manually ..
        """
        )

    set_auth_headers(response, access_token, refresh_token)
    return created


@router.post(
    "/login/patient",
    response_model=UserResponse
)
async def login_patient(
    user_cred: PatientLogin,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    access_token, refresh_token, patient = await AuthService.login_patient(
        session=session,
        credentials=user_cred
    )

    set_auth_headers(response, access_token, refresh_token)
    return patient


@router.post(
    "/login/doctor",
    response_model=UserResponse
)
async def login_doctor(
    response: Response,
    credentials: DoctorLogin,
    session: AsyncSession = Depends(get_db)
):
    access_token, refresh_token, doctor = await AuthService.login_doctor(
        credentials=credentials,
        session=session
    )

    set_auth_headers(response, access_token, refresh_token)
    return doctor


@router.get(
    path="/me",
    response_model=(
        DrProfileResponse
        | PatientProfileResponse
    )
)
async def me(
    current_user: Doctor | Patient = Depends(get_current_user)
):
    if isinstance(current_user, Doctor):
        return DrProfileResponse.model_validate(
            current_user,
            by_name=True
        )

    elif isinstance(
        current_user,
        Patient
    ):
        return PatientProfileResponse.model_validate(
            current_user,
            by_name=True
        )

    raise AuthorizationError(
        message="You cannot access this resource without identifying yourself.",
        reason="User accessing profile endpoint wthout being authenticated"
    )


@router.delete(
    "",
    status_code=204
)
async def remove_account(
    cookie: str = Depends(extract_cookie),
    session: AsyncSession = Depends(get_db),
    user: Doctor | Patient = Depends(get_current_user)
):
    refresh_token = await AuthService.get_refresh_token(
        cookie,
        session
    )

    if refresh_token is None:
        raise AuthenticationError(
            message="We could not delete your account. Please try later..",
            reason="No refresh token record found.",
            code="missing_token"
        )

    try:
        await AuthService.revoke_against_family(
            family_id=refresh_token.family_id,
            session=session
        )

        await AuthService.remove_account(
            user.id,
            (
                UserRoleV2.DOCTOR
                if isinstance(user, Doctor)
                else UserRoleV2.PATIENT
            ),
            session
        )

        await session.commit()

    except Exception as e:
        logger.exception(e)
        await session.rollback()
        raise AppException from e


@router.post(
    "/request-email-verify",
    status_code=201
)
async def request(
    session: AsyncSession = Depends(get_db),
    current_user: Doctor | Patient = Depends(get_current_user)
):
    role = (
        UserRoleV2.DOCTOR
        if isinstance(current_user, Doctor)
        else UserRoleV2.PATIENT
    )

    if current_user.email_verified:
        return "Your email is already verified."

    verification_link = await EmailVerificationService.create_verification_mail(
        session=session,
        user_id=current_user.id,
        role=role
    )

    await session.commit()

    await asyncio.to_thread(
        MailService.send_verification_mail,
        recipient=current_user.email,
        verification_link=verification_link
    )

    return """A mail containing a verification link has been sent to you email address.
        Please click on the link to verify your email ..
        The link expires after 10 minutes from now .."""


@router.get(
    "/verify-email",
    status_code=204
)
async def email_verification(
    background_tasks: BackgroundTasks,
    token: str = Query(...),
    session: AsyncSession = Depends(get_db),
):
    email = await EmailVerificationService.verify_email(
        session=session,
        link=token
    )

    background_tasks.add_task(
        MailService.send_mail,
        recipient=email,
        content=(
            "Email Verification ",
            "Your email has been verified successfully ..!"
        )
    )


@router.post(
    "/refresh"
)
async def refresh(
    response: Response,
    cookie: str = Depends(extract_cookie),
    session: AsyncSession = Depends(get_db),
):
    access_token, refresh_token = await AuthService.rotate_refresh_token(
        session=session,
        refresh_token=cookie
    )

    await session.commit()
    set_auth_headers(response, access_token, refresh_token)


@router.post(
    "/logout",
    status_code=204,
    dependencies=[
        Depends(clear_auth_headers)
    ]
)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_db)
):
    if refresh_token:
        token = await AuthService.get_refresh_token(
            token=refresh_token,
            session=session
        )

        if token:
            await AuthService.revoke_against_family(
                family_id=token.family_id,
                session=session
            )

            await session.commit()
