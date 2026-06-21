import logging
from app.database.entry_async import get_db
from app.features.chatbot.schema import BaseChatMessage
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse


from app.middleware.auth_middleware import decode_access_token, get_curr_user
from app.features.chatbot.ChatService import Assistant

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.get("")
async def get_initial(
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token),
):
    user = await get_curr_user(
        session=session, payload=payload
    )

    if user is None:
        raise HTTPException(
            401,
            detail={
                "type": "Authentication Error",
                "msg": "User is not authenticated"
            }
        )

    return Assistant.get_history_client(str(user.id))


@router.post("")
async def stream_chat(
    request: BaseChatMessage,
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    user = await get_curr_user(
        payload=payload, session=session
    )

    if user is None:
        raise HTTPException(
            401
        )

    uid = str(user.id)
    assistant = Assistant(user_id=uid, session=session)

    return StreamingResponse(
        content=assistant.stream_tc(msg=request.content),
        media_type="text/event-stream",
    )


@router.post("/from_template")
async def chat(
    request: BaseChatMessage,
    session: AsyncSession = Depends(get_db),
    payload: dict = Depends(decode_access_token)
):
    user = await get_curr_user(
        session=session, payload=payload
    )

    if user is None:
        raise HTTPException(
            401
        )

    assistant = Assistant(user_id=user.id.__str__(), session=session)
    model_response = await assistant.converse(msg=request.content)

    return {
        "stream": False,
        **model_response
    }
