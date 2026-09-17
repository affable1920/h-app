import logging
import secrets
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Query, Response

from app.schemas.enums import UserRoleV2
from app.services.MailService import MailService
from app.features.auth.dependencies import get_current_user, require_patient
from app.features.auth.service import AuthService

from app.core.exceptions import AlreadyInUseException, EntityNotFoundException

from app.database.models import Doctor, Patient
from app.database.entry_async import get_db

from app.schemas.inputs import (
    DoctorLogin,
    DrCreate,
    PatientLogin,
    PatientCreate,
    get_dr_onboarding
)
from app.schemas.outputs import (
    DrProfileResponse,
    PatientProfileResponse,
    UserResponse
)


router = APIRouter(prefix="/auth")
logger = logging.getLogger(__name__)


@router.post(
    "/register/patient",
    response_model=UserResponse
)
async def register_pt(
    user: PatientCreate,
    response: Response,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db)
):
    try:
        token, created = await AuthService.register_patient(
            session=session,
            payload=user
        )

    except AlreadyInUseException as e:
        raise HTTPException(
            409,
            detail={
                "code": "already_in_use",
                "message": "The email provided is already registered with another account.",
            }
        ) from e

    raw_token = secrets.token_urlsafe(32)

    verification_link = AuthService.create_verification_link_record(
        created.id,
        UserRoleV2.PATIENT,
        raw_token
    )

    session.add(verification_link)
    await session.commit()

    background_tasks.add_task(
        MailService.send_verification_mail,
        recipient=created.email,
        verification_link=raw_token
    )

    response.headers["x-auth-token"] = token
    return created

#


@router.post("/login/patient", response_model=UserResponse)
async def login_pt(
    user_cred: PatientLogin,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    token, patient = await AuthService.login_patient(
        session=session,
        credentials=user_cred
    )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(patient)

#


@router.post("/register/doctor", response_model=UserResponse)
async def register_dr(
    response: Response,
    background_tasks: BackgroundTasks,
    data: DrCreate = Depends(get_dr_onboarding),
    session: AsyncSession = Depends(get_db)
):
    try:
        token, created = await AuthService.register_doctor(
            session=session,
            payload=data
        )

    except AlreadyInUseException as e:
        raise HTTPException(
            409,
            detail={
                "code": "already_in_use",
                "message": e.message,
            }
        )

    raw_token = secrets.token_urlsafe(32)
    verification_link = AuthService.create_verification_link_record(
        created.id,
        UserRoleV2.DOCTOR,
        raw_token
    )

    session.add(verification_link)
    await session.commit()

    background_tasks.add_task(
        MailService.send_verification_mail,
        recipient=created.email,
        verification_link=raw_token
    )

    response.headers["x-auth-token"] = token
    return created

#


@router.post("/login/doctor")
async def login_dr(
    credentials: DoctorLogin,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    token, doctor = await AuthService.login_doctor(
        credentials=credentials,
        session=session
    )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(doctor)

#


@router.get(
    path="/me",
    response_model=Optional[
        DrProfileResponse | PatientProfileResponse
    ]
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

    raise EntityNotFoundException(
        "user"
    )


#

@router.delete("")
async def remove_account(
    session: AsyncSession = Depends(get_db),
    patient: Patient = Depends(require_patient)
):
    await session.delete(patient)
    await session.commit()
    return "Account deleted sucessfully"


ALLOWED_FIELDS = {"name", "phone", "email"}


@router.put("/edit")
async def edit(
    nw: str = Body(embed=True),
    q: str = Query(),
    session: AsyncSession = Depends(get_db),
    current_user: Doctor | Patient = Depends(
        get_current_user
    )
):
    if q not in ALLOWED_FIELDS:
        raise HTTPException(
            400,
            detail={
                "code": "unauthorized_error",
                "message": f"Bad request. You can only edit the following fields: {ALLOWED_FIELDS}"
            }
        )

    if q == "email" and current_user.email_verified:
        raise HTTPException(
            409,
            detail={
                "code": "unauthorized_error",
                "message": "You cannot change your email address as your email is already verified."
            }
        )

    setattr(current_user, q, nw)

    await session.commit()
    await session.refresh(current_user)


#

@router.post("/request-email-verify")
async def request(
    session: AsyncSession = Depends(get_db),
    current_user: Doctor | Patient = Depends(
        get_current_user
    )
):
    if current_user.email_verified:
        return "Your email is already verified."

    await AuthService.send_verification_mail(
        session=session,
        user=current_user
    )

    return (
        "An email containing a verification link has been sent to you email address"
        "Please click on the link to verify your email."
        "The link expires after 5 minutes.."
    )


# The verification endpoint
@router.get("/verify-email")
async def email_verification(
    token: str = Query(...),
    session: AsyncSession = Depends(get_db),
):
    await AuthService.verify_email(
        session=session,
        link=token
    )
