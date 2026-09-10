import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Query, Response

from app.features.auth.dependencies import get_current_user, require_patient
from app.features.auth.service import AuthService

from app.services import MailService
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


@router.post("/register/patient", response_model=PatientProfileResponse)
async def register_pt(
    user: PatientCreate,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    try:
        token, created = await AuthService.register_patient(
            session=session,
            payload=user
        )

    except AlreadyInUseException as e:
        logger.exception(e)
        raise HTTPException(
            409,
            detail={
                "code": "already_in_use",
                "message": "The email is already registered with another acoount.",
            }
        )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(created)

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
        logger.exception(e)
        raise HTTPException(
            409,
            detail={
                "code": "already_in_use",
                "message": e.message,
            }
        )

    response.headers["x-auth-token"] = token
    background_tasks.add_task(
        lambda: MailService.send_mail(
            recipient=created.email,
            msg=(
                f"You account has been sucessfully created."
                f"Welcome Onboard Dr {created.name} "
            )
        )
    )
    return UserResponse.model_validate(created)

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


ALLOWED_FIELDS = {"name", "email", "phone"}


@router.put("/edit")
async def edit(
    nw: str = Body(embed=True),
    q: str = Query(),
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if q not in ALLOWED_FIELDS:
        raise HTTPException(
            400,
            detail={
                "code": "unauthorized_error",
                "message": f"Bad request. You can only edit the following fields: {ALLOWED_FIELDS}"
            }
        )

    setattr(current_user, q, nw)

    await session.commit()
    await session.refresh(current_user)
