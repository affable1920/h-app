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

from app.features.auth.Sessions import Sessions
from app.services.MailService import MailService

from app.database.entry_async import get_db
from app.database.models import Doctor, Patient


from app.core.exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError
)
from app.features.auth.service import AuthService
from app.features.auth.VerificationService import VerificationService
from app.features.auth.dependencies import (
    clear_auth_headers,
    extract_cookie,
    get_current_user,
    set_auth_headers
)
from app.schemas.auth import ForgottenPasswordBody, ResetPasswordBody
from app.schemas.enums import UserRoleV2, VerificationTokenPurpose
from app.schemas.user import UserResponse
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
    async with session.begin():
        created = await AuthService.register_patient(
            session=session,
            payload=user
        )

        try:
            async with session.begin_nested():
                access, refresh = Sessions.issue_session(
                    session=session,
                    user_id=created.id,
                    role=UserRoleV2.PATIENT
                )
                await session.flush()

        except Exception:
            logger.exception(
                """Session issuance failed after successful registration ...
                user_id: %s
                email: %s""",
                created.id,
                created.email
            )

            response.headers["x-session-issued"] = "false"

            return """
            Your account has been successfully created, but we could not log you in
            Please login manually ..!
            """

    set_auth_headers(response, access, refresh)
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
    async with session.begin():
        created = await AuthService.register_doctor(
            session=session,
            payload=data
        )

        async with session.begin_nested():
            try:
                access_token, refresh_token = Sessions.issue_session(
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
                return """
                Your account has been sucessfully created, but we could not log you in 
                Please login manually ..
                """

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
    patient = await AuthService.validate_patient_credentials(
        session=session,
        credentials=user_cred
    )

    access, refresh = Sessions.issue_session(
        session,
        patient.id,
        UserRoleV2.PATIENT
    )

    await session.commit()

    set_auth_headers(response, access, refresh)
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
    doctor = await AuthService.validate_dr_credentials(
        credentials=credentials,
        session=session
    )

    access, refresh = Sessions.issue_session(
        session=session,
        user_id=doctor.id,
        role=UserRoleV2.DOCTOR
    )

    await session.commit()

    set_auth_headers(response, access, refresh)
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
    refresh_token = await Sessions.get_refresh_token(
        session=session,
        token=cookie,
    )

    if refresh_token is None:
        raise AuthenticationError(
            message="We could not delete your account. Please try later..",
            reason="No refresh token record found.",
            code="missing_token"
        )

    try:
        await Sessions.revoke_family(
            session=session,
            family_id=refresh_token.family_id
        )

        await AuthService.remove_account(
            session=session,
            user_id=user.id,
            role=(UserRoleV2.DOCTOR
                  if isinstance(user, Doctor)
                  else UserRoleV2.PATIENT
                  )
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
async def request_email_verification_link(
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

    verification_link = await VerificationService.issue(
        session=session,
        user_id=current_user.id,
        role=role,
        purpose=VerificationTokenPurpose.EMAIL_VERIFICATION
    )

    await session.commit()

    await asyncio.to_thread(
        MailService.send_verification_mail,
        recipient=current_user.email,
        verification_link=verification_link
    )

    return """A mail containing a verification link has been sent to you email address.
        Please click on the link to verify your email ..
        The link expires in 3 hours .."""


@router.get(
    "/verify-email",
    status_code=204
)
async def verify_email(
    background_tasks: BackgroundTasks,
    token: str = Query(...),
    session: AsyncSession = Depends(get_db),
):
    async with session.begin():
        claimed_token = await VerificationService.consume(
            raw=token,
            session=session,
            purpose=VerificationTokenPurpose.EMAIL_VERIFICATION
        )

        email = await AuthService.mark_email_verified(
            user_id=claimed_token.user_id,
            role=claimed_token.role,
            session=session
        )

    if email is None:
        return

    if email:
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
    session_pair = await Sessions.rotate(
        session=session,
        token=cookie
    )

    await session.commit()
    set_auth_headers(
        response,
        session_pair.access,
        session_pair.refresh
    )


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
        token = await Sessions.get_refresh_token(
            token=refresh_token,
            session=session
        )

        if token:
            await Sessions.revoke_family(
                session=session,
                family_id=token.family_id
            )

            await session.commit()


@router.post(
    "/forgot-password"
)
async def request_password_reset(
    body: ForgottenPasswordBody,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
):
    user = await AuthService.get_user_by_email(
        session=session,
        email=body.email,
    )

    if user is None:
        return """If the given address exists, you should have recieved a mail in your inbox."""

    role = (UserRoleV2.DOCTOR if isinstance(
        user, Doctor) else UserRoleV2.PATIENT)

    reset_link = await VerificationService.issue(
        session=session,
        user_id=user.id,
        role=role,
        purpose=VerificationTokenPurpose.PASSWORD_RESET
    )

    await session.commit()

    background_tasks.add_task(
        MailService.send_password_reset_mail,
        recipient=user.email,
        reset_link=reset_link
    )


@router.post(
    "/reset-password"
)
async def reset_password(
    body: ResetPasswordBody,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db)
):
    async with session.begin():
        user_id, role = await VerificationService.consume(
            raw=body.token,
            session=session,
            purpose=VerificationTokenPurpose.PASSWORD_RESET
        )

        email = await AuthService.reset_password(
            user_id=user_id,
            role=role,
            session=session,
            password=body.password
        )

        await Sessions.revoke_user_sessions(
            session=session,
            user_id=user_id,
            role=role
        )

    if email is None:
        return

    background_tasks.add_task(
        MailService.send_mail,
        recipient=email,
        content=(
            "Password reset sucessfull ",
            "Your password was sucessfully reset .."
        )
    )
