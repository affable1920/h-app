import json
import logging
import asyncio
from typing import Any, AsyncGenerator

from fastapi import HTTPException
from groq import AsyncGroq, GroqError
from app.database.entry import get_db
from app.services.dr_service import DoctorService
from app.core.config import GROQ_API_KEY
from app.constants.chat_constants import SYSTEM_PROMPT, tools

from groq.types.chat import ChatCompletionMessageToolCall
#
system_msg = {
    "role": "system",
    "content": SYSTEM_PROMPT
}

groq = AsyncGroq(api_key=GROQ_API_KEY, max_retries=0)

logger = logging.getLogger(__name__)


class Assistant:
    """
    class,instance attrs and their definition

    __client - same groq client across users
    __history - a conversation history tracker object, separate per user, keyed by id

    -- constants
    MODEL - the model name, same across the board

    MAX_HISTORY_TOKENS - context window length - in tokens
    [rough estimate] - 4 chars == 1 token
    """

    MODEL = "llama-3.3-70b-versatile"
    MAX_HISTORY_TOKENS = 1500

    __client = groq
    __history: dict[str, list[Any]] = {}

    def __init__(self, user_id: str):
        self.user_id = user_id

    #

    @staticmethod
    def trim_history(msgs: list[dict]):
        tokens_accumulated = 0
        trimmed = []

        for msg in reversed(msgs):
            cost = len(msg.get("content", "")) // 4

            if tokens_accumulated + cost > Assistant.MAX_HISTORY_TOKENS:
                break

            trimmed.insert(0, msg)
            tokens_accumulated += cost

        return trimmed

    #

    def build_history(self, trim: bool = True):
        trimmed = self.__history.setdefault(self.user_id, [])

        if trim:
            trimmed = self.trim_history(trimmed)

        return [
            system_msg,
            *trimmed
        ]

    #

    @staticmethod
    def get_available_tools():
        db = next(get_db())
        return {
            "get_doctors": DoctorService(db).filter_by_spec
        }

    #

    @staticmethod
    def execute_tool(tool_call: ChatCompletionMessageToolCall):
        fn_name = tool_call.function.name
        fn_to_call = Assistant.get_available_tools()[fn_name]
        fn_args = json.loads(tool_call.function.arguments)

        print(f"Fn to execute\nname: {fn_name}\nArgs: {fn_args}")
        response = fn_to_call(**fn_args)

        msg = {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": fn_name,
            "content": response.__str__(),
        }
        return msg

    #

    async def create(self, msg: str):
        prompt = {
            "role": "user",
            "content": msg
        }

        messages = [*self.build_history(), prompt]
        print(f"Build messages length {len(messages)}")

        try:
            response = await self.__client.chat.completions.create(
                model=self.MODEL,
                messages=messages,
                tools=tools
            )

            message = response.choices[0].message

            messages.append(
                {
                    "role": "assistant",
                    "content": message.content
                }
            )

            if message.tool_calls:
                for tool_call in message.tool_calls:
                    print(f"tool call\n{tool_call}")
                    fn_response = self.execute_tool(tool_call)

                    print(f"\nFunction response: {fn_response}")

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_call.function.name,
                        "content": str(fn_response)
                    })

                final = await self.__client.chat.completions.create(
                    model=self.MODEL, messages=messages
                )

                final_msg = final.choices[0].message
                payload = {
                    "role": "assistant",
                    "content": final_msg.content
                }

                messages.append(
                    {"role": "assistant", "content": final_msg.content})
                return payload

            return {
                "role": "assistant",
                "content": message.content
            }

        except Exception as e:
            print(e)
            raise HTTPException(
                500, {"msg": "AN unexpected error occurred ..",
                      "type": "Model Conversation Error", "detail": str(e)}
            )

    #

    async def stream(self, msg: str) -> AsyncGenerator:
        logger.info(
            "User prompt recieved. Starting the streaming process ...\n", f"Prompt: {msg}")

        prompt = {"role": "user", "content": msg}
        messages = [*self.build_history(), prompt]

        logger.info(f"\nBuild messages {len(messages)}")

        try:
            stream = await self.__client.chat.completions.create(
                model=self.MODEL,
                messages=messages,
                stream=True,
                max_tokens=1024,
            )

            response = ""

            async for chunk in stream:
                # The model will either stream text or call tools
                delta = chunk.choices[0].delta

                chunk_content = delta.content

                # Stream text back to client immediately
                if chunk_content:
                    response += chunk_content
                    payload = {
                        "type": "delta",
                        "content": chunk_content,
                        "stream": True
                    }

                    yield json.dumps(payload) + "\n"

            messages.append({"role": "assistant", "content": response})
            self.__history[self.user_id] = messages

        except ConnectionError as e:
            print(e)
            yield json.dumps({"type": "error", "content": str(e), "msg": "Connection error"})

        except Exception as e:
            payload = {
                "type": "error", "content": str(e)
            }

            print(e)
            yield json.dumps(payload) + "\n"
            return

    #

    async def stream_tc(self, msg: str):
        prompt = {
            "role": "user",
            "content": msg
        }

        messages = [*self.build_history(), prompt]

        while True:
            # reset tool_calls_map and the response - why ? -> explained below
            tool_calls_map = []
            response = ""
            finish_reason = None

            """
            make a request to the groq api and recieve a stream - a pipe which contains all our response in chunks.
            groq keeps it open sending chunks one by one. the pipe itself is not readable and needs to be iterated upon.
            groq signals stream completion by setting finish_reason to stop.
            """

            try:
                stream = await self.__client.chat.completions.create(
                    model=self.MODEL,
                    messages=messages,
                    stream=True,
                    tools=tools
                )

                async for chunk in stream:
                    # Go through each chunk
                    # the delta object is what we work with - can contain tool_calls or some text content
                    delta = chunk.choices[0].delta

                    finish_reason = chunk.choices[0].finish_reason

                    logger.info(f"\n\nDelta object {delta}\n")
                    logger.info(f"\nfinish reason -> {finish_reason}")

                    # Check the chunk if it's text or a tool call fragment
                    if delta.content:
                        # in case the delta object has content
                        # Concat the text to the response string and yield to client immediately
                        response += delta.content
                        logger.info(f"\nAccumulated response")

                        payload = {
                            "role": "assistant",
                            "content": delta.content
                        }

                        # and yield the chunk back to the user
                        yield json.dumps({"type": "delta", "data": payload}) + "\n"

                    # if the chunk is a tool call fragment, extend our map with these
                    if delta.tool_calls:
                        logger.info(
                            f"\ntotal tool calls inside delta -> {len(delta.tool_calls)}")
                        tool_calls_map.extend(delta.tool_calls)

            except GroqError as e:
                logger.error(f"A groq rror occurred while streaming -> {e}")
                yield json.dumps({
                    "type": "error",
                    "error": e.__str__()
                })

                return

            except Exception as e:
                # Http headers are sent to the client with the first chunk so we cannot raise an error
                # instead we have to yield it via the same stream
                payload = {
                    "type": "error", "error": e.__str__()
                }
                logger.error(f"An Error occurred while streaming -> {e}")
                yield json.dumps(payload) + "\n"

                return

            # when the stream iteration is complete, not necessarily finished on groq's side
            # we append the accumulated response and tool_calls to groq's message history
            messages.append({
                "role": "assistant",
                "content": response,
                "tool_calls": tool_calls_map
            })

            # Here, either the stream is complete or groq is requesting a tool_call
            if finish_reason == "tool_calls":
                """
                given groq is requesting tool call(s), execute the tools, and append result to the history
                these will go back to groq in the next request's messages argument.
                - where we reset response and tool_calls_map first because we already executed and recieved results
                of one tool call we don't wanna execute the same tool_call again and accumulate redundant data

                groq, now, in case decides no further tool calling is required, makes its own response
                using our function's results and yields them back to the client

                That's why we reset the two variables
                """
                for tc in tool_calls_map:
                    resultant_msg = self.execute_tool(tc)
                    logger.info(
                        f"\nMsg recieved after tool execution -> {resultant_msg}")
                    messages.append(resultant_msg)

            # If the finish reason is stop -> stream complete - signal it to the user
            if finish_reason == "stop":
                logger.info(
                    "\nFinished streaming, signaling to the user .")
                yield f"data: {json.dumps({"type": "done"})}\n"

                # and return
                return


#
#
async def simulate_stream():
    assistant = Assistant('1')
    async_gen = assistant.stream_tc("find me a cardiologist")
    res = ""

    async for ch in async_gen:
        res += ch
        logger.info(
            f"\nchunk recieved from the async genertor -> {type(ch)} {ch}")

    return res


if __name__ == "__main__":
    import asyncio
    res = asyncio.run(simulate_stream())
