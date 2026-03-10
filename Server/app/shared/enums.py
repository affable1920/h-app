import enum


class UserRole(enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC = "clinic"
    GUEST = "guest"


class Mode(enum.Enum):
    ONLINE = "online"
    IN_PERSON = "in person"


class Status(enum.Enum):
    AWAY = "away"
    AVAILABLE = "available"
    IN_PATIENT = "in_patient"
    UNKNOWN = "unknown"


class AppointmentStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
