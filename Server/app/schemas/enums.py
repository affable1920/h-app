from enum import StrEnum
from typing_extensions import deprecated


class ReviewableEntity(StrEnum):
    DOCTOR = "DOCTOR"
    CLINIC = "CLINIC"


@deprecated("This enum is deprecated. Use UserRoleV2 instead ..",)
class UserRole(StrEnum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC = "clinic"
    GUEST = "guest"


class Mode(StrEnum):
    ONLINE = "online"
    IN_PERSON = "in person"
    HYBRID = "hybrid"


class UserRoleV2(StrEnum):
    CLINIC_ADMIN = "clinic_admin"
    DOCTOR = "doctor"
    PATIENT = "patient"


class Status(StrEnum):
    AWAY = "away"
    AVAILABLE = "available"
    IN_PATIENT = "in_patient"
    UNKNOWN = "unknown"


class AppointmentStatus(StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"


class ScheduleKind(StrEnum):
    ONE_OFF = "one-off"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
