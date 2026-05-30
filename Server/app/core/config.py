import logging
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

ENV = os.getenv("ENV", "DEV")
JWT_SECRET = os.getenv("JWT_SECRET", "")
DATABASE_URL = os.getenv("DATABASE_URL")
ALG = os.getenv("ALG", "HS256")
USE_HTTPS = int(os.getenv("USE_HTTPS", "0"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


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


class Settings(BaseSettings):
    ENV: str = "DEV"
    JWT_SECRET: str = ""
    DATABASE_URL: str
    ALG: str
    USE_HTTPS: int = 0
    GROQ_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")
