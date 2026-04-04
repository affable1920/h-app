from app.schemas.chat import MessageRequest, MessageResponse
import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from groq import Groq

from sqlalchemy.orm import Session

from app.database.entry import get_db
from app.services.users_service import UserService
from app.middleware.access import get_user
from app.services.ChatService import Assistant
from app.core.config import GROQ_API_KEY

# Initialize the Groq client
client = Groq(api_key=GROQ_API_KEY)
MODEL = 'openai/gpt-oss-120b'

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("", response_model=MessageResponse)
async def stream_chat(
    request: MessageRequest, session: Session = Depends(get_db),
    client: Assistant = Depends(Assistant), id: UUID = Depends(get_user)
):
    srvc = UserService(db=session)
    usr = srvc.get_by_id(id=id)

    if not usr:
        return

    logger.info("Received message: %s", request)

    def generate():
        txt_stream = client.stream(usr_id=str(id), msg=request.message) or ""

        for chunk in txt_stream:
            yield chunk

    return StreamingResponse(generate())
