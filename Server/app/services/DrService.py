import base64
import logging
from typing import Tuple

from sqlalchemy import Select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.inputs import DrCreate
from app.services.entities.main import EntityService
from app.schemas.enums import Status
from app.database.models import Clinic, Doctor, Schedule
from app.schemas.response_modifiers import DrRouteFilters
import app.middleware.auth_middleware as auth
from app.services.PatientService import PatientService

logger = logging.getLogger(__name__)


class DoctorService(EntityService[Doctor]):
    entity = Doctor

    #

    @classmethod
    def load_options(cls) -> list:
        return [
            selectinload(Doctor.reviews)
        ]

    #

    @classmethod
    def load_options_full(cls):
        # load schedules once and then use the loaded ones as branches
        schedules = selectinload(Doctor.schedules)

        return [
            selectinload(Doctor.reviews),
            schedules.selectinload(Schedule.slots),
            schedules.joinedload(Schedule.clinic).selectinload(Clinic.reviews)
        ]

    #

    @classmethod
    def filter(
        cls, stmt: Select[Tuple[Doctor]],
        filters: DrRouteFilters,
    ) -> Select[Tuple[Doctor]]:
        """
        (args): all filters to be used for doctors
        Return -> a query with only the doctors that meet the filter criteria.
        """
        if filters.specialization:
            stmt = stmt.where(
                Doctor.primary_specialization.ilike(
                    filters.specialization
                ))

        if filters.min_rating:
            stmt = stmt.where(
                # usabe because avg_rating is a hybrid property
                Doctor.avg_rating >= filters.min_rating
            )

        if filters.currently_available:
            stmt = stmt.where(Doctor.status == Status.AVAILABLE)

        if filters.consults_online:
            stmt = stmt.where(Doctor.consults_online == True)

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

        return stmt

    #

    @classmethod
    async def create(cls, session: AsyncSession, data: DrCreate) -> Doctor:
        if (
                await cls.email_exists(session, email=data.email)) \
                or await PatientService.email_exists(session, email=data.email):
            raise ValueError(
                "This email Id is already in use! Please try using a different one."
            )

        if await cls.get(session, "license_number", data.license_number):
            raise ValueError("License number already in use.")

        encoded = None

        if data.profile:
            try:
                img = await data.profile.read()
                encoded = base64.urlsafe_b64decode(img).decode("utf-8")
            except Exception as e:
                logger.debug(e)
                raise ValueError("Invalid image file.")

        created = Doctor(
            image=encoded,
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
            hash=auth.hash(data.password),
            phone=data.phone
        )

        session.add(created)
        await session.flush()
        await session.refresh(created)
        return created

    #

    @classmethod
    def get_available_wkdays(cls, doctor: Doctor) -> set[int]:
        all_wkdays = [s.weekdays for s in doctor.schedules]
        return set().union(*all_wkdays)

    #

    @classmethod
    def get_available_slots(cls, doctor: Doctor, max: int = 5):
        slots = [
            {
                "duration": slot.duration,
                "slot_datetime": slot.slot_datetime.strftime("%y-%m-%d %H:%m")
            }
            for schedule in doctor.schedules
            for slot in schedule.slots if not slot.is_booked
        ]

        return slots[min(len(slots), max)]
