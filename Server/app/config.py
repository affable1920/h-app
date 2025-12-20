from enum import Enum


class UserRole(Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"
    CLINIC = "clinic"
    GUEST = "guest"


class Mode(Enum):
    ONLINE = "online"
    IN_PERSON = "in person"


class Status(str, Enum):
    AWAY = "away"
    AVAILABLE = "available"
    IN_PATIENT = "in_patient"
