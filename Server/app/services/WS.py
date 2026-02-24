import logging
from typing import Any, Self
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState

from app.schemas.http import MsgType, WS_Message


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

offline_msg = WS_Message(type=MsgType.OFFLINE, payload="Target socket is offline")


class WS_Service:
    _instance = None
    active_conns: dict[str, WebSocket] = {}

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    #

    @classmethod
    def get_ws(cls, id: str) -> WebSocket | None:
        target = cls.active_conns.get(id)
        return target if target else None

    #

    @classmethod
    def count(cls) -> int:
        return len(cls.active_conns)

    #

    @classmethod
    async def connect(cls, id: str, ws: WebSocket):
        logger.info(msg="\nNew socket wants to register.")

        if id in cls.active_conns:
            logger.info(
                f"\nClient #{id} already connected. Closing current connection to open a new one."
            )
            await cls.disconnect(
                id=id, code=1000, reason="New connection for same client"
            )

        cls.active_conns[id] = ws
        logger.info(
            f"\nSuccesfully registered client #{id} with the ws_service. \nTotal active connections: {cls.count()}"
        )

    #

    @classmethod
    def remove_ws(cls, id: str):
        if cls.get_ws(id):
            cls.active_conns.pop(id)

        else:
            logger.info(
                f"\n Client #{id} to be removed not found in active connections."
            )

    #

    @classmethod
    async def disconnect(cls, id: str, code: int = 1002, reason: str = ""):
        """
        The 4 case scenarios to likely happen for a socket on recieving a disconnect request:

        1. In active conns dict and connected -> pop and close
        2. Connected but not in dict -> likely a bug as the endpoint always registers with connect
        -  for a new conn

        3. In dict but not connected (likely dead) -> pop and log warning - no close
        4. Not in dict and not connected -> no-op return

        """

        logger.info(f"\nDisconnection request recieved for client #{id}")
        target_ws = cls.get_ws(id=id)

        if target_ws is None:
            logger.info(
                f"\nClient #${id} not in currently active connections. Aborting close on it"
            )
            return

        logger.info("\nTarget ws is present in active connections")

        try:
            """
            Here, inside the try block we get only if the ws is in our active connections dict. 
            So if it is not yet closed we close it while keeping errors in mind.

            finally, we nevertheless pop it from our active connections dict. 

            """

            if target_ws.client_state == WebSocketState.CONNECTED:
                await target_ws.close(code=code, reason=reason)
                logger.info(f"\nClient #{id} found active. Was uccessfully closed.")

            else:
                logger.info(
                    f"\nClient #{id} already in DISCONNECTED state. Skipping close call ..."
                )

        except RuntimeError as e:
            logger.warning(
                f"\nRuntime error for calling close on client #{id}\nLogging the error below"
            )
            logger.info(e)

        finally:
            cls.remove_ws(id)
            logger.info(
                f"\nRemoved client #{id} from active connections list\nCurrent active count -> {cls.count()}"
            )

    #

    @classmethod
    async def broadcast(cls, payload: Any, type_: MsgType = MsgType.BROADCAST):
        logger.info(
            f"\nBroadcasting to active connections ... \nCurrently active ->({cls.count()}) -> \n{cls.active_conns}"
        )
        msg = WS_Message(type=type_, payload=payload)
        for id, socket in cls.active_conns.items():
            try:
                if socket.application_state == WebSocketState.CONNECTED:
                    await socket.send_json(msg.model_dump_json())

            except RuntimeError as e:
                logger.info(
                    f"\nRuntime error occurred for client #{id}. Logging the error below ..."
                )
                logger.info(e)

            except WebSocketDisconnect:
                await cls.disconnect(id=id)

    #

    @staticmethod
    async def handle_offer(ws: WebSocket, msg: WS_Message):
        if not msg.metadata:
            reply = "No metadata found in the msg, taking it as a simple text one."
            logger.info(reply)
            await ws.send_text(reply)
            return

        target_id = msg.metadata.to_
        target_ws = WS_Service.get_ws(id=target_id)

        if target_ws is None:
            logger.info("Target socket conn not active")
            await ws.send_json(offline_msg.model_dump_json())
            return

        logger.info("target socket online. Sending offer to target ...")
        await target_ws.send_json(msg.model_dump_json())

    #

    @staticmethod
    async def handle_answer(ws: WebSocket, msg: WS_Message):
        if not msg.metadata:
            reply = (
                "No metadata found in the ws message. Contuning as a simple text ..."
            )
            logger.info(reply)
            await ws.send_text(reply)
            return

        logger.info("answer received")

        target_id = msg.metadata.to_
        target_ws = WS_Service.get_ws(id=target_id)

        if target_ws is None:
            logger.info("Target seems to be offline. Aborting ...")
            await ws.send_json(offline_msg.model_dump_json())
            return

        logger.info("Sending answer to target ...")
        await target_ws.send_json(msg.model_dump_json())

    #

    @staticmethod
    async def handle_ice(ws: WebSocket, msg: WS_Message):
        if not msg.metadata:
            reply = (
                "No metadata found in the ws message. Contuning as a simple text ..."
            )
            logger.info(reply)
            await ws.send_text(reply)
            return

        logger.info("Ice candidate received")

        target_id = msg.metadata.to_
        target_ws = WS_Service.get_ws(id=target_id)

        if target_ws is None:
            logger.info(
                "Target socket seems to be offline. Aborting ice candidate send ..."
            )
            await ws.send_json(offline_msg.model_dump_json())
            return

        logger.info("Sending ice candidate to target ...")
        await target_ws.send_json(msg.model_dump_json())
