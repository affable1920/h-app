from pathlib import Path
import logging
from contextlib import asynccontextmanager

from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi import (
    FastAPI,
    Request,
    status,
)


from app.routes import websocket
from app.routes import auth, clinics, doctors

from app.services.data_generator import seed_db
from app.services.openapi_spec import generate_openapi_spec


logger = logging.getLogger(__name__)
logging.basicConfig(filename=Path(__file__), level=logging.INFO)


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")

    from app.database.entry import Base, engine

    Base.metadata.create_all(engine)
    # await seed_db()
    app.openapi_schema = generate_openapi_spec(app)  # Generate schema once

    yield
    print("Shutting down")


app = FastAPI(
    lifespan=root, openapi_url="/openapi.json", docs_url="/docs", redoc_url="/redoc"
)


@app.exception_handler(RequestValidationError)
async def validation_err_handler(req: Request, e: RequestValidationError):
    body = await req.body()

    print(f"Request Body: {body.decode()}")
    print(f"Errors: {e.errors()}")

    print(f"route: {req.url}")

    return JSONResponse(
        content={
            "detail": e.errors(),
            "msg": "invalid data",
            "type": "request validation error",
        },
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
app.include_router(clinics.router)
app.add_websocket_route("/ws", websocket.ws_endpoint)

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <label>Item ID: <input type="text" id="itemId" autocomplete="off" value="foo"/></label>
            <label>Token: <input type="text" id="token" autocomplete="off" value="some-key-token"/></label>
            <button onclick="connect(event)">Connect</button>
            <hr>
            <label>Message: <input type="text" id="messageText" autocomplete="off"/></label>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
        var ws = null;
            function connect(event) {
                var itemId = document.getElementById("itemId")
                var token = document.getElementById("token")
                ws = new WebSocket("ws://localhost:8000/items/" + itemId.value + "/ws?token=" + token.value);
                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages')
                    var message = document.createElement('li')
                    var content = document.createTextNode(event.data)
                    message.appendChild(content)
                    messages.appendChild(message)
                };
                event.preventDefault()
            }
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def root_path():
    return HTMLResponse(html)


@app.get("/health")
async def health_check():
    status = {"status": "ok"}
    return status


@app.get("/generate")
async def generate_data():
    await seed_db()
    return {"message": "Data generated successfully"}


if __name__ == "__main__":
    import uvicorn
    from .core.config import USE_HTTPS

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
