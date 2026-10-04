from pydantic import Field

from app.schemas.appointment import AppointmentPatientResponse
from app.schemas.base import EntityResponse, StrictRequest
from app.schemas.types import Email, LoginPassword, Password, Username


class PatientCreate(StrictRequest):
    email: Email
    password: Password
    username: Username


class PatientLogin(StrictRequest):
    email: Email
    password: LoginPassword


class PatientProfileResponse(EntityResponse):
    email: Email
    username: Username
    email_verified: bool = False
    appointments: list[AppointmentPatientResponse] = Field(
        default_factory=list
    )
