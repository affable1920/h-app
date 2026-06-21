import logging
from app.database.models import Doctor
from app.schemas.for_tool_calls import DrMinimal
from app.schemas.enums import Gender
from app.schemas.response_modifiers import DrRouteFilters
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.DrService import DoctorService

logger = logging.getLogger(__name__)

"""
#TO IMPLEMENT TOOLS
Doctors:    find_doctors        
            get_doctor_profile  

Clinics:    find_clinics
            get_clinic_details

Appointments: book_appointment
              get_my_appointments
              cancel_appointment
"""


class DoctorToolAdapter:
    """
    The adapter/middleware class bridging the gap between user queries and the service layer utilities
    that get the work done on a user query.

    Each tool should be thought of as a capability, rather than a scenario.
    This distinctional thought pattern is what will save us from having to create a tool
    for every individual use case - which really makes it hard for the model to choose a tool
    given it now has a lot of choices, rather than a few.

    --
    A tool should represnt a capability like search, read, write, so instead of having tools like
    find_doctors_by_speciality, ___location, ___etc...,
    we can have a single tool find_doctors with optional parameters

    We are going to map tools to domain boundaries and operations on entities
    so, booking an appointment is a single operation, even though it can have multiple steps.

    This saves us from creating 50 tools, instead we only create 5.

    - Also worth mentioning:
    Too many tools = model confusion (has to pick between many similar options)
    Each tool definition costs tokens in every request

    example - the find_doctors method on our tool class:
    One function handles:

    "find me a cardiologist" → specialization="cardiology"
    "find an experienced surgeon" → specialization="surgery", experience=10
    "find a cheap doctor" → fee=500
    "find an available female doctor" → gender="female", currently_available=True
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    #

    @staticmethod
    def to_schema(dtr: Doctor, minimal: bool = True):
        return DrMinimal.model_validate(dtr)

    #

    async def find_drs_many(
            self,
            specialization: str | None = None,
            min_rating: float | None = None,
            experience: int | None = None,
            fee: int | None = None,
            gender: Gender | None = None,
            **kwargs
    ) -> list:
        filters = DrRouteFilters(
            specialization=specialization,
            min_rating=min_rating,
            experience=experience,
            fee=fee,
            gender=gender,
            **kwargs
        )

        _, entities = await DoctorService.get_all(
            session=self.session, pagination=None,
            filters=filters
        )

        return [self.to_schema(dtr=d) for d in entities]

    #

    async def get_drprofile_single(self, id: str | None = None, name: str | None = None):
        result = None

        if id:
            result = await DoctorService.get_by_id(
                session=self.session, id=id
            )

        if name:
            result = await DoctorService.get(
                session=self.session, identKey="name",
                identVal=name
            )

        if result is None:
            raise

        minimal = self.to_schema(dtr=result, minimal=False).model_dump()

        response = minimal
        response.update({
            "available_slots": DoctorService.get_available_slots(result),
            "available_weekdays": DoctorService.get_available_wkdays(result),
            "rating": DoctorService.get_rating(result)
        })

        return response
