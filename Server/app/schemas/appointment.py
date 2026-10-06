from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import Field

from app.schemas.base import EntityResponse, StrictRequest
from app.schemas.clinic import ClinicHttpMinimal
from app.schemas.doctor import DoctorHttpMinimal
from app.schemas.enums import AppointmentStatus
from app.schemas.schedule import Slot
from app.schemas.user import UserResponse


class BookingRequestData(StrictRequest):
    doctor_id: UUID
    slot_id: UUID
    reason_for_visit: Annotated[str | None, Field(max_length=1000)] = None


class CareJourneyResponse(EntityResponse):
    reason_for_visit: str | None = None


class AppointmentConfirmation(EntityResponse):
    scheduled_date: datetime
    created_at: datetime
    status: AppointmentStatus
    care_journey: CareJourneyResponse | None = None


class AppointmentPatientResponse(AppointmentConfirmation):
    slot: Slot
    clinic: ClinicHttpMinimal
    doctor: DoctorHttpMinimal


class AppointmentDoctorResponse(AppointmentConfirmation):
    slot: Slot
    clinic: ClinicHttpMinimal
    patient: UserResponse
