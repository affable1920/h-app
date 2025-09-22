from pydantic import BaseModel


class ChatRequest(BaseModel):
    msg: str


class ChatResponse(BaseModel):
    id: str
    msg: str | list[str | dict]
    model_name: str | None = None
