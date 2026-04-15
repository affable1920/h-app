import logging
from uuid import UUID
from app.schemas.chat import MessageRequest

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse


from app.middleware.access import get_user
from app.services.ChatService import Assistant

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("")
async def stream_chat(
    request: MessageRequest, id: UUID = Depends(get_user)
):
    assistant = Assistant(user_id=str(id))

    return StreamingResponse(
        assistant.stream_tc(msg=request.message),
        media_type="text/event-stream",
        # headers={
        # "no-cache": "true"
        # }
    )


@router.post("/from_template")
async def chat(request: MessageRequest, id: UUID = Depends(get_user)):
    assistant = Assistant(str(id))
    model_response = await assistant.create(msg=request.message)

    return {
        "stream": False,
        **model_response
    }
