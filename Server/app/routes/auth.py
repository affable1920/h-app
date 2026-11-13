import logging
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import (
    APIRouter,
    Body,
    Depends,
    Query,
    Response
)

from app.database.entry_async import get_db
from app.schemas.enums import UserRoleV2
from app.schemas.user import UserResponse
from app.database.models import Doctor, Patient
from app.features.auth.service import AuthService
from app.features.auth.EmailVerificationService import EmailVerificationService

from app.core.exceptions import (
    AuthorizationError,
    ConflictError
)
from app.features.auth.dependencies import (
    extract_cookie,
    get_current_user,
    set_auth_headers
)
from app.schemas.doctor import (
    DoctorLogin,
    DrCreate,
    DrProfileResponse,
    get_dr_onboarding,
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
        async with session.begin_nested():
            access_token, refresh_token = AuthService.issue_session(
                session=session,
                user_id=created.id,
                role=UserRoleV2.PATIENT
            )

            await session.commit()

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
        Please login manually..
        """

    set_auth_headers(response, access_token, refresh_token)
    return created


@router.post(
    "/register/doctor",
    response_model=UserResponse | str
)
async def register_doctor(
    response: Response,
    data: DrCreate = Depends(get_dr_onboarding),
    session: AsyncSession = Depends(get_db)
):
    created = await AuthService.register_doctor(
        session=session,
        payload=data
    )

    try:
        async with session.begin_nested():
            access_token, refresh_token = AuthService.issue_session(
                session,
                created.id,
                UserRoleV2.DOCTOR
            )

            await session.commit()

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
        Please login manually..
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


@router.delete("")
async def remove_account(
    session: AsyncSession = Depends(get_db),
    user: Doctor | Patient = Depends(get_current_user)
):
    await session.delete(user)
    await session.commit()
    return "Account deleted sucessfully"


ALLOWED_FIELDS = {"name", "phone", "email"}


@router.put("/edit")
async def update_allowed_field(
    session: AsyncSession = Depends(get_db),
    current_user: Doctor | Patient = Depends(
        get_current_user
    ),
    property_key: str = Query(),
    property_value: str = Body(embed=True),
):
    if (
        property_key not in ALLOWED_FIELDS
    ):
        raise AuthorizationError(
            message="You can only edit name, phone and email.",
            code="field_not_editable",
            detail={
                "code": "unauthorized_error",
                "message": f"Bad request. You can only edit the following fields: \
                {ALLOWED_FIELDS}"
            }
        )

    if (
        property_key == "email"
        and current_user.email_verified
    ):
        raise ConflictError(
            code="email_already_verified",
            message="You cannot change your email address as "
            "your email is already verified.",
        )

    setattr(current_user, property_key, property_value)

    await session.commit()
    await session.refresh(current_user)


@router.post("/request-email-verify")
async def request(
    session: AsyncSession = Depends(get_db),
    current_user: Doctor | Patient = Depends(
        get_current_user
    )
):
    role = (
        UserRoleV2.DOCTOR
        if isinstance(current_user, Doctor)
        else UserRoleV2.PATIENT
    )

    if current_user.email_verified:
        return "Your email is already verified."

    await EmailVerificationService.send_verification_mail(
        session=session,
        user_id=current_user.id,
        email=current_user.email,
        role=role
    )

    return (
        "An email containing a verification link has been sent to you email address . "
        "Please click on the link to verify your email .."
        "The link expires after 30 minutes from now .."
    )


@router.get("/verify-email")
async def email_verification(
    token: str = Query(...),
    session: AsyncSession = Depends(get_db),
):
    await EmailVerificationService.verify_email(
        session=session,
        link=token
    )


@router.post("/refresh")
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
    status_code=204
)
async def logout(
    response: Response,
    cookie: str = Depends(extract_cookie),
    session: AsyncSession = Depends(get_db)
):
    token = await AuthService.get_refresh_token(
        token=cookie,
        session=session
    )

    if token:
        await AuthService.revoke_against_family(
            family_id=token.family_id,
            session=session
        )

    response.delete_cookie(
        key="refresh_token",
        path="/auth",
    )
