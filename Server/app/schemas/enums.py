import enum


class ReviewableEntity(enum.Enum):
    DOCTOR = "DOCTOR"
    CLINIC = "CLINIC"


class UserRole(enum.Enum):
    """
    This enum is deprecated. User UserRoleV2 instead
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


class AppointmentStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
