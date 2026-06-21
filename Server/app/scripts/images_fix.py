import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Doctor
logger = logging.getLogger(__name__)


async def fix_corrupt_imgs(session: AsyncSession):
    stmt = select(Doctor).where(Doctor.image.isnot(None))
    result = await session.scalars(stmt)

    doctors = result.all()
    logger.info(f"Iterating over {len(doctors)}")

    for doctor in doctors:
        logger.info(
            f"Current doctor in anylysis {doctor.name or doctor.name}")

        if doctor.image:
            doctor.image = None

        logger.info(doctor.image)

        await session.commit()
