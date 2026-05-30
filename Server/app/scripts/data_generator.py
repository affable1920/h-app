import random
from typing import Optional
from uuid import UUID
from faker import Faker

from passlib.context import CryptContext
from datetime import date, datetime, time, timedelta

from app.schemas.enums import Status
from app.database.entry import get_db, engine
from app.constants import index as constants

from app.database.models import Clinic, Mode, Review,  Slot, Schedule, Doctor, Base, UUID

faker = Faker()


def get_chance(threshold: float = .5):
    return random.random() > threshold


class DataGenerator:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self):
        self.db = next(get_db())

    @staticmethod
    def get_date_from_weekday(weekday: int):
        """

        gets the weekday index, 0 - MON, 6 - SUN
        subtracts today's weekday from the recieved weekday

        days ahead tells us how far we are from the
        schedule's wkday. -ve: that wkday already passed this week

        then we add days_ahead to today's date to get the next possible
        date on the given weekday

        """
        today = datetime.now()
        days_ahead = weekday - today.weekday()

        if days_ahead <= 0:
            days_ahead += 7

        return today + timedelta(days_ahead)

        #

    @staticmethod
    def is_available_today(schedules: list[Schedule]) -> bool:
        today = date.today()
        now = datetime.now()

        for schedule in schedules:
            if today.weekday() in schedule.weekdays and now.time() <= schedule.end_time:
                return True

        return False

    #

    @staticmethod
    def get_next_available_date(schedules: list[Schedule]) -> Optional[date]:
        """Gets the next available schedule's date for the current doctor"""
        available_days: set[int] = set()

        for schedule in schedules:
            if not schedule.is_active:
                continue

            available_days.update(schedule.weekdays)

        today = date.today()

        for offset in range(7):
            check_date = today + timedelta(days=offset)

            if check_date.weekday() in available_days:
                return check_date

        return None

    def create_clinic(self) -> Clinic:
        """Generate a single clinic record."""
        contact = faker.phone_number()[:10]

        return Clinic(
            name=faker.company(),
            owner=faker.name(),
            pincode=random.choice([193201, 193202, 190001, 190002, 190010]),
            reviews=random.randint(1, 100),
            location=faker.street_address(),
            contact_numbers=[contact, faker.phone_number()[:10]],
            whatsapp=contact,
            facilities=[],
            specializations=[],
        )

    #

    def create_review(self) -> Review:
        return Review(
            rating=random.randint(1, 5),
            comment=faker.english_text(max_nb_chars=random.randint(15, 100))
        )

    def create_schedule(
        self, doctor: Doctor, clinic: Clinic, base_duration: int = 20
    ) -> Schedule:
        """Generate realistic schedules with multiple clinics possible on same weekday."""
        all_days = [0, 1, 2, 3, 4, 5, 6]
        wkdays = random.sample(all_days, k=random.randint(1, 2))
        is_morning = get_chance()

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
            hours_available=(
                (
                    datetime.combine(datetime.today(), end)
                    - datetime.combine(datetime.today(), start)
                ).total_seconds()
                // 3600
            ),
            base_slot_duration=base_duration,
        )

    #

    def create_doctor(self) -> Doctor:
        """Generate secondary doctor information."""

        return Doctor(
            name=faker.name(),
            reviews=random.randint(0, 100),
            credentials=random.choice(constants.CREDENTIALS),
            primary_specialization=random.choice(constants.SPECIALIZATIONS),
            fee=random.randint(100, 400),
            secondary_specializations=random.sample(
                constants.SPECIALIZATIONS, k=random.randint(0, 3)
            ),
            verified=get_chance(),
            consults_online=get_chance(.3),
            experience=random.randint(1, 35),
            status=random.choice(list(Status)),
            rating=round(random.uniform(1.5, 5.0), 2),
        )

    #

    def create_slots(
        self, schedule: Schedule, duration: int = 20
    ) -> list[Slot]:
        """
        Generate time slots that fall within a schedule's start and end time.

        Args:
            start (time): Start time of the schedule.
            end (time): End time of the schedule.
            duration (int, optional): Consultation duration in minutes. Defaults to 20.
            consults_online (bool, optional): Whether consultations are online for the
            mode attr - Defaults to False.

        Returns:
            list[Slot]: List of generated slots.
        """

        slots = []
        schedule_start = datetime.combine(
            datetime.today(), schedule.start_time)
        schedule_end = datetime.combine(datetime.today(), schedule.end_time)

        slot_window = schedule_start

        while slot_window <= schedule_end:
            slots.append(
                Slot(
                    duration=duration,
                    begin=slot_window.time(),
                    booked=get_chance(.75),
                    schedule_id=schedule.id,
                    mode=random.choice(list(Mode)),
                )
            )

            slot_window += timedelta(minutes=duration)
        return slots

    #

    def generate_doctors(self, count: int = 40) -> list[Doctor]:
        return [self.create_doctor() for _ in range(count)]

#

    def generate_schedules(self, doctor: Doctor):
        schedules = [self.create_schedule(doctor, clinic)
                     for clinic in doctor.clinics]

        for schedule in schedules:
            slots = self.create_slots(schedule=schedule)
            schedule.slots.extend(slots)

        doctor.schedules.extend(schedules)

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
        print("Preparing database seed ...")
        print("Creatinmg users ...")

        doctors = [generator.create_doctor() for _ in range(40)]

        print(f"\n\nGenerated {len(doctors)} doctors successfully!")

        generator.db.add_all(doctors)
        generator.db.commit()

        print(f"\n\n{len(doctors)} doctors added to db successfully!")

        print("Generating clinics ...")

        clinics = [generator.create_clinic() for _ in range(40)]

        print(f"\n\nGenerated {len(clinics)} clinics successfully!")

        generator.db.add_all(clinics)
        generator.db.commit()

        print(f"\n\n{len(clinics)} clinics added to db successfully!")

        print("Assigning clinics to doctors ...")
        generator.assign_clinics_to_drs(doctors, clinics)

        generator.db.commit()
        print("Successfully assigned clinics to drs!")

        print("Generating and assigning schedules with slots ...")
        for doctor in doctors:
            generator.generate_schedules(doctor)

        print("Successfully generated schedules!")
        print("Successfully assigned schedules to doctors!")

        generator.db.commit()

    except Exception as e:
        print(e)
        print(f"Error generating doctors: {e}")

        raise e


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_db())
