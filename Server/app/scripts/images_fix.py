import base64

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Doctor
import logging
logger = logging.getLogger(__name__)


async def fix_corrupt_imgs(session: Session):
    result = session.execute(select(Doctor).where(
        Doctor.image.isnot(None)
    ))

    doctors = result.scalars().all()
    logger.info(f"Iterating over {len(doctors)}")

    for doctor in doctors:
        logger.info(
            f"Current doctor in anylysis {doctor.name or doctor.username}")

        if doctor.image:
            doctor.image = None

        logger.info(doctor.image)

        session.commit()


async def main():
    from app.database.entry import get_db

    session = next(get_db())
    await fix_corrupt_imgs(session=session)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
