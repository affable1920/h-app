import logging
import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "dev")
JWT_SECRET = os.getenv("JWT_SECRET", "")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:Ss%402332253@localhost:5432/soporefix"
)
ALG = os.getenv("ALG", "HS256")
USE_HTTPS = os.getenv("USE_HTTPS", 0)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")


#

def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG,
        force=True,
        format="%(name)s - %(levelname)s - %(message)s"
    )

    loggers_to_suppress = ["faker", "passlib",
                           "httpx", "httpcore", "groq"]

    for l in loggers_to_suppress:
        logging.getLogger(l).handlers = []
        logging.getLogger(l).propagate = False


setup_logging()
