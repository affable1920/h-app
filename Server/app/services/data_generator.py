import random
from typing import Optional
from uuid import UUID, uuid4
from faker import Faker

from passlib.context import CryptContext

from app.database.entry import get_db, engine
from app.constants import index as constants
from datetime import date, datetime, time, timedelta

from app.database.models import Clinic, Mode, Slot, Schedule, Doctor, Base

faker = Faker()


class DataGenerator:
    context = CryptContext(schemes=["argon2"], deprecated="auto")

    def __init__(self):
        self.db = get_db()

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
            if today.weekday() in schedule.weekdays and now.time() <= schedule.end:
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

            if not schedule.is_recurring:
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
        phone = faker.phone_number()[:10]
        name = faker.name()

        pwd = self.context.hash(str(uuid4()))

        return Clinic(
            head=f"{random.choice(constants.HOSPITALS)} City Hospital",
            mobile=phone,
            whatsapp=phone,
            reviews=random.randint(1, 100),
            rating=random.random(),
            facilities=[],
            specializations=[],
            password=pwd,
            owner_name=random.choice(constants.NAMES),
            username=f"{name}",
            pincode=random.choice([193201, 193202, 190001]),
            email=faker.email(),
            address=faker.street_address(),
        )

    #

    def create_schedule(
        self, doctor: Doctor, clinic: Clinic, base_duration: int = 20
    ) -> Schedule:
        """Generate realistic schedules with multiple clinics possible on same weekday."""
        wkdays = random.sample([0, 1, 2, 3, 4, 5, 6], k=random.randint(1, 4))
        is_morning = random.choice([True, False])

        if is_morning:
            start = time(7, 30)
            end = time(11, 0)

        else:
            start = time(16, 0)
            end = time(20, 0)

        return Schedule(
            start=start,
            end=end,
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

    #

    def create_doctor(self) -> Doctor:
        """Generate secondary doctor information."""
        fee = random.randint(150, 400)
        consults_online = random.choice([True, False])

        currently_available = False
        name = faker.name()
        pwd = self.context.hash(str(uuid4()))

        return Doctor(
            username=name,
            fullname=name,
            password=pwd,
            email=faker.email(),
            reviews=random.randint(0, 100),
            credentials=random.choice(constants.CREDENTIALS),
            primary_specialization=random.choice(constants.SPECIALIZATIONS),
            fee=fee,
            currently_available=currently_available,
            secondary_specializations=random.sample(
                constants.SPECIALIZATIONS, k=random.randint(0, 3)
            ),
            last_updated=datetime.now(),
            verified=random.random() < 0.7,
            consults_online=consults_online,
            experience=random.randint(1, 35),
            status=random.choice(constants.STATUSES),
            rating=round(random.uniform(1.5, 5.0), 2),
        )

    #
    def create_slots(
        self, start: time, end: time, schedule_id: UUID, duration: int = 20
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
        schedule_start = datetime.combine(datetime.today(), start)
        schedule_end = datetime.combine(datetime.today(), end)

        while (schedule_start + timedelta(minutes=duration)) <= schedule_end:
            slot_start = schedule_start

            slots.append(
                Slot(
                    duration=duration,
                    begin=slot_start.time(),
                    booked=random.random() > 0.5,
                    schedule_id=schedule_id,
                    mode=random.choice([Mode.IN_PERSON, Mode.ONLINE]),
                )
            )

            schedule_start += timedelta(minutes=duration)
        return slots

    #

    # Example usage
    def generate_doctors(self, count: int = 40) -> list[Doctor]:
        return [self.create_doctor() for _ in range(count)]

    def generate_clinics(self, count: int = 40):
        return [self.create_clinic() for _ in range(count)]

    def generate_schedules(self, doctor: Doctor, count: int = 40):
        schedules = [self.create_schedule(doctor, clinic) for clinic in doctor.clinics]

        for schedule in schedules:
            slots = self.create_slots(schedule.start, schedule.end, schedule.id)
            schedule.slots.extend(slots)

        doctor.schedules.extend(schedules)

    def assign_clinics_to_drs(self, doctors: list[Doctor], clinics: list[Clinic]):
        """
        Create many-to-many relationships between doctors and clinics.
        Each doctor gets assigned to 1-3 random clinics.
        """

        for doctor in doctors:
            num_clinics = random.randint(1, 3)
            assigned_clinics = random.sample(clinics, num_clinics)

            doctor.clinics.extend(assigned_clinics)

    def assign_schedules_to_drs(self, doctors: list[Doctor], schedules: list[Schedule]):
        """
        Create schedules for each doctor's clinic.
        Each schedule is assigned to a doctor and a clinic.
        """

        for doctor in doctors:
            num_schedules = random.randint(2, 4)
            assigned_schedules = random.sample(schedules, num_schedules)

            doctor.schedules.extend(assigned_schedules)


async def seed_db():
    try:
        Base.metadata.drop_all(bind=engine)
        db = next(get_db())

        generator = DataGenerator()

        Base.metadata.create_all(bind=engine)
        print("Preparing database seed ...")

        print("Generating doctors ...")
        doctors = generator.generate_doctors()

        print(f"\n\nGenerated {len(doctors)} doctors successfully!")

        db.add_all(doctors)
        db.commit()

        print(f"\n\n{len(doctors)} added to db doctors successfully!")

        print("Generating clinics ...")
        clinics = generator.generate_clinics()

        print(f"\n\nGenerated {len(clinics)} clinics successfully!")

        db.add_all(clinics)
        db.commit()

        print(f"\n\n{len(clinics)} clinics added to db successfully!")

        print("Assigning clinics to doctors ...")
        generator.assign_clinics_to_drs(doctors, clinics)

        db.commit()
        print("Successfully assigned clinics to drs!")

        print("Generating and assigning schedules with slots ...")
        for doctor in doctors:
            generator.generate_schedules(doctor)

        print("Successfully generated schedules!")
        print("Successfully assigned schedules to doctors!")

        db.commit()

    except Exception as e:
        print(e)
        print(f"Error generating doctors: {e}")

        raise e


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_db())
