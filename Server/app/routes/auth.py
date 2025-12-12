from enum import Enum

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.entry import get_db
from app.database.models import User
from app.helpers.authentication import create_access_token, decode_and_get_current
from app.schemas.user import CreateUser, DBUser, LoginUser
from app.services.users_service import UserService

base = "/auth"
tags: list[str | Enum] = ["auth"]
router = APIRouter(prefix="/auth", tags=tags)


@router.post("/register")
async def register(user: CreateUser, db: Session = Depends(get_db), service: UserService = Depends()):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists!")

    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()

    created_user = service.save(user.model_dump())
    token = create_access_token(created_user)

    return JSONResponse(content=None, status_code=201, headers={"x-auth-token": token})


@router.post("/login", response_model=DBUser)
async def login(user_cred: LoginUser, service: UserService = Depends()):
    db_user = service.verify_user(**user_cred.model_dump())

    token = create_access_token(db_user)
    return JSONResponse(content=db_user, status_code=200, headers={"x-auth-token": token})


@router.get("/me", response_model=DBUser)
async def profile(user: dict = Depends(decode_and_get_current)):
    """"""
    print("profile route handler:",  user)
