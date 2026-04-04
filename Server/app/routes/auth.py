from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Response

from app.shared.enums import UserRole
from app.database.entry import get_db
from app.services.users_service import UserService
from app.schemas.http import (
    CreateUser,
    LoginUser,
    ResponseDr,
    ResponsePtnt,
    ResponseUser,
)
from app.middleware.access import (
    create_access_token,
    get_user,
)

router = APIRouter(prefix="/auth")


@router.post("/register")
async def register(user: CreateUser, response: Response, session: Session = Depends(get_db)):
    with session.begin():
        service = UserService(session)

        if service.get_by_email(user.email):
            raise HTTPException(
                400, detail={"msg": "Email already exists!", "type": "Invalid Email"})

        created_user = service.save(**user.model_dump())
        token = create_access_token(id=created_user.id, role=created_user.role)

        response.status_code = 201
        response.headers["x-auth-token"] = token


@router.post("/login")
async def login(user_cred: LoginUser, response: Response, session: Session = Depends(get_db)):
    service = UserService(session)

    try:
        trgt = service.get_by_email(user_cred.email)

        if not trgt:
            raise ValueError("Invalid email !")
        is_authenticated = service.verify_pwd(
            user_cred.password, trgt.password)

        if not is_authenticated:
            raise ValueError("Invalid password !")

        token = create_access_token(id=trgt.id, role=trgt.role)
        response.headers["x-auth-token"] = token

    except ValueError as e:
        raise HTTPException(
            401,
            detail={"msg": str(e), "type": "authentication error"},
        )


@router.get("/me", status_code=200)
async def profile(id: UUID = Depends(get_user), session: Session = Depends(get_db)):
    srvc = UserService(session)
    usr = srvc.get_with_type(id=id)

    if usr is None:
        raise (HTTPException
               (404,
                detail={
                    "msg": "NO valid record found for your given query.",
                    "type": "NoResultFound"
                }))

    model_map = {
        UserRole.PATIENT: ResponsePtnt,
        UserRole.DOCTOR: ResponseDr
    }

    Model = model_map.get(usr.role)

    if Model is None:
        return ResponseUser.model_validate(usr)

    return Model.model_validate(usr)
