import json
import logging
import asyncio
from typing import AsyncGenerator

from fastapi import HTTPException
from groq import AsyncGroq, RateLimitError
from app.adapters.doctor_tool_adapter import DoctorToolAdapter
from app.database.entry import get_db
from app.core.config import settings
from app.features.chatbot.chat_constants import SYSTEM_PROMPT, tools

from groq.types.chat import (ChatCompletionSystemMessageParam,
                             ChatCompletionMessageToolCall)
#
system_msg: ChatCompletionSystemMessageParam = {
    "role": "system",
    "content": SYSTEM_PROMPT
}

groq = AsyncGroq(
    api_key=settings.groq_api_key,
    max_retries=0
)
logger = logging.getLogger(__name__)


class Assistant:
    """
    __client - same groq client across users
    __history - a conversation history tracker object, separate per user, keyed by id

    -- constants
    MODEL - the model name, same across the board

    MAX_HISTORY_TOKENS - context window length - in tokens
    [rough estimate] - 4 chars == 1 token
    """

    MODEL = "openai/gpt-oss-120b"
    MAX_HISTORY_TOKENS = 1500

    __client = groq
    history: dict[str, list[dict]] = {}

    def __init__(self, user_id: str):
        self.user_id = user_id

    #

    def get_user_history(self):
        trgt = self.history.get(self.user_id, [])

        response = [chat for chat in trgt if chat.get(
            "role") == "user" or chat.get("role") == "assistant" and not chat.get("tool_calls")]

        return response

    #
    def build_history(self):
        tokens_accumulated = 0
        trimmed = []

        def trim():
            trgt = self.history.get(self.user_id) or []

            for msg in reversed(trgt):
                cost = len(msg.get("content", "")) // 4

                if tokens_accumulated + cost > Assistant.MAX_HISTORY_TOKENS:
                    break

                nonlocal trimmed
                next = [msg, *trimmed]
                trimmed = next

        trim()
        return trimmed

    #

    @staticmethod
    def get_available_tools():
        adapter = DoctorToolAdapter()

        return {
            "find_doctors": adapter.find,
            "get_next_availability": adapter.get_next_av
        }

    #

    @staticmethod
    def execute_tool(tool_call: ChatCompletionMessageToolCall):
        fn_name = tool_call.function.name
        fn_to_call = Assistant.get_available_tools()[fn_name]

        fn_args = json.loads(tool_call.function.arguments)
        logger.info(f"Fn to execute: name -> {fn_name}\t\tArgs -> {fn_args}\n")

        try:
            response = fn_to_call(**fn_args)
            logger.debug(f"Function response -> {response}\n")

        except Exception as e:
            raise e

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
            self.history[self.user_id] = messages

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
                    messages=[system_msg] + messages,
                    stream=True,
                    tools=tools,
                    max_completion_tokens=968
                )

                async for chunk in stream:
                    # Go through each chunk
                    # the delta object is what we work with - can contain tool_calls or some text content
                    delta = chunk.choices[0].delta
                    finish_reason = chunk.choices[0].finish_reason

                    logger.info(f"delta object -> {delta}\n")

                    # Check the chunk if it's text or a tool call fragment
                    if delta.content:
                        # in case the delta object has content
                        # Concat the text to the response string and yield delta content to client immediately
                        response += delta.content
                        payload = {
                            "role": "assistant",
                            "content": delta.content
                        }

                        logger.info(f"delta content -> {delta.content}\n")
                        yield json.dumps({"type": "delta", "data": payload}) + "\n"

                    """
                    if the delta has tool call(s), we add those to our map
                    
                    One important distinction -
                    Unlike openAI, groq does not send each tool calls in fragments, rather it send one complete
                    tool call per fragment
                    """

                    if delta.tool_calls:
                        logger.info(
                            f"\ntotal tool calls inside delta -> {len(delta.tool_calls)}")
                        tool_calls_map.extend(delta.tool_calls)

            except RateLimitError as e:
                logger.error(e)

                yield json.dumps({
                    "type": "error",
                    "error": "Rate limit reached. Upgrade to pro or try after your limit is restored ."
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
                    tc_result = self.execute_tool(tc)

                    messages.append(tc_result)

            # If the finish reason is stop -> stream complete - signal it to the user
            if finish_reason == "stop":
                self.history[self.user_id] = messages
                logger.info(
                    "\nFinished streaming, signaling to the user .")

                yield json.dumps({"type": "done"}) + "\n"
                # and return
                return


#
async def simulate_stream():
    assistant = Assistant('1')
    async_gen = assistant.stream_tc(
        "find me an ENT")

    res = ""

    async for chunk in async_gen:
        try:
            parsed_chunk = json.loads(chunk)
            if parsed_chunk.get("type", "") == "delta":
                res += parsed_chunk["data"]["content"]

        except Exception as e:
            return e

    return res


if __name__ == "__main__":
    import asyncio
    res = asyncio.run(simulate_stream())
