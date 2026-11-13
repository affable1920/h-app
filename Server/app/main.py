import logging
from uuid import uuid4

from starlette.exceptions import HTTPException
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.features.calling import websocket
from app.routes import patients
from app.core.exceptions import AppException
from app.routes import schedules
from app.scripts.openapi_spec import generate_openapi_spec
from app.features.chatbot import chat
from app.core.config import settings
from app.routes import auth, doctors, bookings, clinics

from app.core.exception_handlers import (
    application_error_handler,
    http_exception_handler,
    unhandled_error_handler,
    validation_error_handler
)


logger = logging.getLogger(__name__)

# ======================== App Configuration ========================== #


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
    expose_headers=[
        "x-auth-token",
        "x-session-expire",
        "x-request-id",
        "x-session-issued"
    ],
)


def register_routes(app):
    app.include_router(auth.router)
    app.include_router(doctors.router)
    app.include_router(bookings.router)
    app.include_router(clinics.router)
    app.include_router(chat.router)
    app.include_router(schedules.router)
    app.include_router(patients.router)

    app.add_websocket_route("/ws", websocket.websocket_route)


def register_exception_handlers(app):
    app.add_exception_handler(
        AppException,
        application_error_handler
    )
    app.add_exception_handler(
        HTTPException,
        http_exception_handler
    )
    app.add_exception_handler(
        RequestValidationError,
        validation_error_handler
    )
    app.add_exception_handler(
        Exception,
        unhandled_error_handler
    )


register_routes(app=app)
register_exception_handlers(app=app)


@app.middleware("http")
async def request_id_middleware(
    request: Request, call_next
):
    request.state.request_id = (
        request.headers.get("x-request-id")
        or uuid4().hex
    )

    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }


if __name__ == "__main__":
    import uvicorn

    mode = settings.env
    mode_https = settings.use_https == "1"

    inside_container = settings.is_using_container == "1"

    root_directory = (
        Path.cwd() if inside_container else Path(__file__).parent
    )

    logging.info(
        f"""Running server in ({mode} environment) 
        with scheme {("https" if mode_https else "http")} 
        with {root_directory} as the root directory. 
        {"inside-container" if inside_container else "outside-container"}"""
    )

    def get_ssl_key():
        ssl_key_file = (
            "../certs/key.pem" if inside_container else "../localhost+3-key.pem"
        )

        return (
            Path.resolve(root_directory / ssl_key_file)
            if mode_https else None
        )

    def get_ssl_cert():
        ssl_certificate_file = (
            "../certs/cert.pem" if inside_container else "../localhost+3.pem"
        )

        return (
            Path.resolve(root_directory / ssl_certificate_file)
            if mode_https else None
        )

    uvicorn.run(
        app="app.main:app", port=8000, host="0.0.0.0", reload=True,
        ssl_keyfile=get_ssl_key(), ssl_certfile=get_ssl_cert(),
    )
