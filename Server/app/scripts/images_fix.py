import io
import base64
import logging

from sqlalchemy import create_engine, inspect, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.database.models import Doctor
from PIL import Image, UnidentifiedImageError

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
            replaced = doctor.image.replace("-", "+").replace("_", "/")
            doctor.image = replaced

        await session.commit()


# ==========================================
# 3. CORE COMPRESSION UTILITY
# ==========================================
def compress(
        base64_string: str, quality: int,
        max_dimensions: tuple[int, int]
) -> tuple[str | None, float]:
    """
    Decodes, resizes, compresses, and re-encodes a Base64 image string.

    Returns:
        tuple: (new_base64_string, compression_savings_ratio)
    """

    if not base64_string:
        return None, 0.0

    # keep original character length of the img_string to calculate savings later
    original_character_count = len(base64_string)

    try:
        # Strip common data URI prefixes if present (e.g 'data:image/jpeg;base64',)
        if "," in base64_string:
            prefix = base64_string.split(",", 1)
        else:
            prefix = ""

        # Decode text string to raw bytes
        img_bytes = base64.b64decode(base64_string)

        # load byte stream into Pillow
        img = Image.open(io.BytesIO(img_bytes))

        # Downscale dimensions of image if it exceeds max boundaries while maintaining aspect ratio
        img.thumbnail(
            size=max_dimensions,
            resample=Image.Resampling.LANCZOS
        )

        # JPEG cannot handle alpha channels, convert RGBA or P to RGB
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resave into memory stream with high efficient compression
        out_buffer = io.BytesIO()
        img.save(
            fp=out_buffer,
            format="JPEG",
            quality=quality,
            optimize=True
        )

        compressed = out_buffer.getvalue()

        # Convert raw binary bytes back to a UTF-8 Base64 text string
        payload = base64.b64encode(compressed).decode("utf-8")

        # Re-attach URI prefix if it existed originally
        if prefix:
            payload = f"{prefix},{payload}"

        updated_character_count = len(payload)
        savings = 1.0 - (updated_character_count /
                         original_character_count)

        return payload, savings

    except (UnidentifiedImageError, ValueError, TypeError) as ex:
        logger.warning(
            f"Skipping record due to image parsing/decoding failure: {str(ex)}"
        )
        return None, -1.0


# ==========================================
# 4. ROBUST ROLLING MIGRATION RUNNER
# ==========================================


def run_migration():
    MAX_IMG_DIMENSION = (800, 800)
    # Max width/height maintaining aspect ratio
    JPEG_QUALITY = 75
    # compression ratio (1-100)

    engine = create_engine(url=settings.database_url)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    inspector = inspect(engine)

    if not inspector.has_table(Doctor.__tablename__):
        logger.error(
            f"Table Doctor not found in target database. Exiting..."
        )
        return

    stmt = select(Doctor.id, Doctor.image).where(Doctor.image.isnot(None))
    records = session.execute(stmt)

    for row_id, base64_data in records:
        logger.info(
            f"Compressing image of record #{row_id}"
        )
        if ((not base64_data) or (len(base64_data.strip()) == 0)):
            logger.info(
                f"No image data found. Skipping record #{row_id}"
            )
            continue

        new_payload, savings = compress(
            base64_string=base64_data,
            quality=JPEG_QUALITY,
            max_dimensions=MAX_IMG_DIMENSION
        )

        if new_payload and savings > 0:
            logger.info(
                f"New image generated with a total saving of {savings} characters for record #{row_id}"
                "Writing new record to the database table now ..."
            )

            session.execute(
                update(Doctor)
                .where(Doctor.id == row_id)
                .values(image=new_payload)
            )

            session.commit()


if __name__ == "__main__":
    logger.info("Running migration")
    run_migration()
