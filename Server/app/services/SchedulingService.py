import logging
from datetime import date, datetime, timedelta
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import exists, select
from sqlalchemy.orm import selectinload

from app.domain import scheduling
from app.constants.seed_constants import MONTH_DAYS
from app.schemas.enums import Mode
from app.schemas.schedule import CreateSchedule
from app.database.models import Appointment, Clinic, Schedule, Slot, junction
from app.core.exceptions import ConflictError, ScheduleHasAppointments, EntityNotFoundException

logger = logging.getLogger(__name__)


class ScheduleService:
    @staticmethod
    def get_datetime_from_wkday(wkday: int) -> datetime:
        today = datetime.today()
        diff = wkday - today.isoweekday()

        if diff < 0:
            diff += 7

        return today + timedelta(days=diff)

    #

    @staticmethod
    def get_datetime_from_monthday(monthday: int) -> datetime:
        today = datetime.today()
        diff = monthday - today.day

        if diff < 0:
            diff += MONTH_DAYS[str(today.month)]

        return today + timedelta(days=diff)

    #

    @classmethod
    async def get_doctor_clinic(
        cls,
        doctor_id: UUID,
        clinic_id: UUID,
        session: AsyncSession
    ) -> Clinic | None:
        stmt = (
            select(Clinic)
            .join(junction, Clinic.id == junction.c.clinic_id)
            .where(
                junction.c.doctor_id == doctor_id,
                Clinic.id == clinic_id,
            )
            .options(selectinload(Clinic.reviews))
        )

        return await session.scalar(stmt)

    #

    @staticmethod
    def generate_slots(
        occurrences: list[date],
        schedule: Schedule,
    ):
        all_slots: list[Slot] = []

        for candidate in occurrences:
            slots_for_date: list[Slot] = []

            local_zone = ZoneInfo(schedule.timezone)

            local_start = datetime.combine(
                candidate,
                schedule.start_time,
                tzinfo=local_zone
            )

            local_end = datetime.combine(
                candidate,
                schedule.end_time,
                tzinfo=local_zone
            )

            window = local_start
            duration = timedelta(
                minutes=schedule.base_slot_duration
            )

            while window + duration <= local_end:
                if (
                    schedule.max_slots is not None
                    and len(slots_for_date) >= schedule.max_slots
                ):
                    break

                slots_for_date.append(
                    Slot(
                        slot_datetime=window,
                        schedule_id=schedule.id,
                        duration=schedule.base_slot_duration,
                        is_booked=False,
                        mode=(
                            Mode.HYBRID
                            if schedule.allow_online_consultations
                            else Mode.IN_PERSON
                        )
                    )
                )

                window += duration

            all_slots.extend(slots_for_date)

        return all_slots

    @classmethod
    async def get_schedule(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession
    ) -> Schedule | None:
        stmt = (
            select(Schedule).where(
                Schedule.id == schedule_id,
                Schedule.doctor_id == doctor_id
            )
        )
        return await session.scalar(stmt)

    #

    @staticmethod
    def build_schedule_record(
        payload: CreateSchedule,
        doctor_id: UUID,
    ) -> Schedule:
        common_fields = {
            "doctor_id": doctor_id,
            "clinic_id": payload.clinic_id,
            "timezone": payload.timezone,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "base_slot_duration": payload.base_slot_duration,
            "max_slots": payload.max_slots,
            "is_active": payload.is_active,
            "allow_online_consultations": payload.allow_online_consultations
        }

        return Schedule(**common_fields, **payload.persistence_fields())

    #

    @classmethod
    async def create_schedule(
            cls,
            doctor_id: UUID,
            session: AsyncSession,
            payload: CreateSchedule,
    ) -> Schedule:
        clinic = await cls.get_doctor_clinic(
            doctor_id=doctor_id,
            clinic_id=payload.clinic_id,
            session=session
        )

        if clinic is None:
            raise ConflictError(
                message="The doctor has no associated relationship with the requested clinic .."
            )

        schedule = cls.build_schedule_record(
            payload,
            doctor_id
        )

        schedule.clinic = clinic

        session.add(schedule)
        await session.flush()

        occurrence_dates = scheduling.calculate_generation_bounds(
            schedule_record=schedule
        )

        all_slots = scheduling.generate_slots(
            occurrences=occurrence_dates,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            slot_duration=schedule.base_slot_duration,
            schedule_id=schedule.id,
            max_slots=schedule.max_slots,
            allow_online_consultations=schedule.allow_online_consultations
        )

        schedule.slots = [Slot(**s) for s in all_slots]
        return schedule
    #

    @classmethod
    async def edit_schedule(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession,
            field_name: str,
            val: Any
    ):
        schedule = await cls.get_schedule(
            session=session,
            schedule_id=schedule_id,
            doctor_id=doctor_id,
        )

        if schedule is None:
            raise EntityNotFoundException(
                entity_name="Schedule",
                identifier=schedule_id
            )

        setattr(schedule, field_name, val)
        await session.commit()

    #

    @classmethod
    async def remove_schedule(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession,
            confirm: bool = False
    ):
        schedule = await cls.get_schedule(
            schedule_id=schedule_id,
            doctor_id=doctor_id,
            session=session
        )

        if schedule is None:
            raise EntityNotFoundException(
                entity_name="Schedule",
                identifier=schedule_id
            )

        has_any_history = await session.scalar(
            select(exists().where(
                Appointment.slot_id == Slot.id,
                Slot.schedule_id == schedule_id,
            ))
        )

        if has_any_history:
            raise ScheduleHasAppointments(
                identifier=schedule_id
            )

        await session.delete(schedule)
        await session.commit()
