import logging
import random
from faker import Faker

from passlib.context import CryptContext
from datetime import datetime, time, timedelta

from pydantic import Field

from app.constants.seed_constants import *
from app.schemas.enums import Gender, ReviewableEntity, Status
from app.database.entry import get_db, engine

from app.database.models import Clinic, Mode, Patient, Review,  Slot, Schedule, Doctor, Base

faker = Faker()
logger = logging.getLogger("seed")


def dice(chance: float = .5):
    return random.random() > chance


def gen_random_contact():
    return f"{random.choice(PHONE_PREFIXES)}{random.randint(100000, 999999)}"


class DataGenerator:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self):
        self.db = next(get_db())

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

    def create_clinic(self):
        """Generate a single clinic record."""

        allotted = set()

        def create():
            cl_name = random.choice(CLINICS)

            if cl_name in allotted:
                cl_name = faker.company()

            allotted.add(cl_name)

            contact = gen_random_contact()
            loc = random.choice(list(PINCODES.keys()))

            return Clinic(
                name=cl_name,
                owner=faker.name(),
                pincode=PINCODES[loc],
                location=loc,
                contact_numbers=[gen_random_contact()
                                 for _ in range(random.randint(1, 2))] + [contact],
                whatsapp=contact,
                facilities=random.sample(FACILITIES, k=random.randint(0, 12)),
                specializations=[],
            )

        return create

    #

    def create_schedule(
        self, doctor: Doctor, clinic: Clinic, base_duration: int = 20
    ) -> Schedule:
        """Generate realistic schedules with multiple clinics possible on same weekday."""
        all_days = [1, 2, 3, 4, 5, 6, 7]
        wkdays = random.sample(all_days, k=random.randint(1, 2))
        is_morning = dice()

        if is_morning:
            start = time(7, 30)
            end = time(11, 0)

        else:
            start = time(16, 0)
            end = time(20, 0)

        return Schedule(
            start_time=start,
            end_time=end,
            weekdays=wkdays,
            doctor_id=doctor.id,
            clinic_id=clinic.id,
            base_slot_duration=base_duration,
            is_active=True
        )

    #

    def create_doctor(self) -> Doctor:
        """Generate doctor information."""
        pwd = faker.password()
        name = faker.name()

        return Doctor(
            name=name,
            email=f"{name}{faker.email().split('@')[1]}",
            hash=self.context.hash(pwd),
            phone=gen_random_contact(),
            experience=random.randint(1, 35),
            verified=dice(),
            primary_specialization=random.choice(SPECIALIZATIONS),
            secondary_focus_areas=random.sample(
                SECONDARY_FOCUS_AREAS, k=random.randint(1, 3)
            ),
            fee=random.randint(100, 400),
            credentials=random.choice(CREDENTIALS),
            consults_online=dice(.3),
            status=random.choice(list(Status)),
            gender=random.choice(list(Gender)),
            college_studied=random.choice(MEDICAL_COLLEGES),
            license_number=f"{random.choice(LICENSE_PREFIXES)}/{random.randint(1995, 2020)}/{random.randint(10000, 99999)}",
            graduation_year=random.randint(1995, 2020),
            bio=faker.text(max_nb_chars=random.randint(50, 200)))

    #

    def create_slots(
        self, schedule: Schedule, duration: int = 20, max_slot_count: int | None = None
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

        all_slots: list[Slot] = []
        wkdays = schedule.weekdays.copy()

        for wkday in wkdays:
            slots = []
            dt = self.get_datetime_from_wkday(wkday)

            schedule_start = datetime.combine(dt.date(), schedule.start_time)
            schedule_end = datetime.combine(dt.date(), schedule.end_time)

            window_start = schedule_start

            while window_start.time() < schedule_end.time():
                if max_slot_count is not None and len(slots) >= max_slot_count:
                    break

                created = Slot(
                    duration=duration,
                    is_booked=dice(.25),
                    mode=random.choice(list(Mode)),
                    schedule_id=schedule.id,
                    slot_datetime=window_start
                )
                slots.append(created)
                window_start += timedelta(minutes=duration)

            all_slots.extend(slots)

        return all_slots

    #

    def create_patients(self, count: int = 40) -> list[Patient]:
        return [
            Patient(
                username=faker.user_name(),
                email=faker.email(),
                hash=self.context.hash(faker.password()),
                appointments=[]
            ) for _ in range(count)
        ]

    #

    def write_reviews(self, patients: list[Patient], doctors: list[Doctor]):
        reviews = [
            Review(
                rating=random.randint(1, 5),
                comment=random.choice(REVIEW_COMMENTS),
                entity=ReviewableEntity.DOCTOR,
                entity_id=str(random.choice(doctors).id),
                patient_id=str(random.choice(patients).id)
            ) for _ in range(random.randint(10, 50))
        ]
        return reviews

    #

    def generate_doctors(self, count: int = 40) -> list[Doctor]:
        return [self.create_doctor() for _ in range(count)]

    #

    def generate_schedules(self, doctor: Doctor):
        schedules = [
            self.create_schedule(doctor, clinic) for clinic in doctor.clinics
        ]

        return schedules

    #

    def assign_clinics_to_drs(self, doctors: list[Doctor], clinics: list[Clinic]):
        """
        Create many-to-many relationships between doctors and clinics.
        Each doctor gets assigned to 1-3 random clinics.
        """

        for doctor in doctors:
            num_clinics = random.randint(1, 3)
            assigned_clinics = random.sample(clinics, num_clinics)
            doctor.clinics.extend(assigned_clinics)


#


async def seed_db():
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        generator = DataGenerator()
        logger.info("Preparing database seed ...")
        logger.info("Creatinmg users ...")

        doctors = [generator.create_doctor() for _ in range(40)]

        logger.info(f"\n\nGenerated {len(doctors)} doctors successfully!")

        generator.db.add_all(doctors)
        generator.db.commit()

        logger.info(f"\n\n{len(doctors)} doctors added to db successfully!")

        logger.info("Generating clinics ...")
        gen_clinic = generator.create_clinic()

        clinics = [gen_clinic() for _ in range(40)]

        logger.info(f"\n\nGenerated {len(clinics)} clinics successfully!")

        generator.db.add_all(clinics)
        generator.db.commit()

        logger.info(f"\n\n{len(clinics)} clinics added to db successfully!")

        logger.info("Assigning clinics to doctors ...")
        generator.assign_clinics_to_drs(doctors, clinics)

        generator.db.commit()
        logger.info("Successfully assigned clinics to drs!")

        logger.info("Starting schedules generation for doctors ...")

        for doctor in doctors:
            logger.info(f"Generating schedules for Dr. {doctor.name} ...")
            schedules = generator.generate_schedules(doctor)

            logger.info(
                f"Generated {len(schedules)} schedules for Dr. {doctor.name} successfully!")
            generator.db.add_all(schedules)
            generator.db.commit()

            logger.info(
                f"Generating slots for schedules of Dr. {doctor.name} ...")
            for s in schedules:
                slots = generator.create_slots(s)
                generator.db.add_all(slots)
                generator.db.commit()

            logger.info(
                f"Successfully generated slots for doctor {doctor.name}")

        logger.info("Schedule and slot generation finished for all doctors!")

        patients = generator.create_patients()
        generator.db.add_all(patients)
        generator.db.commit()

        logger.info(
            f"\n\nGenerated and added {len(patients)} patients to db successfully!")

        reviews = generator.write_reviews(patients, doctors)
        generator.db.add_all(reviews)
        generator.db.commit()

    except Exception as e:
        logger.info(e)
        logger.info(f"Error generating doctors: {e}")

        raise e


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_db())
