import base64
import logging
from typing import Sequence, Tuple
from uuid import UUID

from sqlalchemy.orm.strategy_options import _AbstractLoad
from sqlalchemy import Select, or_, select
from sqlalchemy.orm import (
    selectinload,
    InstrumentedAttribute
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert

from app.schemas.enums import ScheduleKind
from app.services.entities.QueryService import QueryService
from app.features.auth import security

from app.scripts.one_off import compress
from app.schemas.doctor import DrCreate
from app.services.entities.EntityService import EntityService

from app.core.exceptions import (
    AlreadyInUseException,
    EntityNotFoundException
)

from app.database.models import (
    Clinic,
    Doctor,
    Schedule,
    junction
)

from app.schemas.pagination import (
    DrRouteFilters,
    PaginationParams,
    SortOrder,
    SortParams
)

from app.services.PatientService import PatientService
from app.features.auth import security


logger = logging.getLogger(__name__)

SORT_COLUMNS_MAP = {
    "rating": "avg_rating",
    "reviews": "review_count"
}


class DoctorService(EntityService[Doctor]):
    entity = Doctor

    @classmethod
    def load_base_options(cls) -> list[_AbstractLoad]:
        return [
            selectinload(Doctor.reviews)
        ]

    @classmethod
    def load_all_options(cls) -> list[_AbstractLoad]:
        schedules = selectinload(Doctor.schedules)

        return [
            *cls.load_base_options(),
            schedules.selectinload(Schedule.slots),
            (
                schedules.joinedload(Schedule.clinic)
                .selectinload(Clinic.reviews)
            )
        ]

    @classmethod
    def filter(
        cls,
        stmt: Select[Tuple[Doctor]],
        filters: DrRouteFilters,
    ) -> Select[Tuple[Doctor]]:
        if filters.specialization:
            stmt = stmt.where(
                Doctor.primary_specialization.ilike(
                    filters.specialization
                ))

        if filters.min_rating:
            stmt = stmt.where(
                Doctor.avg_rating
                >= filters.min_rating
            )

        if filters.consults_online:
            stmt = stmt.where(
                Doctor.consults_online.is_(True)
            )

        if filters.gender:
            stmt = stmt.where(
                Doctor.gender == filters.gender
            )

        if filters.experience:
            stmt = stmt.where(
                Doctor.experience >= filters.experience
            )

        if filters.fee:
            stmt = stmt.where(
                Doctor.fee <= filters.fee
            )

        if filters.search_query:
            sq = filters.search_query
            stmt = stmt.where(
                or_(
                    Doctor.name.icontains(sq),
                    Doctor.primary_specialization.icontains(sq)
                )
            )

        if filters.verified:
            stmt = stmt.where(Doctor.verified.is_(True))

        return stmt

    @classmethod
    def constructor_ordering_clauses(
        cls, sort_params: SortParams
    ) -> list[InstrumentedAttribute]:
        clauses = [
            Doctor.name
        ]

        if sort_params.column is None:
            return clauses

        mapped_column = SORT_COLUMNS_MAP.get(
            sort_params.column,
            sort_params.column
        )

        column = getattr(Doctor, mapped_column, None)

        if column is not None:
            if sort_params.order == SortOrder.DESC:
                column = column.desc()

            clauses = [
                column,
                *clauses
            ]

            return clauses

        return clauses

    @classmethod
    async def get_all_doctors(
        cls,
        session: AsyncSession,
        filter_params: DrRouteFilters | None = None,
        pagination_params: PaginationParams | None = None,
        sort_params: SortParams | None = None,
    ) -> Tuple[int, Sequence[Doctor]]:
        stmt = select(Doctor)

        if filter_params is not None:
            stmt = cls.filter(stmt, filter_params)

        ordering_clauses = None

        if sort_params is not None:
            ordering_clauses = (
                cls.constructor_ordering_clauses(
                    sort_params
                )
            )

        return await QueryService.get_all(
            base_statement=stmt,
            session=session,
            pagination=pagination_params,
            loaders=cls.load_base_options(),
            ordering_clauses=ordering_clauses
        )  # type: ignore

    @classmethod
    async def get_doctor_by_id(
            cls,
            doctor_id: UUID,
            session: AsyncSession
    ):
        return await QueryService.get_by_id(
            model=Doctor,
            entity_id=doctor_id,
            session=session,
            loader_options=cls.load_all_options()
        )

    @classmethod
    async def create_doctor(
        cls,
        session: AsyncSession,
        data: DrCreate
    ) -> Doctor:
        if (
            await cls.email_exists(session, email=data.email)
            or await PatientService.email_exists(session, email=data.email)
        ):
            raise AlreadyInUseException("email")

        if await cls.get(
            session=session,
            ident_key="license_number",
            ident_val=data.license_number
        ):
            raise AlreadyInUseException("license")

        compressed = None

        if data.profile:
            logger.info(
                f"Compressing profile image for doctor {data.name} ..."
            )

            img = await data.profile.read()
            compressed, _ = compress(
                base64.b64encode(img).decode("utf-8")
            )

        hashed_pwd = security.hash_password_aio(pwd=data.password)

        created = Doctor(
            image=compressed,
            name=data.name,
            gender=data.gender,
            primary_specialization=data.primary_specialization,
            secondary_focus_areas=data.secondary_focus_areas,
            bio=data.bio,
            credentials=data.degree,
            experience=data.experience,
            license_number=data.license_number,
            graduation_year=data.graduation_year,
            college_studied=data.medical_college,
            email=data.email,
            hash=hashed_pwd,
            phone=data.phone
        )

        session.add(created)
        return created

    @staticmethod
    def get_doctor_availability(
        doctor: Doctor
    ):
        availability = [
            {
                (key_name := (
                    "weekdays" if (
                        schedule.recurrence_kind
                        == ScheduleKind.WEEKLY
                    )
                    else "month_days" if (
                        schedule.recurrence_kind
                        == ScheduleKind.MONTHLY
                    )
                    else "date"
                )): getattr(schedule, key_name)
            }
            for schedule in doctor.schedules
        ]

        return availability

    @staticmethod
    def get_available_slots(
        doctor: Doctor,
        max: int = 5
    ):
        slots = [
            {
                "duration": slot.duration,
                "slot_datetime": (
                    slot.slot_datetime.strftime(
                        "%y-%m-%d %H:%M"
                    )
                )
            }
            for schedule in doctor.schedules
            for slot in schedule.slots
            if not slot.is_booked
        ]

        return slots[:min(len(slots), max)]

    @classmethod
    async def get_clinics_for_doctor(
        cls,
        doctor_id: UUID,
        session: AsyncSession,
        pagination_params: PaginationParams | None = None
    ):
        return await QueryService.get_all(
            base_statement=select(Clinic).join(Doctor.clinics),
            session=session,
            where_clauses=[Doctor.id == doctor_id],
            ordering_clauses=[Clinic.name, Clinic.id],
            loaders=[selectinload(Clinic.reviews)],
            pagination=pagination_params
        )

    @classmethod
    async def associate_clinic(
        cls,
        session: AsyncSession,
        doctor_id: UUID,
        clinic_id: UUID
    ) -> Clinic:
        clinic = await session.scalar(
            select(Clinic)
            .where(Clinic.id == clinic_id)
            .options(selectinload(Clinic.reviews))
        )

        if clinic is None:
            raise EntityNotFoundException(
                entity_name="clinic",
            )

        stmt = (
            insert(junction)
            .values(
                doctor_id=doctor_id,
                clinic_id=clinic_id
            )
            .on_conflict_do_nothing(
                index_elements=[
                    junction.c.doctor_id,
                    junction.c.clinic_id
                ]
            )
        )

        await session.execute(stmt)
        return clinic
