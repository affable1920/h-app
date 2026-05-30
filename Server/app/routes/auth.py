import logging
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Response
from app.schemas.enums import UserRoleV2
from app.database.models import Doctor, Patient
from app.database.entry import get_db
from app.schemas.inputs import DoctorLogin, DrCreate, PatientLogin, PatientCreate, get_dr_onboarding
from app.schemas.outputs import (
    DrProfileResponse,
    PatientProfileResponse,
    UserResponse
)
from app.services.PatientService import pt_srvc
from app.services.DrService import dr_srvc
from app.middleware.auth_middleware import (
    authenticate_pwd,
    create_access_token,
    get_curr_user,
)

router = APIRouter(prefix="/auth")
logger = logging.getLogger(__name__)


@router.post("/register/patient", response_model=PatientProfileResponse)
async def register_pt(user: PatientCreate, response: Response, session: Session = Depends(get_db)):
    try:
        with session.begin():
            created = pt_srvc.create(session, user)

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

    except Exception:
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
async def login_pt(user_cred: PatientLogin, response: Response, session: Session = Depends(get_db)):
    try:
        row = pt_srvc.get_by_email(session, user_cred.email)

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
    session: Session = Depends(get_db)
):
    try:
        with session.begin():
            created = await dr_srvc.create(session=session, data=data)

    except ValueError as e:
        raise HTTPException(
            400,
            detail={
                "msg": str(e)
            }
        )

    try:
        token = create_access_token(id=str(created.id), role=UserRoleV2.DOCTOR)
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
async def login_dr(credentials: DoctorLogin, response: Response, session: Session = Depends(get_db)):
    method_used = "id" if credentials.id else 'email'
    cred = credentials.model_dump()

    assert cred[method_used] is not None, "Id or email can not be None"

    row = dr_srvc.get(
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
        id=str(row.id),
        role=UserRoleV2.DOCTOR
    )

    response.headers["x-auth-token"] = token
    return UserResponse.model_validate(row)

#


@router.get("/me", response_model=DrProfileResponse | PatientProfileResponse)
async def profile(
    model: Doctor | Patient = Depends(get_curr_user),
):
    if model is None:
        raise HTTPException(
            404,
            detail={
                "msg": "No result found",
            }
        )

    if isinstance(model, Doctor):
        return DrProfileResponse.model_validate(model)

    elif isinstance(model, Patient):
        return PatientProfileResponse.model_validate(model)
