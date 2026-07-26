import logging
from fastapi import WebSocket, WebSocketDisconnect
import jwt
from pydantic import ValidationError
from .schema import WS_Message
from app.database.entry_async import get_db
from app.features.calling.WSService import WS_Service
from .dependencies import decode

logger = logging.getLogger(__name__)


async def ws_endpoint(ws: WebSocket):
    protocol = ws.headers.get("sec-websocket-protocol")

    if not protocol:
        logging.info("No protocol headers found")
        await ws.close(code=1002, reason="Missing token")
        return

    await ws.accept(subprotocol=protocol)

    try:
        payload = decode(token=protocol)

    except jwt.ExpiredSignatureError:
        await ws.close(4444, "Session expired. Please login again ...")
        return

    except (jwt.InvalidTokenError, jwt.PyJWTError):
        await ws.close(4444, "Invalid token recieved. Please login again.")
        return

    user_id = payload.get("id")
    if not user_id:
        logging.info("Invalid token. No subject found in token")
        await ws.close(code=4444, reason="invalid token")
        return

    session = await get_db().__anext__()
    from app.services.DrService import DoctorService

    db_user = DoctorService.get_by_id(
        session=session, id=user_id
    )

    if not db_user:
        logging.info("No db user found with id inside token sub")
        await ws.close(code=4444, reason="invalid user")
        return

    logging.info(
        f"\nConnection for client #{user_id} verified. \nRegistering with the service ..."
    )
    await WS_Service.connect(user_id, ws)

    try:
        while True:
            logger.info("\nloop start")
            raw = await ws.receive_json()

            try:
                msg = WS_Message.model_validate(raw)
                logger.info(f"message from client #{user_id}\n{msg}")

            except ValidationError as e:
                logging.error(
                    f"\nValidation error for ws message.\nError -> \n{e}\n Could be a simple text\n continuing ..."
                )
                continue

            """
            For python match-case, which is the counterpart to the swicth case
            statements in languages like c and javascript, does not have any fallthrough
            meaning as soon a case matches, execution stops right there as in python doesn't loop 
            for other case matches, In contrast a "break" statement is required in c and JS as the 
            case matching, otherwise will keep going on over all the cases till a "break" is encountered. 
            """

            match msg.msg_type:
                case "offer":
                    await WS_Service.handle_offer(ws=ws, msg=msg)

                case "answer":
                    await WS_Service.handle_answer(ws=ws, msg=msg)

                case "ice-candidate":
                    await WS_Service.handle_ice(ws=ws, msg=msg)

                case "hang-up":
                    if not msg.metadata:
                        logger.info(f"Client #{user_id} has hanged-up!")
                        return
                    target_ws = WS_Service.get_ws(id=msg.metadata.to_)

                    if target_ws:
                        await WS_Service.send_msg(
                            reciever=target_ws, msg=msg
                        )

                case _:
                    logger.info(
                        f"wildcadrd (_) matched for the message type. Message logged below ..."
                    )
                    logger.info(msg)
                    await WS_Service.hanlde_generic_msg(
                        ws=ws, msg=msg
                    )

    except WebSocketDisconnect as e:
        logger.warning(
            "\nWebsocket Disconnect error occurred. Logging the error below")

        logger.info(e)
        await WS_Service.broadcast(f"Client #{user_id} left the chat.")

    except RuntimeError as e:
        logger.warning(
            f"\nRuntime error for client #{user_id}.\nLogging the error below"
        )
        logger.info(e)

    except Exception:
        logger.warning(f"\nUnexpected exception for client #{user_id}")
