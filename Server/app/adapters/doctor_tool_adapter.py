import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EntityNotFoundException
from app.schemas.doctor import DoctorHttpFull
from app.database.models import Doctor
from app.schemas.for_tool_calls import DrMinimal
from app.schemas.enums import Gender
from app.schemas.pagination import DrRouteFilters
from app.services.DrService import DoctorService

logger = logging.getLogger(__name__)


class DoctorToolAdapter:
    @staticmethod
    def to_schema(
        doctor: Doctor,
        minimal: bool = True
    ):
        return (
            DrMinimal.model_validate(doctor)
            if minimal
            else DoctorHttpFull.model_validate(doctor)
        )

    async def find_doctors(
            self,
            session: AsyncSession,
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

        _, entities = await DoctorService.get_all_doctors(
            session=session,
            pagination_params=None,
            filter_params=filters
        )

        return [self.to_schema(doctor=d) for d in entities]

    #

    async def get_drprofile(
            self,
            session: AsyncSession,
            doctor_id: UUID | None = None,
            name: str | None = None
    ):
        if (
            name is None
            and doctor_id is None
        ):
            raise TypeError(
                "One of the doctor's id or name is required to fetch a doctor.."
            )

        result = await DoctorService.get(
            session=session,
            ident_key=(
                "name" if (
                    by_name := name is not None
                )
                else "id"
            ),
            ident_val=(
                name if by_name else doctor_id
            )
        )

        if result is None:
            raise EntityNotFoundException(
                "doctor"
            )

        minimal = (
            self.to_schema(
                doctor=result,
                minimal=False
            )
            .model_dump()
        )

        response = minimal
        response.update({
            "available_slots": (
                DoctorService.get_available_slots(
                    doctor=result
                )
            ),
            "available_weekdays": (
                DoctorService.get_doctor_availability(
                    doctor=result
                )
            ),
        })

        return response
