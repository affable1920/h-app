from enum import Enum
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.entry import get_db
from app.database.models import Patient as DBUser
from app.services.users_service import UserService
from app.schemas.http import (
    CreateUser,
    LoginUser,
    ResponseUser,
)
from app.helpers.authentication import (
    create_access_token,
    get_curr_user,
)

base = "/auth"
tags: list[str | Enum] = ["auth"]
router = APIRouter(prefix="/auth", tags=tags)


@router.post("/register", response_model=ResponseUser)
async def register(user: CreateUser, db: Session = Depends(get_db)):
    service = UserService(db)

    try:
        if service.get_by_email(user.email):
            raise ValueError("Email already exists!")

        created_user = service.save(**user.model_dump())
        payload = ResponseUser.model_validate(created_user)

        token = create_access_token(payload.model_dump(mode="python"))
        response = JSONResponse(
            content=payload.model_dump(mode="json"),
            headers={"x-auth-token": token},
            status_code=status.HTTP_201_CREATED,
        )

        return response

    except ValueError as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail={"msg": str(e), "type": "bad request"}
        )

    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "msg": "An internal server error occurred !",
                "desc": "DATABASE ERROR",
                "detail": str(e),
            },
        )


@router.post("/login", response_model=ResponseUser)
async def login(user_cred: LoginUser, db: Session = Depends(get_db)):
    service = UserService(db)

    try:
        db_user = service.get_by_email(user_cred.email)
        if not db_user:
            raise ValueError("Invalid email !")

        is_authenticated = service.verify_pwd(user_cred.password, db_user.password)

        if not is_authenticated:
            raise ValueError("Invalid password !")

        payload = ResponseUser.model_validate(db_user)
        token = create_access_token(payload.model_dump())

        return JSONResponse(
            headers={"x-auth-token": token},
            content=payload.model_dump(mode="json"),
            status_code=status.HTTP_200_OK,
        )

    except ValueError as e:
        print(e)
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail={"msg": str(e), "type": "authentication error"},
        )

    except Exception as e:
        print(e)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "detail": str(e),
                "type": "JWT ERROR",
                "msg": "An internal server error occurred !",
            },
        )


@router.get("/me", response_model=ResponseUser, status_code=200)
async def profile(db_user: DBUser = Depends(get_curr_user)):
    """"""
    return db_user


@router.delete("/me/appointments/{app_id}", response_model=str)
async def unbook(
    app_id: UUID,
    session: Session = Depends(get_db),
    user: DBUser = Depends(get_curr_user),
):
    service = UserService(db=session)

    try:
        return service.cancel_booking(appointment_id=app_id, patient_id=user.id)

    except ValueError as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail={
                "msg": str(e),
                "type": "bad request",
                "detail": "invalid request sent by the user. no such appointment exists",
            },
        )
