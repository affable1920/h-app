from typing import Any
from datetime import time

from app.models.doctorModel.DoctorExtraTypes import Status

# Constants
HOSPITALS = [
    "Sopore sub-district Hospital",
    "Central Medical Centre",
    "St. Mary's Healthcare",
    "Urban Clinic Complex",
    "Regional Medical Institute",
    "Sunrise Medical Center",
    "Elite Healthcare Hub",
]

CREDENTIALS = ["MD", "MBBS", "DO", "DPM", "DC"]

SPECIALIZATIONS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Psychiatry",
    "Ophthalmology",
    "ENT",
    "General Medicine",
    "Gastroenterology",
]

DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday",
                "Wednesday", "Thursday", "Friday", "Saturday"]

CONSULTATION_DURATION_OPTIONS = [15, 30, 45, 60]

CONSULTATION_FEE_RANGE = {"MIN": 100, "MAX": 400}

TIME_SLOTS = [
    time(8, 0),
    time(8, 30),
    time(9, 0),
    time(9, 30),
    time(10, 0),
    time(10, 30),
    time(11, 0),
    time(11, 30),
    time(12, 0),
    time(14, 0),
    time(14, 30),
    time(15, 0),
    time(15, 30),
    time(16, 0),
    time(16, 30),
    time(17, 0),
    time(17, 30),
    time(18, 0),
    time(18, 30),
    time(19, 0),
    time(19, 30),
    time(20, 0),
    time(20, 30),
    time(21, 0),
    time(21, 30),
    time(22, 0),
    time(22, 30),
]

STATUSES: list[Status] = [Status.AVAILABLE,
                          Status.AWAY, Status.BUSY, Status.UNKNOWN]


NAMES = ["James", "Sarah", "Michael", "Emily", "David", "Jennifer", "Robert", "Lisa",
         "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
