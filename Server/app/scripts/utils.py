import asyncio
import functools
import random
from logging import getLogger

logger = getLogger(__name__)


# Retry function decorator
# 1. Outer configuration layer - stores configuration variables
def retry(
        max_retries: int = 3, delay_seconds_factor: int = 2,
        exceptions=(Exception,)
):
    # 2. Target function layer
    def decorator(func):
        logger.info(f"Calling function {func.__name__} with retry logic...")
        # functool.wraps preserves original function name and docstring

        @functools.wraps(func)
        # 3. Execution wrapper that essentially replaces the actual function
        async def wrapper(*args, **kwargs):
            attempts = 1
            logger.info(f"\nInit: Attempt {attempts}")

            while attempts <= max_retries:
                try:
                    # CRUCIAL - The target async function must be awaited
                    return await func(*args, **kwargs)

                except exceptions as error:
                    logger.debug(
                        f"\nAttempt {attempts} failed. logging the exception below:\n")
                    logger.error(error)

                    if attempts >= max_retries:
                        logger.info(
                            "\nMax retries reached. Not moving forward with another call on the function."
                            "Raising the error"
                        )
                        raise error

                    attempts += 1
                    # Adding a random delay to the factored base delay for randomness in api call delay
                    delay = (attempts * delay_seconds_factor +
                             random.randint(1, 2)
                             )
                    logger.info(
                        f"Waiting {delay} seconds before the next attempt: ({attempts})"
                    )
                    await asyncio.sleep(delay)

        return wrapper
    return decorator
