import logging
from typing import Literal
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG,
        force=True,
        format="%(name)s - %(levelname)s - %(message)s"
    )

    loggers_to_suppress = ["faker", "passlib",
                           "httpx", "httpcore", "groq"
                           ]

    for l in loggers_to_suppress:
        logging.getLogger(l).handlers = []
        logging.getLogger(l).propagate = False


setup_logging()


class Settings(BaseSettings):
    # env-specific
    env: Literal["dev", "prod"] = "dev"
    use_https: Literal["0", "1"] = "0"
    is_using_container: Literal["0", "1"] = "0"

    # database
    database_url: str
    database_url_async: str

    # jwt
    jwt_secret: str

    # Third-party api's
    groq_api_key: str
    gmail_password: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    @model_validator(mode="after")
    def adjust_db_host(self) -> "Settings":
        if self.is_using_container == "1":
            self.database_url = self.database_url.replace("localhost", "db")
            self.database_url_async = self.database_url_async.replace(
                "localhost", "db"
            )

        return self


settings = Settings()  # type: ignore
