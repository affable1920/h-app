import json
import logging
from httpx import TimeoutException
from fastapi import HTTPException
from groq import AsyncGroq, RateLimitError, APIConnectionError
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.chatbot.schema import Role
from app.scripts.utils import retry
from app.adapters.doctor_tool_adapter import DoctorToolAdapter
from app.core.config import settings
from app.features.chatbot.chat_constants import system_prompt, tools
from groq.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionMessageToolCall
)
#
system_msg: ChatCompletionSystemMessageParam = {
    "role": "system",
    "content": system_prompt
}

logger = logging.getLogger(__name__)


class Assistant:
    """
    __client - same groq client across users
    __history - a conversation history store shared across all instances, keyed by user_id 
    __history - Moves to redis in PROD

    constants
    MODEL - the model name, same across the board
    MAX_HISTORY_TOKENS - context window length - ensures fair usage
    """

    MODEL = "llama-3.3-70b-versatile"
    # 1/4 of the total context window length of the model - 3000 TPM for llama-3.3-70b
    MAX_HISTORY_TOKENS = 7500
    __client = AsyncGroq(
        api_key=settings.groq_api_key,
        max_retries=0
    )
    history: dict[str, list] = {}

    def __init__(self, user_id: str, session: AsyncSession):
        """
        user_id - Different groq http client for different users
        session - sql_alchemy session object
        instance level state so it lives only till the request and we don't get stale sessions
        """
        self.user_id = user_id
        self._session = session

    #

    @classmethod
    def get_history_client(cls, user_id: str):
        # creates user history suitable for the client (no tool calls included)
        usr_history = cls.history.get(user_id, [])
        response = [
            chat for chat in usr_history
            if not chat.get("role") == Role.TOOL and not chat.get("tool_calls")
        ]

        logger.info(f"User history \n{response}")
        return response

    #

    def build_context(self):
        # builds history for groq

        tokens_accumulated = 0

        # trimmed list of msgs to return
        trimmed = []
        history = self.history.get(self.user_id, [])

        for chat_msg in reversed(history):
            """
            starting from the most recently sent/recieved message
            cost is the number of tokens (assuming 4 characters == 1 token) 
            """
            cost = len(chat_msg.get("content", "") or "") // 4
            if tokens_accumulated + cost > Assistant.MAX_HISTORY_TOKENS:
                break

            tokens_accumulated += cost
            next = [chat_msg, *trimmed]
            trimmed = next

        return trimmed

    #

    def get_tools(self) -> dict[str, dict]:
        adapter = DoctorToolAdapter(session=self._session)

        registry = {
            "find_drs_many": {
                "function": adapter.find_drs_many
            },
            "get_drprofile_single": {
                "function": adapter.get_drprofile_single
            }
        }

        return registry

    #

    @retry(max_retries=3, delay_seconds_factor=1)
    async def execute_tool(self, tool_call: ChatCompletionMessageToolCall):
        fn_name = tool_call.function.name
        fn_to_call = self.get_tools()[fn_name]

        if fn_to_call is None:
            raise ValueError(
                "The tool to execute could not be found."
            )

        fn_args = json.loads(tool_call.function.arguments)
        logger.info(
            f"\nThe arguments the tool call function wants: \n{fn_args}")

        response = await fn_to_call["function"](**fn_args)
        logger.info(
            f"\nTool call response: \nresponse -> {response}"
        )

        msg = {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": fn_name,
            "content": response.__str__(),
        }

        return msg

    #

    async def converse(self, msg: str):
        prompt = {
            "role": "user",
            "content": msg
        }

        messages = [*self.build_context(), prompt]
        logger.debug(f"Built messages length {len(messages)}")

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
                    logger.debug(f"tool call\n{tool_call}")
                    fn_response = self.execute_tool(tool_call)

                    logger.debug(f"\nFunction response: {fn_response}")

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
            logger.debug(e)
            raise HTTPException(
                500, {"msg": "AN unexpected error occurred ..",
                      "type": "Model Conversation Error", "detail": str(e)}
            )

    #

    async def stream_tc(self, msg: str):
        logger.info(
            "User prompt recieved.\n", f"Prompt: {msg}"
        )

        prompt = {
            "role": "user",
            "content": msg
        }

        logger.info(f"History built: \n{self.build_context()} ")

        messages = [*self.build_context(), prompt]
        logger.info(
            f"\nUser history built. Conversation length sent to the model -> {len(messages)}"
        )

        while True:
            # A while loop for a many rounded tool_call response

            tool_calls_map = []
            finish_reason, acuumulated_response = None,  ""

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
                    max_completion_tokens=968,
                )

                async for chunk in stream:
                    """
                    Go through each chunk. The delta object is what we work with - Get to know what the model wants
                    It can contain tool_calls, text content and the model's reasoning behind the response.
                    """
                    delta = chunk.choices[0].delta
                    finish_reason = chunk.choices[0].finish_reason

                    if delta.content:
                        acuumulated_response += delta.content

                        res = {
                            "type": "delta",
                            "payload": {
                                "role": Role.ASSISTANT.value,
                                "content": delta.content
                            }
                        }
                        yield json.dumps(res) + "\n"

                    # if the delta has tool call(s), we add those to our map
                    if delta.tool_calls:
                        tool_calls_map.extend(delta.tool_calls)

            except (APIConnectionError, TimeoutException) as e:
                logger.debug(e)
                yield json.dumps({
                    "type": "error",
                    "msg": "You don't seem to be connected to the internet. Kindly try after sometime."
                }) + "\n"
                break

            except RateLimitError as e:
                logger.debug(e)
                yield json.dumps({
                    "type": "error",
                    "msg": "Rate limit reached. Upgrade to pro to continue."
                }) + "\n"
                break

            except Exception as e:
                # Http headers are sent to the client with the first chunk so we cannot raise an error
                # instead we have to yield it via the same stream
                logger.debug(
                    f"An unexpected error occurred while streaming, logged below:"
                )
                logger.error(e)
                yield json.dumps({
                    "type": "error",
                    "msg": "An unexpected error occurred"
                }) + "\n"
                break

            # when the stream iteration is complete, not necessarily finished on groq's side
            # we append the accumulated response and tool_calls to groq's message history
            messages.append({
                "role": Role.ASSISTANT.value,
                "content": acuumulated_response,
                "tool_calls": tool_calls_map
            })

            # Here, either the stream is complete or groq is requesting a tool_call

            if finish_reason == "tool_calls":
                """
                given groq is requesting tool call(s), execute the tools, and append result to the history
                these will go back to groq in the next request's messages argument.
                """
                for tc in tool_calls_map:
                    logger.info(f"The tool call requested by Groq: {tc}")
                    try:
                        tc_result = await self.execute_tool(tc)
                        messages.append(tc_result)

                    except Exception as e:
                        logger.debug(e)
                        yield json.dumps({
                            "type": "error",
                            "msg": ""
                        })

            if finish_reason == "stop":
                self.history[self.user_id] = messages

                logger.info("\nStreaming finished successfully ...")
                yield json.dumps({"type": "done"}) + "\n"

                # return inside a generator function raises StopIteration, which we want at this point
                return
