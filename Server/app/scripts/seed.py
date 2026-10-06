import argparse
import logging
import random

from sqlalchemy import delete, insert
from sqlalchemy.orm import Session

from app.database.entry import SessionLocal
from app.database.models import (
    Base,
    Clinic,
    Doctor,
    Patient,
    Review,
    Schedule,
    Slot,
    junction,
)
from app.scripts import seed_factories as factory


logger = logging.getLogger(__name__)


def clear_application_data(
        session: Session
) -> None:
    """Delete application rows without dropping the schema (tables)"""
    for table in reversed(
        Base.metadata.sorted_tables
    ):
        session.execute(delete(table))


def seed_db(
        *,
        reset: bool = False
) -> None:
    with SessionLocal() as session:
        try:
            if reset:
                logger.warning(
                    "Removing existing application data before seeding."
                )

                clear_application_data(session)

            clinic_payloads = factory.generate_clinics()
            clinic_ids = (
                session.scalars(
                    insert(Clinic).returning(Clinic.id),
                    clinic_payloads
                ).all()
            )

            logger.info(f"generated {len(clinic_ids)} clinic records.")

            doctor_payloads = factory.generate_doctors()
            doctor_ids = (
                session.scalars(
                    insert(Doctor).returning(Doctor.id),
                    doctor_payloads
                ).all()
            )

            logger.info(f"generated {len(doctor_ids)} doctor records.")

            junction_payloads = []
            doctor_clinics_map = {}

            for doc_id in doctor_ids:
                assigned_clinics = random.sample(
                    clinic_ids,
                    k=random.randint(1, 3)
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

            schedule_payloads = []

            for doc_id, assigned_cl_ids in doctor_clinics_map.items():
                for cl_id in assigned_cl_ids:
                    schedule_payloads.append(
                        factory.create_schedule(
                            doctor_id=doc_id,
                            clinic_id=cl_id
                        )
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

            slot_payloads = []

            for schedule_record in schedule_rows:
                slot_payloads.extend(
                    factory.generate_slots_for_schedule(
                        schedule_record
                    )
                )

            if slot_payloads:
                session.execute(
                    insert(Slot),
                    slot_payloads
                )

                logger.info(
                    f"✅ Dispatched {len(slot_payloads)} time slots down pipeline."
                )

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

            review_payloads = [
                factory.generate_reviews(
                    patient_id=(
                        random.choice(
                            patient_ids
                        )
                    ),
                    doctor_id=(
                        random.choice(
                            doctor_ids
                        )
                    )
                )
                for _ in range(random.randint(40, 100))
            ]

            session.execute(
                insert(Review),
                review_payloads
            )

            logger.info(
                f"✅ Dispatched {len(review_payloads)} reviews down pipeline."
            )

            session.commit()

            logger.info(
                "✨ Seeding operation safely deployed on target database connection!"
            )

        except Exception:
            session.rollback()

            logger.exception(
                "Database seeding failed. Transaction rolled back."
            )

            raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed the application database."
    )

    parser.add_argument(
        "--reset",
        action="store_true",
        help=(
            "Delete existing application rows before inserting fresh seed data."
        )
    )

    arguments = parser.parse_args()
    seed_db(reset=arguments.reset)
