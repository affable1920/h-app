from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.entry import get_db
from app.database.models import User
from app.services.users_service import UserService
from app.schemas.http import (
    CreateUser,
    LoginUser,
    ResponseUser,
)
from app.middleware.access import (
    create_access_token,
    get_user,
)

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=ResponseUser)
async def register(user: CreateUser, session: Session = Depends(get_db)):
    service = UserService(session)
    if service.get_by_email(user.email):
        raise HTTPException(
            400, detail={"msg": "Email already exists!", "type": "Invalid Email"})

    created_user = service.save(**user.model_dump())

    payload = ResponseUser.model_validate(created_user)
    token = create_access_token(payload.model_dump())

    response = JSONResponse(
        content=payload.model_dump(mode="json"),
        headers={"x-auth-token": token},
        status_code=status.HTTP_201_CREATED,
    )
    return response


@router.post("/login", response_model=ResponseUser)
async def login(user_cred: LoginUser, session: Session = Depends(get_db)):
    service = UserService(session)

    try:
        trgt = service.get_by_email(user_cred.email)

        if not trgt:
            raise ValueError("Invalid email !")
        is_authenticated = service.verify_pwd(
            user_cred.password, trgt.password)

        if not is_authenticated:
            raise ValueError("Invalid password !")

        payload = ResponseUser.model_validate(trgt)
        token = create_access_token(payload.model_dump())

        return JSONResponse(
            headers={"x-auth-token": token},
            status_code=status.HTTP_200_OK,
            content=payload.model_dump(mode="json"),
        )

    except ValueError as e:
        print(e)
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail={"msg": str(e), "type": "authentication error"},
        )


@router.get("/me", response_model=ResponseUser, status_code=200)
async def profile(usr: User = Depends(get_user)):
    return usr
