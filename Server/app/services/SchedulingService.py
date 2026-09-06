import logging
from datetime import datetime, time, timedelta
from typing import Any

from pydantic import Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import exists, select

from app.schemas.enums import Mode
from app.schemas.inputs import CreateSchedule
from app.database.models import Appointment, Schedule, Slot
from app.core.exceptions import ScheduleHasAppointments, EntityNotFoundException

logger = logging.getLogger(__name__)


class ScheduleService:
    @staticmethod
    def get_datetime_from_wkday(wkday: int = Field(ge=0, le=7)) -> datetime:
        today = datetime.today()

        """
            Args:
            wkday: int (0 - 6)

            !! Initially, Assume that the wkday has not passed this week,
            
            - which means, days till the next wkday will be the wkday minus days gone by this week
            for example, wkday = 4 (Friday), today = 0 (Monday) -> 4 - 0 = 4 days till friday
    
            Given the assumption is false and the day has gone by this week, 
            
            - i,e days_behind is negative, we still get the next occurence 
            by subtracting the number weekdays gone after our wkday argument from total_days i,e 7
            for example, wkday = 4, today = 6 -> 4 - 6 + -2 (-2 implies the wkday has passed this week -
            plus 2 more days after that, so days till next occurence is -2 + 7 = 5) -> 5 days till next occ 
            """

        days_behind = wkday - today.isoweekday()

        if days_behind < 0:
            days_behind += 7

        return today + timedelta(days=days_behind)

    #

    @staticmethod
    def generate_slots(
        duration: int, dt: datetime,
        start_time: time, end_time: time,
        schedule_id: str,
        max_count: int | None = None, allow_online_mode: bool = False
    ):
        """
        This staticmethod is responsible for generating schedules for a single date.
        Will mostly be seen used in loops by functions calling it.

        [Args]
        duration - slot window
        dt: the date the slot is scheduled for
        start_time - the slot start time
        end_time - the slot end time
        max_count - Maximum slots to generate for the given date
        schedule_id - the id of the schedule these slots are a part of

        [Returns]
        list[dict]
        """

        slots = []
        window = dt.combine(dt, start_time)
        end = dt.combine(dt, end_time)

        while window.time() < end.time():
            if max_count and len(slots) >= max_count:
                logger.info(max_count)
                logger.info("Max slots count reached. Winding up...")
                break

            mode = Mode.HYBRID if allow_online_mode else Mode.IN_PERSON

            slot = {
                "is_booked": False,
                "duration": duration,
                "schedule_id": schedule_id,
                "slot_datetime": window,
                "mode": mode
            }

            slots.append(slot)
            window += timedelta(minutes=duration)

        return slots

    #

    async def get_schedule(
            self,
            schedule_id: str,
            doctor_id: str,
            session: AsyncSession
    ) -> Schedule | None:
        stmt = (
            select(Schedule).where(
                Schedule.id == schedule_id, Schedule.doctor_id == doctor_id
            )
        )
        return await session.scalar(stmt)

    #

    async def create_schedule(
            self,
            doctor_id: str,
            session: AsyncSession,
            payload: CreateSchedule,
    ) -> Schedule:
        schedule = Schedule(
            weekdays=payload.weekdays,
            is_active=payload.active,
            start_time=payload.start_time,
            end_time=payload.end_time,
            doctor_id=doctor_id,
            clinic_id="9d4a95d4-152a-448f-85b4-605b0d596ebf",
            base_slot_duration=payload.base_slot_duration,
        )
        session.add(schedule)
        await session.flush([schedule])
        await session.refresh(schedule)

        all_slots = []
        week_count = 4 if payload.repeat else 1

        for i in range(week_count):
            for wkd in payload.weekdays:
                dt = self.get_datetime_from_wkday(wkd)
                dt += timedelta(days=i*7)

                slots = self.generate_slots(
                    duration=payload.base_slot_duration,
                    dt=dt, start_time=payload.start_time,
                    end_time=payload.end_time,
                    max_count=payload.max_slots,
                    schedule_id=str(schedule.id)
                )
                all_slots.extend(slots)

        model_instances = [Slot(**slot) for slot in all_slots]
        session.add_all(model_instances)
        return schedule

    #

    async def edit(
            self,
            id: str,
            doctor_id: str,
            session: AsyncSession,
            field_name: str,
            val: Any
    ):
        schedule = await self.get_schedule(
            id,
            doctor_id,
            session
        )

        if schedule is None:
            raise EntityNotFoundException(
                entity_name="Schedule",
                identifier=id
            )

        setattr(schedule, field_name, val)
        await session.commit()
        await session.refresh(schedule, ["is_active"])

    #

    async def remove_schedule(
            self,
            schedule_id: str,
            doctor_id: str,
            session: AsyncSession,
            confirm: bool = False
    ):
        schedule = await self.get_schedule(
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


schedule_service = ScheduleService()
