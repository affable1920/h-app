from uuid import UUID
from zoneinfo import ZoneInfo
import logging
from datetime import date, datetime, time, timedelta
from typing import Protocol, TypedDict


from app.schemas.enums import Mode, ScheduleKind


class ScheduleRecord(Protocol):
    timezone: str
    recurrence_kind: ScheduleKind
    starts_on: date
    ends_on: date | None
    interval: int
    weekdays: list[int] | None
    month_days: list[int] | None


class SlotValues(TypedDict):
    schedule_id: UUID
    slot_datetime: datetime
    is_booked: bool
    mode: Mode
    duration: int


logger = logging.getLogger(__name__)

DEFAULT_GENERATION_HORIZON_DAYS = 60


def _generate_window(
        *,
        starts_on: date,
        ends_on: date | None,
        today: date,
        horizon_days: int
) -> tuple[date, date]:
    """Return the inclusive window eligible for occurrence generation."""

    if horizon_days < 0:
        raise ValueError("Generation horizon cannot be negative ..")

    if (
        ends_on is not None
        and ends_on < starts_on
    ):
        raise ValueError(
            "Schedule end date cannot precede start date .."
        )

    generation_start = max(starts_on, today)
    horizon_end = generation_start + timedelta(days=horizon_days)

    generation_end = (
        min(ends_on, horizon_end)
        if ends_on is not None
        else horizon_end
    )

    return generation_start, generation_end


def calculate_weekly_occurrences(
        *,
        starts_on: date,
        weekdays: list[int],
        today: date,
        ends_on: date | None = None,
        interval: int = 1,
        horizon_days: int = DEFAULT_GENERATION_HORIZON_DAYS
) -> list[date]:
    if interval < 1:
        raise ValueError("Weekly recurrence interval must be at least one.")

    selected_weekdays = set(weekdays)

    if not selected_weekdays:
        raise ValueError("Weekly recurrence requires at least one weekday ..")

    if not selected_weekdays.issubset(range(1, 8)):
        raise ValueError(
            "Weekdays must be ISO weekday numbers from 1 to 7 .."
        )

    generation_start, generation_end = _generate_window(
        starts_on=starts_on,
        ends_on=ends_on,
        today=today,
        horizon_days=horizon_days
    )

    if generation_start > generation_end:
        return []

    start_week = (
        starts_on
        - timedelta(days=starts_on.weekday())
    )

    occurrences: list[date] = []
    candidate = generation_start

    while candidate <= generation_end:
        if candidate.isoweekday() in selected_weekdays:
            candidate_week = (
                candidate
                - timedelta(days=candidate.weekday())
            )

            diff = (candidate_week - start_week).days
            week_index = diff // 7

            matches_interval = week_index % interval == 0

            if matches_interval:
                occurrences.append(candidate)

        candidate += timedelta(days=1)

    return occurrences


def calculate_monthly_occurrences(
        *,
        starts_on: date,
        today: date,
        month_days: list[int],
        ends_on: date | None = None,
        interval: int = 1,
        horizon_days: int = DEFAULT_GENERATION_HORIZON_DAYS
) -> list[date]:
    if interval < 1:
        raise ValueError("Monthly recurrence interval must be at least one.")

    selected_month_days = set(month_days)

    if not selected_month_days:
        raise ValueError(
            "Monthly recurrence requires at least one month day ..")

    if not selected_month_days.issubset(range(1, 32)):
        raise ValueError(
            "Month days must be numbers from 1 to 31 .."
        )

    generation_start, generation_end = _generate_window(
        starts_on=starts_on,
        ends_on=ends_on,
        today=today,
        horizon_days=horizon_days
    )

    if generation_start > generation_end:
        return []

    occurrences: list[date] = []
    candidate = generation_start

    while candidate <= generation_end:
        months_since_start = (
            (candidate.year - starts_on.year) * 12
            + (candidate.month - starts_on.month)
        )

        if (
            candidate.day in selected_month_days
            and months_since_start % interval == 0
        ):
            occurrences.append(candidate)

        candidate += timedelta(days=1)

    return occurrences


def calculate_generation_bounds(
        schedule_record: ScheduleRecord,
        *,
        today: date | None = None,
        horizon_days: int = DEFAULT_GENERATION_HORIZON_DAYS
) -> list[date]:
    """Return occurrence dates for a persisted schedule."""
    if today is None:
        local_zone = ZoneInfo(schedule_record.timezone)
        today = datetime.now(local_zone).date()

    recurrence_kind = schedule_record.recurrence_kind
    starts_on = schedule_record.starts_on
    ends_on = schedule_record.ends_on
    interval = schedule_record.interval

    logger.info(
        "Calculating occurrences for %s schedule starting on %s.",
        recurrence_kind,
        starts_on
    )

    match recurrence_kind:
        case ScheduleKind.ONE_OFF:
            if starts_on < today:
                return []

            return [starts_on]

        case ScheduleKind.WEEKLY:
            if schedule_record.weekdays is None:
                raise ValueError(
                    "Weekly recurrence requires weekdays .."
                )

            return calculate_weekly_occurrences(
                starts_on=starts_on,
                weekdays=schedule_record.weekdays,
                ends_on=ends_on,
                interval=interval,
                today=today,
                horizon_days=horizon_days
            )

        case ScheduleKind.MONTHLY:
            if schedule_record.month_days is None:
                raise ValueError(
                    "Monthly recurrence requires month days .."
                )

            return calculate_monthly_occurrences(
                starts_on=starts_on,
                month_days=schedule_record.month_days,
                ends_on=ends_on,
                interval=interval,
                horizon_days=horizon_days,
                today=today
            )

        case _:
            raise ValueError(
                f"Unsupported schedule recurrence kind: "
                f"{recurrence_kind!r}."
            )


def generate_slots(
        *,
        timezone: str,
        occurrences: list[date],
        start_time: time,
        end_time: time,
        slot_duration: int,
        schedule_id: UUID,
        max_slots: int | None = None,
        allow_online_consultations: bool = False,
) -> list[SlotValues]:
    if start_time >= end_time:
        raise ValueError("Slot generation requires end_time after start_time.")

    if slot_duration < 5:
        raise ValueError("Slot duration must be at least five minutes.")

    if max_slots is not None and max_slots < 1:
        raise ValueError("Maximum slots must be at least one when provided.")

    local_zone = ZoneInfo(timezone)
    duration = timedelta(minutes=slot_duration)

    mode = (
        Mode.HYBRID
        if allow_online_consultations
        else Mode.IN_PERSON
    )

    all_slots: list[SlotValues] = []

    for candidate in sorted(set(occurrences)):
        local_start = datetime.combine(
            candidate,
            start_time,
            tzinfo=local_zone
        )

        local_end = datetime.combine(
            candidate,
            end_time,
            tzinfo=local_zone
        )

        slots_for_date: list[SlotValues] = []
        window = local_start

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
                "mode": mode,
                "duration": slot_duration
            })

            window += duration

        all_slots.extend(slots_for_date)

    return all_slots
