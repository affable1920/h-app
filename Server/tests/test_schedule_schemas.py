from datetime import date, time
from types import SimpleNamespace
from unittest import TestCase
from uuid import uuid4

from app.schemas.enums import ScheduleKind
from app.schemas.recurrence import recurrence_from_flat, recurrence_to_flat
from app.schemas.schedule import CreateSchedule, DoctorScheduleResponse


class RecurrenceSchemaTests(TestCase):
    def test_flat_recurrence_round_trips_for_every_kind(self) -> None:
        cases = [
            {
                "recurrence_kind": ScheduleKind.ONE_OFF,
                "starts_on": date(2026, 10, 3),
                "ends_on": date(2026, 10, 3),
                "interval": 1,
                "weekdays": None,
                "month_days": None,
            },
            {
                "recurrence_kind": ScheduleKind.WEEKLY,
                "starts_on": date(2026, 10, 3),
                "ends_on": None,
                "interval": 2,
                "weekdays": [1, 3, 5],
                "month_days": None,
            },
            {
                "recurrence_kind": ScheduleKind.MONTHLY,
                "starts_on": date(2026, 10, 3),
                "ends_on": None,
                "interval": 1,
                "weekdays": None,
                "month_days": [3, 15],
            },
        ]

        for flat in cases:
            with self.subTest(kind=flat["recurrence_kind"]):
                nested = recurrence_from_flat(flat)
                self.assertEqual(recurrence_to_flat(nested), flat)

    def test_create_request_exposes_flat_persistence_fields(self) -> None:
        payload = CreateSchedule.model_validate(
            {
                "clinicId": str(uuid4()),
                "startTime": "09:00",
                "endTime": "12:00",
                "baseSlotDuration": 20,
                "recurrence": {
                    "kind": "weekly",
                    "startsOn": "2026-10-03",
                    "weekdays": [1, 3, 5],
                },
            }
        )

        fields = payload.persistence_fields()
        self.assertEqual(fields["recurrence_kind"], ScheduleKind.WEEKLY)
        self.assertEqual(fields["weekdays"], [1, 3, 5])
        self.assertIsNone(fields["month_days"])

    def test_response_projects_nested_recurrence_from_orm_attributes(self) -> None:
        source = SimpleNamespace(
            id=uuid4(),
            timezone="Asia/Kolkata",
            start_time=time(9),
            end_time=time(12),
            base_slot_duration=20,
            max_slots=8,
            is_active=True,
            allow_online_consultations=False,
            recurrence_kind=ScheduleKind.MONTHLY,
            starts_on=date(2026, 10, 3),
            ends_on=None,
            interval=1,
            weekdays=None,
            month_days=[3, 15],
            clinic=SimpleNamespace(
                id=uuid4(),
                name="Test Clinic",
                location="Kolkata",
                facilities=[],
                reviews=[],
            ),
        )

        response = DoctorScheduleResponse.model_validate(source)
        dumped = response.model_dump(mode="json", by_alias=True)

        self.assertEqual(dumped["recurrence"]["kind"], "monthly")
        self.assertEqual(dumped["recurrence"]["monthDays"], [3, 15])
        self.assertNotIn("recurrenceKind", dumped)
