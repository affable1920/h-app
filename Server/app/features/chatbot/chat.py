import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.database.entry_async import get_db
from app.features.auth.dependencies import get_current_user
from app.features.chatbot.schema import BaseChatMessage
from app.features.chatbot.ChatService import Assistant

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.get("")
async def get_initial(
    current_user=Depends(get_current_user),
):
    return Assistant.get_history_client(str(current_user.id))


@router.post("")
async def stream_chat(
    request: BaseChatMessage,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

):
    uid = str(current_user.id)
    assistant = Assistant(user_id=uid, session=session)

    return StreamingResponse(
        content=assistant.stream_tc(msg=request.content),
        media_type="text/event-stream",
    )


@router.post("/from_template")
async def chat(
    request: BaseChatMessage,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

):
    assistant = Assistant(
        session=session,
        user_id=str(current_user.id)
    )

    model_response = await assistant.converse(
        msg=request.content
    )

    return {
        "stream": False,
        **model_response
    }
