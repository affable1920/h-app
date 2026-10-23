import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.features.calling import websocket
from app.routes import patients
from app.core.exceptions import AppException, InvalidTokenError
from app.routes import schedules
from app.scripts.openapi_spec import generate_openapi_spec
from app.features.chatbot import chat
from app.core.config import settings
from app.routes import auth, doctors, bookings, clinics
from app.core.exception_handlers import (
    application_error_handler,
    invalid_token_handler,
    unhandled_error_handler,
    validation_error_handler
)


logger = logging.getLogger(__name__)


@asynccontextmanager
async def root(app: FastAPI):
    logger.info("Starting up ...\n")

    app.openapi_schema = generate_openapi_spec(app=app)

    yield

    logger.info("Shutting down ...\n")


app = FastAPI(
    lifespan=root,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    allow_origins=[*settings.allowed_origins.split(",")],
    expose_headers=["x-session-expire", "x-auth-token"],
)


app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(bookings.router)
app.include_router(clinics.router)
app.include_router(chat.router)
app.include_router(schedules.router)
app.include_router(patients.router)
app.add_websocket_route("/ws", websocket.websocket_route)


def _application_error_handler(request, exc):
    return application_error_handler(request, exc)


def _invalid_token_error_handler(request, exc):
    return invalid_token_handler(request, exc)


def _validation_error_handler(request, exc):
    return validation_error_handler(request, exc)


app.add_exception_handler(
    AppException,
    _application_error_handler
)

app.add_exception_handler(
    Exception,
    unhandled_error_handler
)

app.add_exception_handler(
    InvalidTokenError,
    _invalid_token_error_handler
)

app.add_exception_handler(
    RequestValidationError,
    _validation_error_handler
)


@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }


if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings

    inside_container = settings.is_using_container == "1"

    base_directory = (
        Path.cwd()
        if inside_container
        else Path(__file__).parent
    )

    mode_https = settings.use_https == "1"

    mode = settings.env

    logging.info(
        f"running server in ({'https' if mode_https else 'http'}) mode".capitalize(
        )
    )

    logging.info(
        f"starting the server with ${base_directory.name} as the root directory".capitalize(
        )
    )

    def get_ssl_key():
        target_fl = (
            "../certs/key.pem"
            if inside_container
            else "../localhost+3-key.pem"
        )

        return (
            Path.resolve(base_directory / target_fl)
            if mode_https
            else None
        )

    def get_ssl_cert():
        target_fl = (
            "../certs/cert.pem"
            if inside_container
            else "../localhost+3.pem"
        )

        return (
            Path.resolve(base_directory / target_fl)
            if mode_https
            else None
        )

    uvicorn.run(
        app="app.main:app",
        port=8000,
        host="0.0.0.0",
        reload=True,
        ssl_keyfile=get_ssl_key(),
        ssl_certfile=get_ssl_cert(),
    )
