from enum import Enum

from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException

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

    if service.get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already exists!")

    try:
        service.save(**user.model_dump())

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error saving users !")

    token = create_access_token(user.model_dump(exclude={"email"}))
    return JSONResponse(content=None, status_code=201, headers={"x-auth-token": token})


@router.post("/login", response_model=ResponseUser)
async def login(user_cred: LoginUser, db: Session = Depends(get_db)):
    service = UserService(db)
    db_user = service.get_user(user_cred.email)

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email id!")

    if not service.verify_pwd(user_cred.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid password!")

    token_payload = {
        "sub": db_user.id,
        "email": db_user.email,
        "username": db_user.username,
        "role": db_user.role,
    }

    token = create_access_token(token_payload)
    return JSONResponse(
        status_code=200,
        headers={"x-auth-token": token},
        content=ResponseUser.model_validate(db_user).model_dump(),
    )


@router.get("/me", response_model=ResponseUser)
async def profile(user: dict = Depends(decode_and_get_current)):
    """"""
    print("profile route handler:", user)
