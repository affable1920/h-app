import logging

from fastapi import (
    FastAPI,
    Request,
)

from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path

from app.scripts.openapi_spec import generate_openapi_spec
from app.routes import auth, doctors, bookings, clinics
from app.features.calling import ws_route
from app.features.chatbot import chat_route


#
logger = logging.getLogger(__name__)


@asynccontextmanager
async def root(app: FastAPI):
    logger.info("Starting up")

    app.openapi_schema = generate_openapi_spec(app)  # Generate schema once

    yield
    logger.info("Shutting down")


app = FastAPI(
    lifespan=root,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.exception_handler(RequestValidationError)
async def validation_err_handler(req: Request, e: RequestValidationError):
    logger.debug("Errors: ", e.errors())
    return JSONResponse(
        status_code=422,
        content={
            "detail": str(e.errors()),
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    expose_headers=["x-session-expire", "x-auth-token"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(bookings.router)
app.include_router(clinics.router)
app.include_router(chat_route.router)
app.add_websocket_route("/ws", ws_route.ws_endpoint)


html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form onsubmit="sendMessage(event)">
            <label>Message: <input type="text" id="messageText" autocomplete="off"/></label>
            <button type="submit">Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            
        </script>
    </body>
</html>
"""


@app.get("/")
async def root_path():
    return HTMLResponse(html)


@app.get("/ping")
async def ping():
    return {
        "message": "pong"
    }


if __name__ == "__main__":
    import uvicorn
    from app.core.config import USE_HTTPS

    """
    Hardcoding the base directory path to the root of the app for now
    later, use a loop until the base dir becomes .h-app 
    """

    BASE_DIR = Path(__file__).parent.parent.parent
    is_https = int(USE_HTTPS) == 1

    logging.info(
        f"running server in {'https' if is_https else 'http'} mode".capitalize()
    )

    uvicorn.run(
        app="app.main:app",
        port=8000,
        host="0.0.0.0",
        reload=True,
        ssl_keyfile=str(BASE_DIR / "key.pem") if is_https else None,
        ssl_certfile=str(BASE_DIR / "cert.pem") if is_https else None,
    )
