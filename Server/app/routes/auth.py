from enum import Enum
import json

from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.entry import get_db
from app.services.users_service import UserService
from app.schemas.user import CreateUser, LoginUser, ResponseUser
from app.helpers.authentication import create_access_token, decode_and_get_current

base = "/auth"
tags: list[str | Enum] = ["auth"]
router = APIRouter(prefix="/auth", tags=tags)


@router.post("/register")
async def register(user: CreateUser, db: Session = Depends(get_db)):
    service = UserService(db)

    if service.get_by_email(user.email):
        print("Email already exists !")
        raise HTTPException(status_code=400, detail="Email already exists!")

    try:
        created_user = service.save(**user.model_dump())

        token_payload = {
            "id": str(created_user.id),
            "email": user.email,
            "username": user.username,
        }

        token = create_access_token(token_payload)
        return JSONResponse(
            status_code=201,
            headers={"x-auth-token": token},
            content=ResponseUser.model_validate(created_user).model_dump(),
        )

    except Exception as e:
        print(e)
        raise HTTPException(
            500,
            detail={
                "msg": "An internal server error occurred !",
                "desc": "DATABASE ERROR",
                "detail": json.dumps(e),
            },
        )


@router.post("/login", response_model=ResponseUser)
async def login(user_cred: LoginUser, db: Session = Depends(get_db)):
    service = UserService(db)
    db_user = service.get_by_email(user_cred.email)

    if not db_user:
        raise ValueError("Invalid email !")

    is_authenticated = service.verify_pwd(user_cred.password, db_user.password)

    if not is_authenticated:
        raise ValueError("Invalid password !")

    token_payload = {
        "id": str(db_user.id),
        "email": db_user.email,
        "username": db_user.username,
    }

    try:
        token = create_access_token(token_payload)
        return JSONResponse(
            status_code=200,
            headers={"x-auth-token": token},
            content=ResponseUser.model_validate(db_user).model_dump(),
        )

    except ValueError as e:
        raise HTTPException(401, detail=str(e))

    except Exception as e:
        print(e)
        raise HTTPException(
            500,
            detail={
                "desc": "JWT ERROR",
                "detail": json.dumps(e),
                "msg": "An internal server error occurred !",
            },
        )


@router.get("/me", response_model=ResponseUser)
async def profile(
    payload: dict = Depends(decode_and_get_current), db: Session = Depends(get_db)
):
    """"""
    service = UserService(db)
    user_id = payload.get("id")

    if not user_id:
        raise ValueError("invalid token")

    curr_user = service.get_by_id(user_id)

    if not curr_user:
        raise ValueError("invalid token")

    try:
        return JSONResponse(
            ResponseUser.model_validate(curr_user).model_dump(), status.HTTP_200_OK
        )

    except ValueError as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            {
                "msg": e,
                "type": "token decode error",
                "desc": "token missing required constraints",
            },
        )

    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            {
                "msg": e,
                "type": "An internal server error occurred",
                "desc": "unexpected error",
            },
        )
