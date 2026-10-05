from __future__ import annotations
from uuid import UUID
import logging
import random
from datetime import date, datetime, timedelta, time
from typing import TYPE_CHECKING, cast
from zoneinfo import ZoneInfo
from faker import Faker

from app.domain import scheduling
from app.features.auth import security
from app.constants.seed_constants import (
    CLINICS,
    CREDENTIALS,
    FACILITIES,
    LICENSE_PREFIXES,
    MEDICAL_COLLEGES,
    PHONE_PREFIXES,
    PINCODES,
    REVIEW_COMMENTS,
    SECONDARY_FOCUS_AREAS,
    SPECIALIZATIONS,
)

from app.schemas.enums import (
    Gender,
    ReviewableEntity,
    ScheduleKind,
    Status,
)

if TYPE_CHECKING:
    from app.database.models import Schedule

faker = Faker()
logger = logging.getLogger(__name__)

DEFAULT_SCHEDULE_TIMEZONE = "Asia/Kolkata"


def roll(probability: float = 0.5) -> bool:
    """Return True with the given probability."""
    return random.random() < probability


def generate_patients(
        count: int = 40
) -> list[dict[str, object]]:
    return [
        {
            "username": faker.user_name(),
            "email": faker.unique.email(),
            "hash": security.hash(faker.password())
        }
        for _ in range(count)
    ]


def generate_reviews(
        patient_id: UUID,
        doctor_id: UUID
) -> dict[str, object]:
    return {
        "rating": random.randint(1, 5),
        "comment": random.choice(REVIEW_COMMENTS),
        "entity": ReviewableEntity.DOCTOR,
        "entity_id": doctor_id,
        "patient_id": patient_id,
    }


def generate_random_contact():
    return (
        f"{random.choice(PHONE_PREFIXES)}"
        f"{random.randint(100000, 999999)}"
    )


def generate_random_date(
    *,
    today: date,
    horizon_days: int = 31,
) -> date:
    if horizon_days < 0:
        raise ValueError(
            "Schedule start-date horizon cannot be negative."
        )

    return today + timedelta(
        days=random.randint(0, horizon_days)
    )


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


def create_doctor() -> dict[str, object]:
    """Generate doctor information."""
    return {
        "name": faker.name(),
        "email": faker.unique.email(),
        "hash": security.hash(faker.password()),
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
            f"{random.choice(LICENSE_PREFIXES)}/"
            f"{random.randint(1995, 2020)}/"
            f"{random.randint(10000, 99999)}"
        ),
        "graduation_year": random.randint(1995, 2020),
        "bio": faker.text(max_nb_chars=random.randint(50, 200))
    }


def create_schedule(
    doctor_id: UUID,
    clinic_id: UUID,
    base_duration: int = 20,
    *,
    today: date | None = None,
    recurrence_kind: ScheduleKind | None = None,
    timezone: str = DEFAULT_SCHEDULE_TIMEZONE
):
    """Generate realistic schedules."""
    if base_duration < 5:
        raise ValueError(
            "Schedule slot duration must be at least five minutes."
        )

    local_zone = ZoneInfo(timezone)

    if today is None:
        today = (datetime.now(local_zone)).date()

    kind = (
        recurrence_kind
        if recurrence_kind is not None
        else random.choice(list(ScheduleKind))
    )

    interval = (
        1
        if kind == ScheduleKind.ONE_OFF
        else random.randint(1, 3)
    )

    starts_on = generate_random_date(today=today)

    if roll():
        start = time(7, 30)
        end = time(11, 0)

    else:
        start = time(16, 0)
        end = time(20, 0)

    common_fields: dict[str, object] = {
        "doctor_id": doctor_id,
        "clinic_id": clinic_id,
        "recurrence_kind": kind,
        "timezone": timezone,
        "starts_on": starts_on,
        "ends_on": None,
        "interval": interval,
        "weekdays": None,
        "month_days": None,
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
            }

        case ScheduleKind.WEEKLY:
            weekdays = sorted(
                random.sample(
                    list(range(1, 8)),
                    k=random.randint(1, 3)
                )
            )

            recurrence_fields = {
                "ends_on": random.choice([
                    None,
                    starts_on + timedelta(
                        days=random.randint(20, 90)
                    )
                ]),
                "weekdays": weekdays,
            }

        case ScheduleKind.MONTHLY:
            month_days = sorted(
                random.sample(
                    list(range(1, 32)),
                    k=random.randint(1, 6)
                )
            )

            recurrence_fields = {
                "ends_on": random.choice([
                    None,
                    starts_on + timedelta(
                        days=random.randint(60, 180)
                    )
                ]),
                "month_days": month_days,
            }

        case _:
            raise ValueError(
                f"Unsupported schedule recurrence kind: {kind!r}"
            )

    return {
        **common_fields,
        **recurrence_fields
    }


def generate_slots_for_schedule(
    schedule: Schedule,
    *,
    today: date | None = None,
    horizon_days: int = (
        scheduling.DEFAULT_GENERATION_HORIZON_DAYS
    )
):
    if not schedule.is_active:
        return []

    logger.info(
        "Generating slots for schedule %s.",
        schedule.id
    )

    schedule_record = cast(
        scheduling.ScheduleRecord,
        schedule
    )

    occurrences = scheduling.calculate_generation_bounds(
        schedule_record,
        today=today,
        horizon_days=horizon_days
    )

    return scheduling.generate_slots(
        timezone=schedule.timezone,
        occurrences=occurrences,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        slot_duration=schedule.base_slot_duration,
        schedule_id=schedule.id,
        max_slots=schedule.max_slots,
        allow_online_consultations=(
            schedule.allow_online_consultations
        ),
    )


def generate_doctors(count: int = 40):
    return list((create_doctor() for _ in range(count)))


def generate_clinics(count: int = 40):
    create = generate_clinic()
    return list((create() for _ in range(count)))
