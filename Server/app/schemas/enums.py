import enum
from typing_extensions import deprecated


class ReviewableEntity(enum.Enum):
    DOCTOR = "DOCTOR"
    CLINIC = "CLINIC"


@deprecated("This enum is deprecated. User UserRoleV2 instead")
class UserRole(enum.Enum):
    """
    """
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC = "clinic"
    GUEST = "guest"


class Mode(enum.Enum):
    ONLINE = "online"
    IN_PERSON = "in person"


class UserRoleV2(enum.Enum):
    CLINIC_ADMIN = "clinic_admin"
    DOCTOR = "doctor"
    PATIENT = "patient"


class Status(enum.Enum):
    AWAY = "away"
    AVAILABLE = "available"
    IN_PATIENT = "in_patient"
    UNKNOWN = "unknown"


class AppointmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
