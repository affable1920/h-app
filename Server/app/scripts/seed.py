import logging
import random


from app.database.entry import engine
from app.constants.seed_constants import *
from app.schemas.enums import *
from app.database.models import *
import app.scripts.seed_factories as factory


logger = logging.getLogger(__name__)


def seed_db():
    from app.database.entry import SessionLocal
    from sqlalchemy import insert

    logger.info("🚀 Commencing data pipeline dump ...")

    with SessionLocal() as session:
        try:
            # ==========================================
            # 1.  CLINICS PRODUCTION
            # ==========================================
            clinic_payloads = factory.generate_clinics()
            clinic_ids = (
                session.scalars(
                    insert(Clinic).returning(Clinic.id),
                    clinic_payloads
                ).all()
            )

            logger.info(f"generated {len(clinic_ids)} clinic records.")

            # ==========================================
            # 2.  DOCTORS PRODUCTION
            # ==========================================

            doctor_payloads = factory.generate_doctors()
            doctor_ids = (
                session.scalars(
                    insert(Doctor).returning(Doctor.id),
                    doctor_payloads
                ).all()
            )

            logger.info(f"generated {len(doctor_ids)} doctor records.")

            # ==========================================
            # 3. MANY-TO-MANY JUNCTION (Doctors <-> Clinics)
            # ==========================================

            junction_payloads = []
            doctor_clinics_map = {}

            for doc_id in doctor_ids:
                assigned_clinics = random.sample(
                    clinic_ids, k=random.randint(1, 3)
                )
                doctor_clinics_map[doc_id] = assigned_clinics

                for cl_id in assigned_clinics:
                    junction_payloads.append({
                        "doctor_id": doc_id,
                        "clinic_id": cl_id
                    })

            session.execute(insert(junction), junction_payloads)
            logger.info(
                f"linked {len(junction_payloads)} many-to-many doctor clinic combinations."
            )

            # ==========================================
            # 4. SCHEDULES PRODUCTION (Requires Doc + Clinic)
            # ==========================================
            schedule_payloads = []

            for doc_id, assigned_cl_ids in doctor_clinics_map.items():
                for cl_id in assigned_cl_ids:
                    schedule_payloads.append(
                        factory.create_schedule(doc_id, cl_id)
                    )

            schedule_rows = (
                session.scalars(
                    insert(Schedule).returning(Schedule),
                    schedule_payloads
                )
            ).all()

            logger.info(
                f"✅ Generated {len(schedule_rows)} schedule records."
            )

            # ==========================================
            # 4. SLOTS PRODUCTION (Requires Doc + Clinic)
            # ==========================================

            slot_payloads = []

            for schedule_record in schedule_rows:
                slot_payloads.extend(
                    factory.generate_slots(schedule=schedule_record)
                )

            if slot_payloads:
                session.execute(insert(Slot), slot_payloads)
                logger.info(
                    f"✅ Dispatched {len(slot_payloads)} time slots down pipeline."
                )

            # ==========================================
            # 6. PATIENTS GENERATION
            # ==========================================

            patient_payloads = factory.generate_patients()
            patient_ids = (
                session.scalars(
                    insert(Patient).returning(Patient.id),
                    patient_payloads
                ).all()
            )
            logger.info(
                f"✅ Dispatched {len(patient_ids)} patient record down pipeline."
            )

            # ==========================================
            # 6. REVIEWS GENERATION (Requires Doc + Patient cross reference)
            # ==========================================

            review_payloads = [
                factory.generate_reviews(
                    patient_id=str(random.choice(patient_ids)),
                    doctor_id=str(random.choice(doctor_ids))
                )
                for _ in range(random.randint(40, 100))
            ]

            session.execute(insert(Review), review_payloads)
            logger.info(
                f"✅ Dispatched {len(review_payloads)} reviews down pipeline."
            )

            session.commit()
            logger.info(
                "✨ Seeding operation safely deployed on target database connection!"
            )

        except Exception as e:
            logger.error(
                f"Database seeding failed. Aborting..."
            )
            logger.exception(e)
            raise


# =================================================================================================

if __name__ == "__main__":
    from app.core.config import settings

    logger.info(
        f"Running the database seeder script \
        {"inside a docker container" if settings.is_using_container == "1" else "locally"}"
    )

    seed_db()
