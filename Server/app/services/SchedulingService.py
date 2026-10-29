import logging
from typing import cast
from uuid import UUID

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.schemas.pagination import PaginationParams
from app.services.entities.QueryService import QueryService
from app.core.exceptions import (
    ConflictError,
    EntityNotFoundException,
    ScheduleHasAppointments,
)
from app.database.models import (
    Appointment,
    Clinic,
    Schedule,
    Slot,
    junction,
)
from app.domain import scheduling
from app.schemas.schedule import CreateSchedule

logger = logging.getLogger(__name__)


class ScheduleService:
    @classmethod
    async def get_schedules_for_doctor(
        cls,
        doctor_id: UUID,
        session: AsyncSession,
        pagination_params: PaginationParams | None = None
    ):
        return await QueryService.get_all(
            base_statement=(
                select(Schedule).where(
                    Schedule.doctor_id == doctor_id
                )
            ),
            session=session,
            ordering_clauses=[
                Schedule.is_active.desc(),
            ],
            pagination=pagination_params,
            loaders=[
                selectinload(Schedule.slots),
                joinedload(Schedule.clinic).selectinload(
                    Clinic.reviews
                )
            ]
        )

    @classmethod
    async def get_schedule_for_doctor(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession
    ) -> Schedule | None:
        return await QueryService.get_by_id(
            model=Schedule,
            entity_id=schedule_id,
            session=session,
            where_clauses=[
                Schedule.doctor_id == doctor_id
            ],
            loader_options=[
                selectinload(Schedule.slots)
            ]
        )

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

    @classmethod
    async def create_schedule(
            cls,
            doctor_id: UUID,
            session: AsyncSession,
            payload: CreateSchedule,
    ) -> Schedule:
        stmt = (
            select(Clinic)
            .join(
                junction,
                Clinic.id == junction.c.clinic_id
            )
            .where(
                junction.c.doctor_id == doctor_id,
                Clinic.id == payload.clinic_id,
            )
            .options(selectinload(Clinic.reviews))
        )

        clinic = await session.scalar(stmt)

        if clinic is None:
            raise ConflictError(
                message="The doctor has no associated relationship "
                "with the requested clinic .."
            )

        schedule = cls.build_schedule_record(
            payload=payload,
            doctor_id=doctor_id
        )

        schedule.clinic = clinic
        session.add(schedule)

        await session.flush()

        schedule_record = cast(
            scheduling.ScheduleRecord,
            schedule
        )

        occurrence_dates = scheduling.calculate_generation_bounds(
            schedule_record
        )

        slot_values = scheduling.generate_slots(
            occurrences=occurrence_dates,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            slot_duration=schedule.base_slot_duration,
            schedule_id=schedule.id,
            max_slots=schedule.max_slots,
            timezone=schedule.timezone,
            allow_online_consultations=(
                schedule.allow_online_consultations
            )
        )

        slots = [
            Slot(**values)
            for values in slot_values
        ]

        session.add_all(slots)
        return schedule

    @classmethod
    async def alter_schedule_activation(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession,
            val: bool
    ):
        schedule = await cls.get_schedule_for_doctor(
            session=session,
            schedule_id=schedule_id,
            doctor_id=doctor_id,
        )

        if schedule is None:
            raise EntityNotFoundException(
                entity_name="Schedule",
                identifier=schedule_id
            )

        if schedule.is_active == val:
            logger.info(
                "Schedule %s is already set to %s ..",
                schedule_id,
                val
            )

            return

        schedule.is_active = val

    @classmethod
    async def remove_schedule(
            cls,
            schedule_id: UUID,
            doctor_id: UUID,
            session: AsyncSession,
    ):
        schedule = await cls.get_schedule_for_doctor(
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
