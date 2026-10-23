import asyncio
import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, EntityNotFoundException
from app.schemas.enums import AppointmentStatus, Mode
from app.database.models import Appointment, Doctor, Patient
from app.services.AppointmentService import AppointmentService

from app.features.calling.WSService import WS_Service
from app.features.calling.schema import ServerMessageType, ServerMetadata
from app.features.calling.models import (
    ActiveConsultation,
    ConsultationParticipant,
    ParticipantRole
)


logger = logging.getLogger(__name__)


class ConsultationService:
    active_timeouts: dict[UUID, asyncio.Task] = {}
    consultations: dict[UUID, ActiveConsultation] = {}

    @classmethod
    def add_to_consultations(
        cls,
        appointment_id: UUID,
        doctor_id: UUID,
        patient_id: UUID
    ):
        logger.info(
            f"Adding appointment_id #{appointment_id} to consultations."
        )

        if appointment_id in cls.consultations:
            cls.remove_consultation(appointment_id)
            logger.info(
                "Consultation was already present.. "
                "Thus was removed before new addition."
            )

        consultation = ActiveConsultation(
            appointment_id=appointment_id,
            doctor=(
                ConsultationParticipant(
                    role=ParticipantRole.DOCTOR,
                    user_id=doctor_id
                )
            ),
            patient=(
                ConsultationParticipant(
                    role=ParticipantRole.PATIENT,
                    user_id=patient_id
                )
            )
        )

        cls.consultations[appointment_id] = consultation
        logger.info("Consultation created and added sucessfully..")

    @classmethod
    async def validate_appointment(
        cls,
        appointment: Appointment
    ):
        if (
            appointment.status
            is not AppointmentStatus.ACTIVE
        ):
            logger.info("Appointments set to inactive by doctor..")
            raise ConflictError(
                "Appointment is inactive."
            )

        if appointment.slot.mode is Mode.IN_PERSON:
            logger.info(
                "This consultation cannot be conducted in an online mode.."
            )

            raise ConflictError(
                "The appointment is an IN_PERSON only appointment.."
            )

        return appointment

    @classmethod
    async def handle_consultation_initiation(
            cls,
            session: AsyncSession,
            appointment_id: UUID | None,
            initiator: Doctor | Patient,
            peer: UUID
    ) -> Appointment:
        logger.info(
            f"Initiating a consultation started by client \
            #{initiator.name if (isinstance(initiator, Doctor)) else initiator.username}"
        )

        if appointment_id is None:
            logger.info("No appointment found..")
            raise EntityNotFoundException("appointment")

        appointment = await AppointmentService.get_for_participant(
            session=session,
            appointment_id=appointment_id,
            participant=initiator
        )

        if appointment is None:
            logger.info(
                "No appointment found.. Perhaps it does not belong to the user"
            )

            raise ConflictError(
                "We did not find any matching appointment for you."
                "Perhaps this appointment does not belong to you .."
            )

        validated = await cls.validate_appointment(appointment)

        if isinstance(initiator, Doctor):
            peer_relation = validated.patient_id == peer

        else:
            peer_relation = validated.doctor_id == peer

        if not peer_relation:
            logger.info(
                "Peer relationships do not hold for the given appointment."
            )

            logger.info(f"Peer relation: {peer_relation}")

            raise ConflictError(
                "The appointment does not match its relationships."
            )

        return validated

    @classmethod
    async def on_no_answer_timeout(
        cls,
        caller_id: UUID,
        appointment_id: UUID,
        wait_seconds: float = 10,
    ) -> None:
        try:
            await asyncio.sleep(wait_seconds)

            cls.active_timeouts.pop(appointment_id, None)
            cls.remove_consultation(appointment_id=appointment_id)

            socket = WS_Service.get_ws(caller_id)

            if socket is None:
                return

            await WS_Service.send_msg(
                recipient=socket,
                msg_type=ServerMessageType.TIMEOUT,
                payload={
                    "message": "Your peer did not respond within "
                    "the given time constraint."
                },
                metadata=ServerMetadata(
                    appointment_id=appointment_id
                )
            )

        except asyncio.CancelledError:
            pass

        finally:
            cls.active_timeouts.pop(appointment_id, None)

    @classmethod
    def wait_for_answer(
        cls,
        caller_id: UUID,
        appointment_id: UUID
    ) -> None:
        logger.info(
            "Will create a task to wait for an answer from remote peer .."
        )

        cls.cancel_scheduled_task(
            appointment_id=appointment_id
        )

        cls.active_timeouts[appointment_id] = asyncio.create_task(
            cls.on_no_answer_timeout(
                caller_id=caller_id,
                appointment_id=appointment_id
            )
        )

        logger.info(
            "A no Response task was sucessfully created.."
        )

    @classmethod
    def remove_consultation(
        cls,
        appointment_id: UUID
    ):
        if appointment_id in cls.consultations:
            logger.info(
                f"Removing consultation #{appointment_id} .."
            )

            cls.consultations.pop(appointment_id)

    @classmethod
    def cancel_scheduled_task(
        cls,
        appointment_id: UUID
    ):
        if appointment_id in cls.active_timeouts:
            cls.active_timeouts[appointment_id].cancel()
            cls.active_timeouts.pop(appointment_id)

    @classmethod
    def on_recieve_answer(
        cls,
        appointment_id: UUID
    ):
        logger.info(
            f"Answer recieved for appointment #{appointment_id}"
        )

        task = cls.active_timeouts.get(appointment_id, None)

        if task and not task.done():
            cls.cancel_scheduled_task(appointment_id)

            logger.info(
                "Answer recived within the given time constraint"
                "Cancelling the scheduled (on no response task).."
            )

        else:
            raise TimeoutError(
                "The call request has expired .."
            )
