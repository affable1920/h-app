from typing import Any, Generator, Self, List, Dict

from fastapi import HTTPException
from groq import Groq, GroqError
from groq.types.chat import ChatCompletionMessageParam
from app.core.config import GROQ_API_KEY

#
SYSTEM_CONTEXT: ChatCompletionMessageParam = {
    "role": "system",
            "content": "You are an assistant for a healthcare provider app."
}
#


class Assistant:
    __instance = None
    __client = Groq(api_key=GROQ_API_KEY, max_retries=2)

    __history: Dict[str, List[dict[str, Any]]] = {}

    #

    def __new__(cls) -> Self:
        if not cls.__instance:
            cls.__instance = super().__new__(cls)

        return cls.__instance

    #

    def create(self, usr_id: str, msg: str):
        client = self.__client

        history = self.__history.setdefault(usr_id, [])
        history.append({"role": "user", "content": msg})

        messages = [SYSTEM_CONTEXT, *history]

        try:
            stream = client.chat.completions.create(
                messages=messages,
                model="openai/gpt-oss-120b",
                stream=True
            )

        except GroqError as e:
            raise HTTPException(
                500, detail={"msg": "Sorry can't answer.", "detail": str(e)})

        response = ""

        for chunk in stream:
            delta = chunk.choices[0].delta.content

            if delta:
                response += delta
                yield delta

        history.append({
            "role": "assistant",
            "content": response
        })

    #

    def stream(self, usr_id: str, msg: str) -> Generator[str, None, None]:
        client = self.__client

        history = self.__history.setdefault(usr_id, [])
        history.append({"role": "user", "content": msg})

        messages = [SYSTEM_CONTEXT, *history[:-20]]

        stream = (client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            stream=True,
        ))

        response = ""

        for chunk in stream:
            delta = chunk.choices[0].delta.content

            if delta:
                response += delta
                yield delta

        history.append({"role": "assistant", "content": response})
