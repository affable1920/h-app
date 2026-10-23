import logging
from typing import Any, Self
from uuid import UUID
from fastapi import WebSocket
from fastapi.websockets import WebSocketState

from .schema import (
    ClientMessage,
    ServerMessage,
    ServerMessageType,
    ServerMetadata,
)


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class WS_Service:
    _instance = None
    active_connections: dict[UUID, WebSocket] = {}

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_ws(
        cls,
        user_id: UUID
    ) -> WebSocket | None:
        target = cls.active_connections.get(user_id)
        return target

    @classmethod
    def count(cls) -> int:
        return len(cls.active_connections)

    @classmethod
    async def connect(
        cls,
        user_id: UUID,
        ws: WebSocket
    ) -> None:
        logger.info(msg="\nNew socket wants to register.")

        if user_id in cls.active_connections:
            logger.info(
                f"Client #{user_id} already connected. \
                Closing their current connection to open a new one."
            )

            await cls.disconnect(
                user_id=user_id,
                code=1000,
                reason="New connection for same client .."
            )

            cls.remove_ws(user_id=user_id)

        cls.active_connections[user_id] = ws

        logger.info(
            f"\nSuccesfully registered client #{user_id} with the ws_service. \
            \nTotal active connections: {cls.count()}"
        )

    @classmethod
    def remove_ws(
        cls,
        user_id: UUID
    ) -> None:
        logger.info(f"To Remove client #{user_id}..")

        if cls.get_ws(user_id):
            cls.active_connections.pop(user_id)
            logger.info("removed sucessfully..")

        else:
            logger.info("Not found..")

    @classmethod
    async def disconnect(
        cls,
        user_id: UUID,
        code: int = 1002,
        reason: str = ""
    ) -> None:
        logger.info(f"To Disconnect client #{user_id}")
        conn = cls.get_ws(user_id=user_id)

        if conn is None:
            logger.info(
                f"Client #{user_id} not found in active connections.."
            )

            return

        try:
            if conn.client_state is WebSocketState.CONNECTED:
                await conn.close(
                    code=code,
                    reason=reason
                )

                logger.info(
                    f"Client #{user_id}'s connection was successfully closed."
                )

            else:
                logger.info(
                    f"Client #{user_id} already DISCONNECTED..."
                )

        except RuntimeError:
            pass

        finally:
            cls.remove_ws(user_id)

    @staticmethod
    async def handle_offer(
        ws: WebSocket,
        msg: ClientMessage,
        sender_id: UUID
    ) -> bool:
        peer = msg.metadata.to
        peer_conn = WS_Service.get_ws(user_id=peer)

        if peer_conn is None:
            logger.info(
                f"Target peer-connection #{peer} not found in active connections"
            )

            await WS_Service.send_msg(
                recipient=ws,
                msg_type=ServerMessageType.OFFLINE,
                payload={
                    "message": "The target user is offline .."
                },
                metadata=ServerMetadata(
                    appointment_id=msg.metadata.appointment_id
                )
            )

            return False

        logger.info(
            f"Sending offer from client #{sender_id} to #{peer} ..."
        )

        await WS_Service.send_msg(
            recipient=peer_conn,
            msg_type=ServerMessageType.OFFER,
            payload=msg.payload,
            metadata=ServerMetadata(
                from_=sender_id,
                appointment_id=msg.metadata.appointment_id
            )
        )

        return True

    @staticmethod
    async def handle_answer(
        ws: WebSocket,
        msg: ClientMessage,
        sender_id: UUID
    ) -> None:
        logger.info("Answer handler ..")

        peer = msg.metadata.to
        peer_conn = WS_Service.get_ws(user_id=peer)

        if peer_conn is None:
            logger.info(
                f"Target peer-connection #{peer} not found in active connections"
            )

            await WS_Service.send_msg(
                recipient=ws,
                msg_type=ServerMessageType.OFFLINE,
                payload={
                    "message": "The target user is offline .."
                },
                metadata=ServerMetadata(
                    appointment_id=msg.metadata.appointment_id
                )
            )

            return

        logger.info(
            f"Sending answer from client #{sender_id}  to #{peer} ..."
        )

        await WS_Service.send_msg(
            recipient=peer_conn,
            msg_type=ServerMessageType.ANSWER,
            payload=msg.payload,
            metadata=ServerMetadata(
                appointment_id=msg.metadata.appointment_id,
                from_=sender_id
            )
        )

    @staticmethod
    async def handle_ice(
        ws: WebSocket,
        msg: ClientMessage,
        sender_id: UUID
    ) -> None:
        logger.info("Ice Handler ..")

        peer = msg.metadata.to
        peer_conn = WS_Service.get_ws(user_id=peer)

        if peer_conn is None:
            await WS_Service.send_msg(
                recipient=ws,
                msg_type=ServerMessageType.OFFLINE,
                payload={
                    "message": "The target user is offline .."
                },
                metadata=ServerMetadata(
                    appointment_id=msg.metadata.appointment_id
                )
            )

            return

        logger.info(
            f"Sending ice candidate from client #{sender_id} to #{peer} ..."
        )

        await WS_Service.send_msg(
            recipient=peer_conn,
            msg_type=ServerMessageType.ICE,
            payload=msg.payload,
            metadata=ServerMetadata(
                from_=sender_id,
                appointment_id=msg.metadata.appointment_id
            )
        )

    @classmethod
    async def send_msg(
        cls,
        recipient: WebSocket,
        msg_type: ServerMessageType,
        payload: Any | None = None,
        metadata: ServerMetadata | None = None
    ) -> None:
        await recipient.send_json(
            (ServerMessage(
                msg_type=msg_type,
                payload=payload,
                metadata=metadata
            )).model_dump(
                mode="json",
                by_alias=True,
            )
        )
