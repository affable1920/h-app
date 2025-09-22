# standard library
import os
from uuid import uuid4
from getpass import getpass
from fastapi import APIRouter
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage

# llm dependencies
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser

# custom bulit app deps
from app.models.llm import ChatRequest, ChatResponse


router = APIRouter(prefix="/chat", tags=["chat_ai", "llm"])

load_dotenv()
parser = JsonOutputParser()
api_key = os.getenv("GROQ_API_KEY")


def _setenv(var: str):
    if not os.getenv(var):
        key = getpass(f"{var}: ")
        os.environ[var] = key


_setenv("GROQ_API_KEY")
model = ChatGroq(model="llama-3.3-70b-versatile")


msg = HumanMessage(role="user", content="Hello, how are you?")
msgs = [msg]


@router.post("", response_model=ChatResponse)
async def chat(chat_rqst: ChatRequest):
    print(chat_rqst)
    if not model:
        return

    completion = model.invoke(input=msgs)
    return ChatResponse(id=completion.id or str(uuid4()), msg=completion.content)
