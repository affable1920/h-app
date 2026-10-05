from collections.abc import Mapping
from datetime import date
from typing import Annotated, Any, Literal, Protocol, Self

from pydantic import Field, model_validator

from app.schemas.Base import StrictRequest
from app.schemas.enums import ScheduleKind


Weekday = Annotated[int, Field(ge=1, le=7, strict=True)]
MonthDay = Annotated[int, Field(ge=1, le=31, strict=True)]


class OneOffRecurrence(StrictRequest):
    kind: Literal["one-off"]
    date: date


class RecurringRule(StrictRequest):
    starts_on: date
    ends_on: date | None = None
    interval: Annotated[
        int,
        Field(
            ge=1,
            strict=True,
            description=(
                "Distance between occurrences: 1 means every week/month, "
                "2 means every second week/month."
            ),
        ),
    ] = 1

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        if (
            self.ends_on is not None
            and self.ends_on < self.starts_on
        ):
            raise ValueError("End date cannot be before start date.")
        return self


class WeeklyRecurrence(RecurringRule):
    kind: Literal["weekly"]
    weekdays: list[Weekday] = Field(min_length=1, max_length=7)


class MonthlyRecurrence(RecurringRule):
    kind: Literal["monthly"]
    month_days: list[MonthDay] = Field(min_length=1, max_length=31)


Recurrence = Annotated[
    OneOffRecurrence | WeeklyRecurrence | MonthlyRecurrence,
    Field(discriminator="kind"),
]


class FlatRecurrenceSource(Protocol):
    """Attributes required to project a flat persistence record to the API."""

    recurrence_kind: ScheduleKind
    starts_on: date
    ends_on: date | None
    interval: int
    weekdays: list[int] | None
    month_days: list[int] | None


def _read(
        source: FlatRecurrenceSource | Mapping[str, Any],
        field: str
) -> Any:
    if isinstance(source, Mapping):
        return source[field]
    return getattr(source, field)


def recurrence_from_flat(
    source: FlatRecurrenceSource | Mapping[str, Any],
) -> Recurrence:
    """Build the nested API recurrence from flat ORM/database attributes."""

    raw_kind = _read(source, "recurrence_kind")
    kind = (
        raw_kind
        if isinstance(raw_kind, ScheduleKind)
        else ScheduleKind(raw_kind)
    )

    starts_on = _read(source, "starts_on")

    match kind:
        case ScheduleKind.ONE_OFF:
            return OneOffRecurrence(
                kind="one-off",
                date=starts_on
            )

        case ScheduleKind.WEEKLY:
            weekdays = _read(source, "weekdays")

            if not weekdays:
                raise ValueError(
                    "A weekly schedule must contain at least one weekday."
                )

            return WeeklyRecurrence(
                kind="weekly",
                starts_on=starts_on,
                ends_on=_read(source, "ends_on"),
                interval=_read(source, "interval"),
                weekdays=weekdays,
            )

        case ScheduleKind.MONTHLY:
            month_days = _read(source, "month_days")

            if not month_days:
                raise ValueError(
                    "A monthly schedule must contain at least one month day."
                )

            return MonthlyRecurrence(
                kind="monthly",
                starts_on=starts_on,
                ends_on=_read(source, "ends_on"),
                interval=_read(source, "interval"),
                month_days=month_days,
            )


def recurrence_to_flat(recurrence: Recurrence) -> dict[str, Any]:
    """Convert the public recurrence union into persistence attributes."""

    match recurrence:
        case OneOffRecurrence(date=occurrence_date):
            return {
                "recurrence_kind": ScheduleKind.ONE_OFF,
                "starts_on": occurrence_date,
                "ends_on": occurrence_date,
                "interval": 1,
                "weekdays": None,
                "month_days": None,
            }

        case WeeklyRecurrence() as weekly:
            return {
                "recurrence_kind": ScheduleKind.WEEKLY,
                "starts_on": weekly.starts_on,
                "ends_on": weekly.ends_on,
                "interval": weekly.interval,
                "weekdays": weekly.weekdays,
                "month_days": None,
            }

        case MonthlyRecurrence() as monthly:
            return {
                "recurrence_kind": ScheduleKind.MONTHLY,
                "starts_on": monthly.starts_on,
                "ends_on": monthly.ends_on,
                "interval": monthly.interval,
                "weekdays": None,
                "month_days": monthly.month_days,
            }


class RecurrenceProjection:
    """Attribute proxy that adds a computed recurrence to an ORM instance."""

    def __init__(self, source: FlatRecurrenceSource) -> None:
        self._source = source
        self.recurrence = recurrence_from_flat(source)

    def __getattr__(self, field: str) -> Any:
        return getattr(self._source, field)


def with_recurrence(value: Any) -> Any:
    """Inject recurrence before a response model reads ORM attributes."""

    if isinstance(value, Mapping):
        if "recurrence" in value:
            return value
        projected = dict(value)
        projected["recurrence"] = recurrence_from_flat(projected)
        return projected

    if hasattr(value, "recurrence"):
        return value

    return RecurrenceProjection(value)
