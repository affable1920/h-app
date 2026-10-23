from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID


class ParticipantRole(StrEnum):
    DOCTOR = "doctor"
    PATIENT = "patient"


@dataclass(frozen=True)
class ConsultationParticipant:
    user_id: UUID
    role: ParticipantRole


@dataclass(frozen=True)
class ActiveConsultation:
    appointment_id: UUID
    doctor: ConsultationParticipant
    patient: ConsultationParticipant

    def __post_init__(self) -> None:
        if self.doctor.role is not ParticipantRole.DOCTOR:
            raise ValueError(
                "doctor must have the doctor role."
            )

        if self.patient.role is not ParticipantRole.PATIENT:
            raise ValueError(
                "patient must have the patient role."
            )
