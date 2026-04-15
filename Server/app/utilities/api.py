import asyncio
import random
from typing import Callable, AsyncGenerator
from app.services.ChatService import Assistant


async def with_retry(async_fn: Callable) -> AsyncGenerator:
    MAX_ATTEMPTS = 3
    ATTEMPT = 1
    DELAY = 1

    while ATTEMPT <= MAX_ATTEMPTS:
        print(f"Attempt {ATTEMPT}")

        try:
            print("executing the given function.")
            async for chunk in async_fn():
                yield chunk

        except ConnectionError as e:
            print(f"Connection error: {e.__str__()}")
            raise e

        except Exception as e:
            print(f"Exception occurred: {e.__str__()}")
            if ATTEMPT >= MAX_ATTEMPTS:
                print(f"All attempts exhausted ... Raising the exception")
                raise e

            MS = ((DELAY * ATTEMPT) +
                  (ATTEMPT * random.randint(ATTEMPT, MAX_ATTEMPTS)))

            print(f"Retrying after {MS}s delay")
            await asyncio.sleep(MS)  # Convert ms to seconds
            ATTEMPT += 1


async def stream_with_retry():
    assistant = Assistant("001")
    async_gen = with_retry(
        lambda: assistant.stream_tc("Find me a cardiologist"))

    async for chunk in async_gen:
        print(chunk)


if __name__ == "__main__":
    asyncio.run(stream_with_retry())
