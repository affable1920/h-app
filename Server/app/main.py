import json
from contextlib import asynccontextmanager

from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi import (
    Depends,
    FastAPI,
    Request,
    WebSocketDisconnect,
    WebSocketException,
    status,
    WebSocket,
)


from app.database.models import Patient
from app.routes import auth, clinics, doctors
from app.helpers.authentication import get_curr_user

from app.services.data_generator import seed_db
from app.services.openapi_spec import generate_openapi_spec


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


origins = [
    "http://localhost:5173",
    "http://localhost:5100",
    "http://10.66.208.207:5173",
    "http://10.185.226.176:5173",
    "https://h-app-omega.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=origins,
    allow_credentials=True,
    expose_headers=["x-session-expire", "x-auth-token"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(clinics.router)

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


@app.middleware("http")
async def logger(req: Request, call_next):
    print("cookies recieved with http rqst: ", req.cookies)

    response = await call_next(req)
    return response


ws_conns: dict[str, WebSocket] = {}

print("active ws conns: ", ws_conns)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, db_user: Patient = Depends(get_curr_user)):
    print("ws conn request recieved ...")

    if not db_user:
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION, reason="not authenticated"
        )

    ws_conns[str(db_user.id)] = ws

    await ws.accept()
    await ws.send_text(f"Welcome User {db_user.id}")

    print(f"ws connection established with user {db_user.id}")
    print(f"total joined members {len(ws_conns)}")

    try:
        while True:
            msg = await ws.receive_text()

            try:
                msg = json.loads(msg)

            except json.JSONDecodeError:
                print("recieved plain string as message ...")
                print("msg sent by connection: ", msg)
                continue

            msg_type = msg.get("type", None)
            if not msg_type:
                pass

            match msg_type:
                case "offer":
                    callee: str = msg.get("to", None)

                    print("calle: ", callee)

                    if callee is None:
                        print("reciever offline")
                        reply = {
                            "type": "not available",
                            "msg": "doctor seems to be offline",
                        }
                        await ws.send_text(json.dumps(reply))

                    if callee in ws_conns:
                        print(
                            "callee online. trying to connect... \n\nsending offer to callee ..."
                        )

                        res = {"type": "answer", "answer": msg.get("offer", "")}
                        await ws_conns[callee].send_text(json.dumps(res))
                        pass

                case "answer":
                    pass

                case "ice-candidate":
                    pass

                case "user-join":
                    pass

    except WebSocketDisconnect:
        ws_conns.pop(str(db_user.id), None)
        raise WebSocketException(
            code=status.WS_1000_NORMAL_CLOSURE, reason="websocket disconnect"
        )


# if __name__ == "__main__":
#     import uvicorn

#     # update host === localhost to 0.0.0.0 and reload from false to true in prod
#     uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
