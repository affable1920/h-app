from datetime import date, datetime, time, timedelta
import logging
from uuid import UUID
from zoneinfo import ZoneInfo

from app.database.models import Schedule, Slot
from app.schemas.enums import Mode, ScheduleKind


logger = logging.getLogger(__name__)


def calculate_weekly_occurrences(
        *,
        starts_on: date,
        weekdays: list[int],
        ends_on: date | None = None,
        interval: int = 1
) -> list[date]:
    local_today = (
        datetime.now(
            ZoneInfo("Asia/Kolkata")
        )
    ).date()

    horizon = local_today + timedelta(days=60)
    generation_start = max(starts_on, local_today)

    if ends_on is not None:
        generation_end = min(horizon, ends_on)

    else:
        generation_end = horizon

    candidate = generation_start

    start_week = (
        starts_on
        - timedelta(days=starts_on.weekday())
    )

    occurrences: list[date] = []

    while candidate <= generation_end:
        if candidate.isoweekday() in weekdays:
            candidate_week = (
                candidate
                - timedelta(days=candidate.weekday())
            )

            diff = (candidate_week - start_week).days
            week_index = diff // 7

            matches_interval = (
                week_index % interval == 0
            )

            if matches_interval:
                occurrences.append(candidate)

        candidate += timedelta(days=1)

    return occurrences


def calculate_monthly_occurrences(
        *,
        starts_on: date,
        month_days: list[int],
        ends_on: date | None = None,
        interval: int = 1
):
    local_today = (
        datetime.now(
            ZoneInfo("Asia/Kolkata")
        )
    ).date()

    horizon = local_today + timedelta(days=60)
    generation_start = max(starts_on, local_today)

    generation_end = (
        min(
            ends_on, horizon
        )
        if ends_on is not None
        else horizon
    )

    candidate = generation_start
    occurrences: list[date] = []

    while candidate <= generation_end:
        if candidate.day in month_days:
            year_difference = (
                candidate.year
                - starts_on.year
            )

            months_from_years = year_difference * 12

            months_difference = (
                candidate.month
                - starts_on.month
            )

            """
            For each candidate, the code asks:
            
            Is its day selected?
            If yes:

            How many months is its month from the starting month?
            Does that distance fit the interval?
            
            An easier to remember and reason about central formula is:
            months_since_start = (
                (candidate.year - starts_on.year) * 12
                + (candidate.month - starts_on.month)
            )

            """

            months_since_start = (
                months_from_years
                + months_difference
            )

            matches_interval = (
                months_since_start % interval == 0
            )

            if matches_interval:
                occurrences.append(candidate)

        candidate += timedelta(days=1)

    return occurrences


def calculate_generation_bounds(
        schedule_record: Schedule
) -> list[date]:
    logger.info(
        f"Calculating generation bounds for schedule: {schedule_record} .."
    )

    interval = schedule_record.interval
    recurrence_kind = schedule_record.recurrence_kind

    starts_on = schedule_record.starts_on
    ends_on = schedule_record.ends_on

    logger.info(
        f"Schedule set to start on {starts_on}"
        f"\nand set set to end on {ends_on}"
    )

    match recurrence_kind:
        case ScheduleKind.ONE_OFF:
            logger.info(
                f"Schedule is a '{ScheduleKind.ONE_OFF}' schedule .."
            )
            return [starts_on]

        case ScheduleKind.WEEKLY:
            logger.info(
                f"Schedule is a '{ScheduleKind.WEEKLY}' recurring schedule .."
            )
            assert schedule_record.weekdays is not None
            return calculate_weekly_occurrences(
                starts_on=starts_on,
                weekdays=schedule_record.weekdays,
                ends_on=ends_on,
                interval=interval,
            )

        case ScheduleKind.MONTHLY:
            logger.info(
                f"Schedule is a '{ScheduleKind.MONTHLY}' recurring schedule .."
            )
            assert schedule_record.month_days is not None
            return calculate_monthly_occurrences(
                starts_on=starts_on,
                month_days=schedule_record.month_days,
                ends_on=ends_on,
                interval=interval
            )


def generate_slots(
        occurrences: list[date],
        start_time: time,
        end_time: time,
        slot_duration: int,
        schedule_id: UUID,
        max_slots: int | None = None,
        allow_online_consultations: bool = False
) -> list[dict]:
    all_slots = []

    for candidate in occurrences:
        slots_for_date = []

        local_start = datetime.combine(
            candidate,
            start_time
        )

        local_end = datetime.combine(
            candidate,
            end_time
        )

        window = local_start
        duration = timedelta(minutes=slot_duration)

        while window + duration <= local_end:
            if (
                max_slots is not None
                and len(slots_for_date) >= max_slots
            ):
                break

            slots_for_date.append({
                "schedule_id": schedule_id,
                "slot_datetime": window,
                "is_booked": False,
                "mode": (
                    Mode.HYBRID
                    if allow_online_consultations
                    else Mode.IN_PERSON
                ),
                "duration": slot_duration
            })

            window += duration

        all_slots.extend(slots_for_date)

    return all_slots
