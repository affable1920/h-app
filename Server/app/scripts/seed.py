import logging
import random
from faker import Faker

from passlib.context import CryptContext
from datetime import datetime, time, timedelta

from pydantic import Field

from app.constants.seed_constants import *
from app.schemas.enums import Gender, ReviewableEntity, Status
from app.database.entry import engine

from app.database.models import Clinic, Mode, Patient, Review, Schedule, Doctor, Base, Slot, junction

faker = Faker()
logger = logging.getLogger(__name__)


class DataGenerator:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    @staticmethod
    def roll(chance: float = .5):
        return random.random() > chance

    #

    @staticmethod
    def generate_random_contact():
        return f"{random.choice(PHONE_PREFIXES)}{random.randint(100000, 999999)}"

    #

    @staticmethod
    def get_datetime_from_wkday(wkday: int = Field(gt=0, le=7)) -> datetime:
        today = datetime.today()

        """
        Args:
        wkday: int (0 - 6)
        This function get the datetime (upcoming) for a given wkday

        Initially, Assumes that the wkday has not passed this week,
        
        - which means, days till the next wkday will be the wkday minus days gone by this week
        for example, wkday = 4 (Friday), today = 0 (Monday) -> 4 - 0 = 4 days till friday

        Given the assumption is false and the day has gone by this week, 
        
        - i,e days_behind is negative, we still get the next occurence 
        by subtracting the number weekdays gone after our wkday argument from total_days i,e 7
        for example, wkday = 4, today = 6 -> 4 - 6 + -2 (-2 implies the wkday has passed this week -
        plus 2 more days after that, so days till next occurence is -2 + 7 = 5) -> 5 days till next occ 
        """

        days_behind = wkday - today.isoweekday()

        if days_behind < 0:
            days_behind += 7

        return today + timedelta(days=days_behind)

    #

    def _create_clinic(self):
        allotted = set()

        def create():
            """Generate a single clinic record."""
            cl_name = random.choice(CLINICS)
            logger.info(f"Clinic name -> {cl_name}")

            while cl_name in allotted:
                cl_name = faker.company()

            logger.info(f"new clinic name after check -> {cl_name}")

            allotted.add(cl_name)

            contact = self.generate_random_contact()
            loc = random.choice(list(PINCODES.keys()))

            return {
                "name": cl_name,
                "owner": faker.name(),
                "pincode": PINCODES[loc],
                "location": loc,
                "contact_numbers": [self.generate_random_contact()
                                    for _ in range(random.randint(1, 2))] + [contact],
                "whatsapp": contact,
                "facilities": random.sample(FACILITIES, k=random.randint(0, 12)),
                "specializations": random.sample(SPECIALIZATIONS, k=random.randint(1, 7)),
            }

        return create

    #

    def create_schedule(
        self, doctor_id: str, clinic_id: str, base_duration: int = 20
    ):
        """Generate realistic schedules."""
        all_days = [1, 2, 3, 4, 5, 6, 7]
        wkdays = random.sample(all_days, k=random.randint(1, 3))
        is_morning = self.roll()

        if is_morning:
            start = time(7, 30)
            end = time(11, 0)

        else:
            start = time(16, 0)
            end = time(20, 0)

        return {
            "start_time": start,
            "end_time": end,
            "weekdays": wkdays,
            "doctor_id": doctor_id,
            "clinic_id": clinic_id,
            "base_slot_duration": base_duration,
            "is_active": True
        }

    #

    def create_doctor(self):
        """Generate doctor information."""
        pwd = faker.password()
        name = faker.name()

        return {
            "name": name,
            "email": f"{name}{faker.email().split('@')[1]}",
            "hash": self.context.hash(pwd),
            "phone": self.generate_random_contact(),
            "experience": random.randint(1, 35),
            "verified": self.roll(),
            "primary_specialization": random.choice(SPECIALIZATIONS),
            "secondary_focus_areas": random.sample(
                SECONDARY_FOCUS_AREAS, k=random.randint(1, 3)
            ),
            "fee": random.randint(100, 400),
            "credentials": random.choice(CREDENTIALS),
            "consults_online": self.roll(.3),
            "status": random.choice(list(Status)),
            "gender": random.choice(list(Gender)),
            "college_studied": random.choice(MEDICAL_COLLEGES),
            "license_number": f"{random.choice(LICENSE_PREFIXES)}/{random.randint(1995, 2020)}/{random.randint(10000, 99999)}",
            "graduation_year": random.randint(1995, 2020),
            "bio": faker.text(max_nb_chars=random.randint(50, 200))
        }

    #

    def generate_slots(
        self, schedule_record: dict,
        duration: int = 20,
        max_slot_count: int | None = None,
        weeks: int = 4
    ):
        """
        Generate time slots that fall within a schedule's start and end time.

        Args:
            schedule: Schedule - which gives us:
                the weekdays the schedule occurs
                the time of the day the schedule starts and ends 

                - enables us to calculate slots - count and time

            duration: int - duration for each slot
            max_slots_count: int - the max number of slots to generate

        Returns:
            list[Slot]: List of generated slots
        """

        all_slots: list = []
        wkdays = schedule_record["weekdays"].copy()

        for i in range(weeks):
            # create a repeating slots collection for len(weeks) for a schedule
            chance = .7 if i == 0 else .2

            for wkday in wkdays:
                # create slots for each wkday for the schedule
                slots = []
                dt = self.get_datetime_from_wkday(wkday)

                if i != 0:
                    # offset the date by i weeks
                    dt += timedelta(days=i*7)

                schedule_start = datetime.combine(
                    dt.date(),
                    schedule_record["start_time"]
                )
                schedule_end = datetime.combine(
                    dt.date(), schedule_record["end_time"])

                window_start = schedule_start
                while window_start.time() < schedule_end.time():
                    if max_slot_count is not None and len(slots) >= max_slot_count:
                        break

                    created = {
                        "duration": duration,
                        "is_booked": self.roll(chance),
                        "mode": random.choice(list(Mode)),
                        "schedule_id": schedule_record["id"],
                        "slot_datetime": window_start
                    }
                    slots.append(created)
                    window_start += timedelta(minutes=duration)

                all_slots.extend(slots)
        return all_slots

    #

    def generate_patients(self, count: int = 40):
        return list(({
            "username": faker.user_name(),
            "email": faker.email(),
            "hash": self.context.hash(faker.password()),
            "appointments": []
        } for _ in range(count)))

    #

    @staticmethod
    def write_review(patient_id: str, doctor_id: str):
        return {
            "rating": random.randint(1, 5),
            "comment": random.choice(REVIEW_COMMENTS),
            "entity": ReviewableEntity.DOCTOR,
            "entity_id": doctor_id,
            "patient_id": patient_id,
        }

    #

    def generate_doctors(self, count: int = 40):
        return list((self.create_doctor() for _ in range(count)))

    #

    def generate_schedules(self, doctor_id: str, clinic_id: str):
        return list((self.create_schedule(doctor_id, clinic_id)))

    #

    def generate_clinics(self, count: int = 40):
        create = self._create_clinic()
        return list((create() for _ in range(count)))

    #

    @staticmethod
    def assign_clinics_to_drs(doctors: list[Doctor], clinics: list[Clinic]):
        """
        Create many-to-many relationships between doctors and clinics.
        Each doctor gets assigned to 1-3 random clinics.
        """

        for doctor in doctors:
            num_clinics = random.randint(1, 3)
            assigned_clinics = random.sample(clinics, num_clinics)
            doctor.clinics.extend(assigned_clinics)


def seed_db():
    logger.info(
        "Seeding tables for db soporefix... All tables will be resetted !"
    )

    # Clear schema using the imported engine
    Base.metadata.drop_all(bind=engine)

    from app.database.entry import SessionLocal
    from sqlalchemy import insert

    logger.info("Creating table schemas...")
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        try:
            logger.info("Generating seed data...")

            generator = DataGenerator()
            logger.info("🚀 Commencing data pipeline dump...")

            # ==========================================
            # 1.  CLINICS PRODUCTION
            # ==========================================
            clinic_payloads = generator.generate_clinics()
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

            doctor_payloads = generator.generate_doctors()
            doctor_ids = (
                session.scalars(
                    insert(Doctor).returning(Doctor.id), doctor_payloads
                ).all()
            )

            logger.info(f"generated {len(doctor_ids)} doctor records.")

            # ==========================================
            # 3. MANY-TO-MANY JUNCTION (Doctors <-> Clinics)
            # ==========================================

            # collect records for doctor clinic junction table
            junction_payloads = []

            # create a lookup map for assigned clinics to a doctor to create schedules below
            doctor_clinics_map = {}

            for doc_id in doctor_ids:
                # Assign 1 to 3 random clinics to a doctor
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
                # create a schedule for each assigned clinic to a doctor
                for cl_id in assigned_cl_ids:
                    schedule_payloads.append(
                        generator.create_schedule(doc_id, cl_id)
                    )

            schedule_rows = (
                session.execute(
                    insert(Schedule).returning(
                        Schedule.id,
                        Schedule.start_time,
                        Schedule.end_time,
                        Schedule.weekdays
                    ),
                    schedule_payloads
                ).mappings().all()
            )

            logger.info(f"✅ Generated {len(schedule_rows)} schedule records.")

            # ==========================================
            # 4. SLOTS PRODUCTION (Requires Doc + Clinic)
            # ==========================================

            slot_payloads = []
            for schedule_record in schedule_rows:
                slot_payloads.extend(
                    generator.generate_slots(
                        schedule_record=dict(schedule_record))
                )

            session.execute(insert(Slot), slot_payloads)
            logger.info(
                f"✅ Dispatched {len(slot_payloads)} time slots down pipeline."
            )

            # ==========================================
            # 6. PATIENTS GENERATION
            # ==========================================

            patient_payloads = generator.generate_patients()
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
                generator.write_review(
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
                f"Database seeding failed. Exiting with error {str(e)} ..."
            )
            logger.info("Resetting database completely for the next trial ...")
            Base.metadata.drop_all(bind=engine)
            raise e


# =================================================================================================
if __name__ == "__main__":
    from app.core.config import settings
    logger.info(
        f"Running the database seeder script \
        {"inside a docker container" if settings.is_using_container else ""}"
        f"for database connection against url '{settings.database_url}'"
    )
    logger.info("Running database seeding script ...")
    logger.info(
        "Running inside a docker container" if settings.is_using_container else ""
    )
    logger.info(
        f"for database connection against url: {settings.database_url_async}"
    )
    seed_db()
