from datetime import date, datetime, timedelta
import logging

from faker import Faker
import random

from app.database.models import Clinic, Doctor, Schedule
from app.domain import scheduling
from app.features.auth import security
from app.constants.seed_constants import *
from app.schemas.enums import *


faker = Faker()
logger = logging.getLogger(__name__)


def roll(probability: float = 0.5) -> bool:
    """Return True with the given probability."""
    return random.random() < probability


def generate_patients(count: int = 40):
    return list(({
        "username": faker.user_name(),
        "email": faker.email(),
        "hash": security.hash(faker.password()),
        "appointments": []
    } for _ in range(count)))


# =========================================================================================================

def generate_reviews(patient_id: str, doctor_id: str):
    return {
        "rating": random.randint(1, 5),
        "comment": random.choice(REVIEW_COMMENTS),
        "entity": ReviewableEntity.DOCTOR,
        "entity_id": doctor_id,
        "patient_id": patient_id,
    }

# =========================================================================================================


def generate_random_contact():
    return (
        f"{random.choice(PHONE_PREFIXES)}"
        f"{random.randint(100000, 999999)}"
    )

# =========================================================================================================


def generate_random_date(
    horizon: int = 31
) -> date:
    return random.choice([
        datetime.now().date(),
        datetime.now().date() + timedelta(
            days=random.randint(1, horizon)
        )
    ])

# =========================================================================================================


def generate_clinic():
    allotted = set()

    def create():
        """Generate a single clinic record."""
        cl_name = random.choice(CLINICS)
        logger.info(f"Clinic name -> {cl_name}")

        while cl_name in allotted:
            cl_name = faker.company()

        logger.info(f"new clinic name after check -> {cl_name}")

        allotted.add(cl_name)

        contact = generate_random_contact()
        loc = random.choice(list(PINCODES.keys()))

        return {
            "name": cl_name,
            "owner": faker.name(),
            "pincode": PINCODES[loc],
            "location": loc,
            "contact_numbers": [
                generate_random_contact()
                for _ in range(random.randint(1, 2))
            ] + [contact],
            "whatsapp": contact,
            "facilities": random.sample(FACILITIES, k=random.randint(0, 12)),
            "specializations": random.sample(SPECIALIZATIONS, k=random.randint(1, 7)),
        }

    return create


def create_doctor():
    """Generate doctor information."""
    pwd = faker.password()
    name = faker.name()

    return {
        "name": name,
        "email": f"{name}{faker.email().split('@')[1]}",
        "hash": security.hash(pwd),
        "phone": generate_random_contact(),
        "experience": random.randint(1, 35),
        "verified": roll(),
        "primary_specialization": random.choice(SPECIALIZATIONS),
        "secondary_focus_areas": random.sample(
            SECONDARY_FOCUS_AREAS, k=random.randint(1, 3)
        ),
        "fee": random.randint(100, 400),
        "credentials": random.choice(CREDENTIALS),
        "consults_online": roll(.3),
        "status": random.choice(list(Status)),
        "gender": random.choice(list(Gender)),
        "college_studied": random.choice(MEDICAL_COLLEGES),
        "license_number": (
            f"{random.choice(LICENSE_PREFIXES)}/\
            {random.randint(1995, 2020)}/\
            {random.randint(10000, 99999)}"
        ),
        "graduation_year": random.randint(1995, 2020),
        "bio": faker.text(max_nb_chars=random.randint(50, 200))
    }


def create_schedule(
    doctor_id: str,
    clinic_id: str,
    base_duration: int = 20
):
    """Generate realistic schedules."""
    is_morning = roll()

    if is_morning:
        start = time(7, 30)
        end = time(11, 0)

    else:
        start = time(16, 0)
        end = time(20, 0)

    starts_on = generate_random_date()
    kind = random.choice(list(ScheduleKind))

    common_fields = {
        "doctor_id": doctor_id,
        "clinic_id": clinic_id,
        "recurrence_kind": kind,
        "timezone": "Asia/Kolkata",
        "starts_on": starts_on,
        "interval": random.randint(1, 3),
        "start_time": start,
        "end_time": end,
        "base_slot_duration": base_duration,
        "is_active": roll(.9),
        "allow_online_consultations": roll(),
        "max_slots": random.randint(5, 15),
    }

    match kind:
        case ScheduleKind.ONE_OFF:
            recurrence_fields = {
                "ends_on": starts_on,
                "interval": 1,
            }

        case ScheduleKind.WEEKLY:
            recurrence_fields = {
                "ends_on": random.choice([
                    None,
                    starts_on + timedelta(
                        days=random.randint(20, 90)
                    )
                ]),
                "weekdays": random.sample(
                    list(range(1, 8)),
                    k=random.randint(1, 3)
                ),
                "month_days": None
            }

        case ScheduleKind.MONTHLY:
            recurrence_fields = {
                "ends_on": random.choice([
                    None,
                    starts_on + timedelta(
                        days=random.randint(60, 180)
                    )
                ]),
                "month_days": random.sample(
                    list(range(1, 32)),
                    k=random.randint(1, 6),
                ),
                "weekdays": None
            }

    return {
        **common_fields,
        **recurrence_fields
    }


def generate_slots(
    schedule: Schedule,
):
    logger.info(
        f"Commencing slot generation for schedule {schedule}"
    )

    occurrences = scheduling.calculate_generation_bounds(
        schedule
    )

    slots = scheduling.generate_slots(
        occurrences=occurrences,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        slot_duration=schedule.base_slot_duration,
        schedule_id=schedule.id,
        max_slots=schedule.max_slots,
        allow_online_consultations=schedule.allow_online_consultations
    )

    return slots


def generate_doctors(count: int = 40):
    return list((create_doctor() for _ in range(count)))

    #


def generate_schedules(doctor_id: str, clinic_id: str):
    return list((create_schedule(doctor_id, clinic_id)))

    #


def generate_clinics(count: int = 40):
    create = generate_clinic()
    return list((create() for _ in range(count)))


def assign_clinics_to_drs(
    doctors: list[Doctor],
    clinics: list[Clinic]
):
    """
    Create many-to-many relationships between doctors and clinics.
    Each doctor gets assigned to 1-3 random clinics.
    """

    for doctor in doctors:
        num_clinics = random.randint(1, 3)
        assigned_clinics = random.sample(clinics, num_clinics)
        doctor.clinics.extend(assigned_clinics)
