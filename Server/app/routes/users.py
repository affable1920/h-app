from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, status

from app.database.entry import get_db
from app.schemas.user import ResponseUser
from app.services.users_service import UserService
from app.helpers.authentication import decode_and_get_current


router = APIRouter(prefix="/users", tags=["users"])


@router.get("{id}/appointments")
async def get_user(
    payload: dict = Depends(decode_and_get_current), db: Session = Depends(get_db)
):
    service = UserService(db=db)

    user_id = payload.get("id")
    if not user_id:
        raise ValueError("invalid token")

    curr_user = service.get_by_id(user_id)

    if not curr_user:
        raise ValueError("invalid token")

    apps = ResponseUser.model_validate(curr_user).appointments

    return JSONResponse(
        apps,
        status.HTTP_200_OK,
    )
