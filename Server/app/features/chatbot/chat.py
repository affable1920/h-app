import logging
from uuid import UUID
from Server.app.features.chatbot.schema import MessageRequest

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse


from app.middleware.auth_middleware import get_user
from app.features.chatbot.ChatService import Assistant

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.get("")
async def get_initial(id: UUID = Depends(get_user)):
    assistant = Assistant(user_id=str(id))
    return assistant.get_user_history()


@router.post("")
async def stream_chat(
    request: MessageRequest, id: UUID = Depends(get_user)
):
    assistant = Assistant(user_id=str(id))

    return StreamingResponse(
        assistant.stream_tc(msg=request.content),
        media_type="text/event-stream",
        # headers={
        # "no-cache": "true"
        # }
    )


@router.post("/from_template")
async def chat(request: MessageRequest, id: UUID = Depends(get_user)):
    assistant = Assistant(str(id))
    model_response = await assistant.create(msg=request.content)

    return {
        "stream": False,
        **model_response
    }
