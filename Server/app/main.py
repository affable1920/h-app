import logging

from fastapi import (
    FastAPI,
)

from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from app.scripts.openapi_spec import generate_openapi_spec
from app.features.chatbot import chat
from app.core.config import settings
from app.routes import auth, doctors, bookings, clinics
from app.features.calling import ws_route


#
logger = logging.getLogger(__name__)


@asynccontextmanager
async def root(app: FastAPI):
    logger.info("Starting up")

    app.openapi_schema = generate_openapi_spec(app=app)

    yield
    logger.info("Shutting down")


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
    allow_origins=settings.allowed_origins.split(","),
    expose_headers=["x-session-expire", "x-auth-token"],
)


# Routes
app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(bookings.router)
app.include_router(clinics.router)
app.include_router(chat.router)
app.add_websocket_route("/ws", ws_route.ws_endpoint)


@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }


if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings

    inside_container = settings.is_using_container == "1"

    # when not running the server inside a container, locally for instance,
    # we always set the server as the current directory so Path.cwd()
    # always resolves sucessfully to the server, our target.

    base_dir = Path.cwd() if inside_container else Path(__file__).parent
    mode_https = settings.use_https == "1"

    mode = settings.env

    logging.info(
        f"running server in ({'https' if mode_https else 'http'}) mode".capitalize(
        )
    )

    logging.info(
        f"starting the server with ${base_dir.name} as the root directory".capitalize(
        )
    )

    logger.info(f"""
        base directory -> {base_dir}
        inside container -> {inside_container}
        mode -> {mode}
    """)

    def get_ssl_key():
        target_fl = "../certs/key.pem" if inside_container else "../localhost+3-key.pem"
        return Path.resolve(base_dir / target_fl) if mode_https else None

    def get_ssl_cert():
        target_fl = "../certs/cert.pem" if inside_container else "../localhost+3.pem"
        return Path.resolve(base_dir / target_fl) if mode_https else None

    uvicorn.run(
        app="app.main:app",
        port=8000,
        host="0.0.0.0",
        reload=True,
        ssl_keyfile=get_ssl_key(),
        ssl_certfile=get_ssl_cert(),
    )
