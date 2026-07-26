import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Response
from app.schemas.enums import UserRoleV2
from app.database.models import Doctor
from app.database.entry_async import get_db
from app.schemas.inputs import DoctorLogin, DrCreate, PatientLogin, PatientCreate, get_dr_onboarding
from app.schemas.outputs import (
    DrProfileResponse,
    PatientProfileResponse,
    UserResponse
)
from app.services.PatientService import PatientService
from app.services.DrService import DoctorService
from app.middleware.auth_middleware import (
    authenticate_pwd,
    create_access_token,
    decode_access_token,
    get_curr_user,
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
        async with session.begin():
            created = await PatientService.create(session, user)

    except ValueError as e:
        logger.info(e)
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    logger.info("Patient sucessfully created and committed to database.")

    try:
        token = create_access_token(
            id=str(created.id),
            role=UserRoleV2.PATIENT
        )

    except Exception as e:
        logger.debug(e)
        raise HTTPException(
            500,
            detail={
                "msg": "Your account was successfully created but we couldn't log you in. Please login manually."
            }
        )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(created)

#


@router.post("/login/patient", response_model=UserResponse)
async def login_pt(user_cred: PatientLogin, response: Response, session: AsyncSession = Depends(get_db)):
    try:
        row = await PatientService.get_by_email(session, user_cred.email)

        if row is None:
            raise ValueError("Invalid email !")

        is_authenticated = authenticate_pwd(
            user_cred.password,
            row.hash
        )

        if not is_authenticated:
            raise ValueError("Invalid password !")

        token = create_access_token(id=str(row.id), role=UserRoleV2.PATIENT)
        response.headers["x-auth-token"] = token

        return UserResponse.model_validate(row)

    except ValueError as e:
        logger.debug(e)
        raise HTTPException(
            401,
            detail={"msg": str(e), "type": "Invalid credentials"},
        )

    except Exception as e:
        logger.debug(e)
        raise HTTPException(
            500
        )

#


@router.post("/register/doctor", response_model=UserResponse)
async def register_dr(
    response: Response,
    data: DrCreate = Depends(get_dr_onboarding),
    session: AsyncSession = Depends(get_db)
):
    try:
        async with session.begin():
            created = await DoctorService.create(session=session, data=data)

    except ValueError as e:
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    try:
        token = create_access_token(
            id=created.id.__str__(),
            role=UserRoleV2.DOCTOR
        )

        response.headers["x-auth-token"] = token
        return UserResponse.model_validate(created)

    except Exception as e:
        raise HTTPException(
            500,
            detail={
                "msg": "Your account was successfully created but we couldn't log you in. "
                "Please login manually."
            }
        )


#


@router.post("/login/doctor")
async def login_dr(credentials: DoctorLogin, response: Response, session: AsyncSession = Depends(get_db)):
    method_used = "id" if credentials.id else 'email'
    cred = credentials.model_dump()

    assert cred[method_used] is not None, "Id or email can not be None"

    row = await DoctorService.get(
        session=session,
        identKey=method_used,
        identVal=cred[method_used]
    )

    if not row:
        raise HTTPException(
            401,
            detail={
                "msg": f"Invalid {method_used}"
            }
        )

    if not authenticate_pwd(credentials.password, row.hash):
        raise HTTPException(
            401,
            detail={
                "msg": "Invalid password."
            }
        )

    token = create_access_token(
        id=row.id.__str__(),
        role=UserRoleV2.DOCTOR
    )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(row)

#


@router.get("/me", response_model=DrProfileResponse | PatientProfileResponse)
async def profile(
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    user = await get_curr_user(
        session=session,
        payload=payload
    )

    if user is None:
        raise HTTPException(
            404,
            detail={
                "type": "Not authenticated",
                "msg": "The user does not exist.",
            }
        )

    if isinstance(user, Doctor):
        return DrProfileResponse.model_validate(user)
    return PatientProfileResponse.model_validate(user)
