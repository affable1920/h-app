import logging

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.features.calling.ConsultationService import ConsultationService
from app.features.calling.WSService import WS_Service
from app.features.calling.schema import (
    ClientMessage,
    ClientMessageType,
    ServerMetadata,
    ServerMessageType
)

from app.database.models import Doctor, Patient
from app.core.exceptions import AppException, InvalidTokenError
from app.database.entry_async import AsyncSessionLocal
from app.features.auth.dependencies import get_current_user


logger = logging.getLogger(__name__)


async def reject_connection(
        ws: WebSocket,
        reason: str,
        subprotocol: str | None = None
) -> None:
    await ws.accept(subprotocol=subprotocol)
    await ws.close(
        code=4444,
        reason=reason
    )


async def authenticate_client(
        ws: WebSocket
) -> Doctor | Patient | None:
    protocol = ws.headers.get("sec-websocket-protocol")

    if protocol is None:
        logger.info("Missing authentication protocol ..")

        await reject_connection(
            ws=ws,
            reason="Missing authentication token ..",
            subprotocol=protocol
        )

        return None

    async with AsyncSessionLocal() as session:
        try:
            client = await get_current_user(
                token=protocol,
                session=session,
            )

        except InvalidTokenError:
            await reject_connection(
                ws=ws,
                reason="Invalid or expired session..",
                subprotocol=protocol
            )

            return None

        if client is None:
            await reject_connection(
                ws=ws,
                reason="User not found..",
                subprotocol=protocol
            )

            return None

        await ws.accept(subprotocol=protocol)
        return client


async def websocket_route(
        ws: WebSocket
):
    client = await authenticate_client(ws)
    if client is None:
        logger.info("Client authentication failed.")
        return

    await WS_Service.connect(client.id, ws)
    logger.info("client sucessfully authenticated.")

    try:
        while True:
            raw = await ws.receive_json()

            try:
                message = ClientMessage.model_validate(raw)

            except ValidationError as e:
                logger.exception("A validation error occurred")
                logger.exception(e)

                continue

            logger.info("Decrypting the client's message..")

            match message.msg_type:
                case ClientMessageType.INIT:
                    logger.info("MATCH 'INIT'")
                    async with AsyncSessionLocal() as session:
                        try:
                            logger.info(
                                "Validating the appointment against "
                                "it's relationships"
                            )

                            appointment = (await (
                                ConsultationService.handle_consultation_initiation(
                                    appointment_id=message.metadata.appointment_id,
                                    initiator=client,
                                    peer=message.metadata.to,
                                    session=session
                                )
                            ))

                        except AppException as e:
                            logger.info(
                                "An error occurred while validating the appointment"
                            )

                            logger.exception(e)

                            await WS_Service.send_msg(
                                recipient=ws,
                                msg_type=ServerMessageType.ERROR,
                                payload={
                                    "code": "appointment_invalid",
                                    "message": e.message
                                },
                                metadata=ServerMetadata(
                                    appointment_id=(
                                        message.metadata.appointment_id
                                    )
                                )
                            )

                            continue

                    ConsultationService.add_to_consultations(
                        appointment_id=appointment.id,
                        doctor_id=appointment.doctor_id,
                        patient_id=appointment.patient_id
                    )

                    await WS_Service.send_msg(
                        recipient=ws,
                        msg_type=ServerMessageType.CONFIRMATION,
                        metadata=ServerMetadata(
                            appointment_id=appointment.id
                        )
                    )

                case ClientMessageType.OFFER:
                    logger.info("MATCH OFFER")
                    offer_sent = await WS_Service.handle_offer(
                        ws=ws,
                        msg=message,
                        sender_id=client.id
                    )

                    call_id = message.metadata.appointment_id

                    if not offer_sent:
                        logger.info(
                            "Offer could not be sent to the remote peer.."
                            "Removing the created consultation .."
                        )

                        ConsultationService.remove_consultation(
                            appointment_id=call_id
                        )

                        continue

                    ConsultationService.wait_for_answer(
                        caller_id=client.id,
                        appointment_id=call_id
                    )

                case ClientMessageType.ANSWER:
                    logger.info("MATCH ANSWER")
                    call_id = message.metadata.appointment_id

                    try:
                        ConsultationService.on_recieve_answer(
                            appointment_id=call_id
                        )

                    except TimeoutError:
                        logger.info("The call request has expired ..")

                        ConsultationService.remove_consultation(
                            appointment_id=call_id
                        )

                        await WS_Service.send_msg(
                            recipient=ws,
                            msg_type=ServerMessageType.TIMEOUT,
                            payload={
                                "message": "You failed to respond within "
                                "the given time constraint, Call request has expired.."
                            },
                            metadata=ServerMetadata(
                                appointment_id=call_id,
                            )
                        )

                        continue

                    await WS_Service.handle_answer(
                        ws=ws,
                        msg=message,
                        sender_id=client.id
                    )

                case ClientMessageType.ICE:
                    await WS_Service.handle_ice(
                        ws=ws,
                        msg=message,
                        sender_id=client.id
                    )

                case ClientMessageType.OFFER_DECLINE:
                    appointment_id, peer_id = (
                        message.metadata.appointment_id,
                        message.metadata.to
                    )

                    logger.info(
                        f"{client.id} declined the offer recieved from #{peer_id}"
                    )

                    ConsultationService.cancel_scheduled_task(
                        appointment_id=appointment_id
                    )

                    ConsultationService.remove_consultation(
                        appointment_id=appointment_id
                    )

                    peer_conn = WS_Service.get_ws(peer_id)

                    if peer_conn is None:
                        continue

                    await WS_Service.send_msg(
                        recipient=peer_conn,
                        msg_type=ServerMessageType.OFFER_DECLINE,
                        payload={
                            "message": "Your peer has declined to answer your call.."
                        },
                        metadata=ServerMetadata(
                            from_=client.id,
                            appointment_id=appointment_id
                        )
                    )

                case ClientMessageType.HANG_UP:
                    appointment_id, peer_id = (
                        message.metadata.appointment_id,
                        message.metadata.to
                    )

                    logger.info(
                        f"#{client.id} hanged up .."
                    )

                    ConsultationService.remove_consultation(
                        appointment_id=appointment_id
                    )

                    ConsultationService.cancel_scheduled_task(
                        appointment_id=appointment_id
                    )

                    peer_conn = WS_Service.get_ws(peer_id)

                    if peer_conn is None:
                        continue

                    await WS_Service.send_msg(
                        recipient=peer_conn,
                        msg_type=ServerMessageType.HANG_UP,
                        payload={
                            "message": "Your peer has ended the call"
                        },
                        metadata=ServerMetadata(
                            from_=client.id,
                            appointment_id=appointment_id
                        )
                    )

                case _:
                    logger.info(
                        "Unknown message type recieved from client .."
                        "Passing ..."
                    )
                    pass

    except WebSocketDisconnect:
        WS_Service.remove_ws(client.id)

    except RuntimeError:
        WS_Service.remove_ws(client.id)

    finally:
        await WS_Service.disconnect(client.id)
