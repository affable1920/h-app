import base64
import logging
from typing import Tuple

from sqlalchemy import Select, or_
from sqlalchemy.orm import Session

from app.schemas.inputs import DrCreate
from app.services.entities.main import EntityService
from app.schemas.internals_ import (
    Doctor as DrSchema,
)
from app.schemas.enums import Status
from app.database.models import Doctor
from app.schemas.internals import DrRouteFilters
import app.middleware.auth_middleware as auth
from app.services.PatientService import pt_srvc

logger = logging.getLogger(__name__)


class DoctorService(EntityService[Doctor]):
    def __init__(self):
        super().__init__(Doctor)

    #

    @staticmethod
    def to_schema(dr: Doctor):
        return DrSchema.model_validate(dr)

    #

    def filter(
        self, stmt: Select[Tuple[Doctor]], filters: DrRouteFilters
    ) -> Select[Tuple[Doctor]]:
        """
        (args): all filters to be used for doctors
        Return -> a query with only the doctors that meet the filter criteria.
        """
        if filters.specialization:
            stmt = stmt.where(
                Doctor.primary_specialization.icontains(
                    filters.specialization)
            )

        if filters.currently_available:
            stmt = stmt.where(Doctor.status == Status.AVAILABLE)

        if filters.consults_online:
            stmt = stmt.where(Doctor.consults_online == True)

        if filters.experience:
            stmt = stmt.where(
                Doctor.experience >= filters.experience
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

    def get_nxt_schedule(self, session: Session, name: str):
        return None

    #

    async def create(self, session: Session, data: DrCreate) -> Doctor:
        if self.get_by_email(session, data.email) or pt_srvc.get_by_email(session, data.email):
            raise ValueError(
                "Email already in use. Try a different one or signin."
            )

        if self.get(session, "license_number", data.license_number):
            raise ValueError("License number already in use.")

        encoded = None

        if data.profile:
            img = await data.profile.read()
            encoded = base64.urlsafe_b64decode(img).decode("utf-8")

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
        session.flush()
        session.refresh(created)
        return created


dr_srvc = DoctorService()
