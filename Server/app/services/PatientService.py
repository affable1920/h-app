from sqlalchemy import exists, literal, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad
from app.services.entities.main import EntityService
from app.database.models import Appointment, Patient
from app.schemas.inputs import PatientCreate
import app.middleware.auth_middleware as auth


class PatientService(EntityService[Patient]):
    entity = Patient

    @classmethod
    def load_options_full(cls) -> list[_AbstractLoad]:
        appointments = selectinload(Patient.appointments)
        return [
            appointments,
            appointments.joinedload(Appointment.clinic),
            appointments.joinedload(Appointment.doctor)
        ]

    #

    @classmethod
    async def get_by_email(cls, session: AsyncSession, email: str) -> Patient | None:
        stmt = select(Patient).where(Patient.email == email)
        stmt = stmt.options(*cls.load_options_full())
        return await session.scalar(stmt)

    #

    @classmethod
    async def create(cls, session: AsyncSession, data: PatientCreate) -> Patient:
        if await cls.email_exists(session, data.email):
            raise ValueError(
                "Email id already in use. Try a different one or sign in.")

        created = Patient(
            hash=auth.hash(data.password),
            email=data.email,
            username=data.username,
        )

        session.add(created)
        await session.flush([created])
        await session.refresh(created)
        return created
