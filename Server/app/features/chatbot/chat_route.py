import logging
from uuid import UUID
from app.database.models import Patient
from app.features.chatbot.schema import MessageRequest

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse


from app.middleware.auth_middleware import get_curr_user
from app.features.chatbot.ChatService import Assistant

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.get("")
async def get_initial(user: Patient = Depends(get_curr_user)):
    assistant = Assistant(user_id=user.id.__str__())
    return assistant.get_user_history()


@router.post("")
async def stream_chat(
    request: MessageRequest, user: Patient = Depends(get_curr_user)
):
    assistant = Assistant(user_id=user.id.__str__())

    return StreamingResponse(
        assistant.stream_tc(msg=request.content),
        media_type="text/event-stream",
        # headers={
        # "no-cache": "true"
        # }
    )


@router.post("/from_template")
async def chat(request: MessageRequest, user: Patient = Depends(get_curr_user)):
    assistant = Assistant(user_id=user.id.__str__())
    model_response = await assistant.create(msg=request.content)

    return {
        "stream": False,
        **model_response
    }
