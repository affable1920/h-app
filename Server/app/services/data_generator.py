from app.models.doctorModel.Doctor import DrEssentials, DrSecondaries
from app.models.doctorModel.DoctorExtraTypes import Clinic, Slot, Schedule, Fee
from app.models.doctorModel.Doctor import Doctor
from app.constants import index as constants

from datetime import datetime, time, timedelta
from uuid import uuid4
import random
import json
from pathlib import Path


class DataGenerator:
    def __init__(self):
        self.weekday_cache = set()

    def generate_clinic(self) -> Clinic:
        """Generate a single clinic record."""
        lat = random.uniform(-90, 90)
        lng = random.uniform(-180, 180)

        clinic = {
            "name": random.choice(constants.HOSPITALS),
            "address": f"{random.randint(1, 999)} {random.choice(['Main', 'Oak', 'Elm', 'Park'])} Street, "
            f"{random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'])}",
            "contact": f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
            "whatsapp": f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
            "location": {"lat": round(lat, 4), "lng": round(lng, 4)},
            "parking_available": random.choice([True, False]),
        }

        return Clinic(**clinic)

    def generate_clinics(self, single: bool = False) -> Clinic | list[Clinic]:
        """Generate one or multiple clinic records."""
        if single:
            return self.generate_clinic()

        clinics = []
        for _ in range(2):
            clinics.append(self.generate_clinic())

        return clinics

    def generate_fees(self) -> Fee:
        """Generate consultation fees for in-person and online."""
        min_fee = constants.CONSULTATION_FEE_RANGE["MIN"]
        max_fee = constants.CONSULTATION_FEE_RANGE["MAX"]

        in_person_fee = random.randint(min_fee, max_fee)

        return Fee(**{
            "in_person": in_person_fee,
            "online": in_person_fee - 100,
        })

    def generate_slots(
        self, start: time, end: time, duration: int
    ) -> list[Slot]:
        """
        Generate time slots that fall within the schedule's start and end times.
        start - time the doctor starts consultations, end ...
        """
        slots = []
        current = datetime.combine(datetime.today(), start)
        end_dt = datetime.combine(datetime.today(), end)

        while current <= end_dt:
            slot_time = current.time()

            # Check if the entire consultation fits within the available window
            slot_end = datetime.combine(
                datetime.today(), slot_time) + timedelta(minutes=duration)
            if slot_end.time() <= end or slot_end.date() > datetime.today().date():
                slots.append(Slot(**{
                    "begin": slot_time.strftime("%H:%M"),
                    "duration": duration,
                    "mode": random.choice(["inPerson", "online"]),
                    "booked": random.random() < 0.5,
                }))

            current += timedelta(minutes=15)

        # Randomly select a subset of slots for variety
        if len(slots) > 6:
            slots = random.sample(slots, random.randint(3, min(6, len(slots))))

        return slots

    def generate_schedules(
        self, base_duration: int = 30
    ) -> list[Schedule]:
        """Generate realistic schedules with multiple clinics possible on same weekday."""
        schedules = []
        available_days = constants.DAYS_OF_WEEK.copy()

        # Generate 2-4 schedule entries (allowing same weekday with different clinics)
        num_schedules = random.randint(2, 4)

        for _ in range(num_schedules):
            weekday = random.choice(available_days)

            # Randomly decide if this is a morning or afternoon slot
            is_morning = random.choice([True, False])

            if is_morning:
                start = time(9, 0)
                end = time(13, 0)
            else:
                start = time(14, 0)
                end = time(18, 0)

            clinic = self.generate_clinics(single=True)

            schedule = {
                "start": start.strftime("%H:%M"),
                "end": end.strftime("%H:%M"),
                "weekday": weekday,
                "slots": self.generate_slots(start, end, base_duration),
                "clinic": clinic,
                "hours_available": (
                    (datetime.combine(datetime.today(), end) -
                     datetime.combine(datetime.today(), start)).seconds // 3600
                ),
            }
            schedules.append(Schedule(**schedule))

        return schedules

    def generate_essentials(self) -> dict:
        """Generate essential doctor information."""
        essentials = {
            "name": random.choice(constants.NAMES),
            "email": f"{random.choice(constants.NAMES).lower()}@medical.com",
            "credentials": random.choice(constants.CREDENTIALS),
            "primary_specialization": random.choice(constants.SPECIALIZATIONS),
        }

        return DrEssentials(**essentials).model_dump()

    def generate_secondaries(self) -> dict:
        """Generate secondary doctor information."""
        fee = self.generate_fees()
        current_date = datetime.now()
        base_consult_time = random.choice(
            constants.CONSULTATION_DURATION_OPTIONS)

        next_available = (current_date + timedelta(days=random.randint(1, 30))
                          ).strftime("%Y-%m-%d")

        return DrSecondaries(**{
            "fee": fee,
            "currently_available": random.choice([True, False]),
            "secondary_specializations": random.sample(
                constants.SPECIALIZATIONS, k=random.randint(0, 3)
            ),
            "consults_online": random.choice([True, False]),
            "reviews": random.randint(0, 420),
            "verified": random.random() < 0.7,
            "experience": random.randint(1, 35),
            "rating": round(random.uniform(1.5, 5.0), 2),
            "next_available": next_available,
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "base_consult_time": base_consult_time,
            "base_fee": fee.in_person,
            "status": random.choice(constants.STATUSES),
            "office": self.generate_clinics(single=True),
            "schedules": self.generate_schedules(base_consult_time),
        }).model_dump()

    def generate_doctor(self) -> Doctor:
        """Generate a complete doctor record."""
        doctor = {**self.generate_essentials(), **self.generate_secondaries()}
        return Doctor(**doctor)


def generate_doctors(count: int = 40) -> list[dict]:
    """Generate multiple doctor records."""
    return [DataGenerator().generate_doctor().model_dump() for _ in range(count)]


# Example usage
if __name__ == "__main__":
    try:
        doctors = generate_doctors()

        with open("data/Doctors.json", "w") as f:
            json.dump(doctors, f, indent=2)

        # Print first doctor as JSON for visualization

        print(json.dumps(doctors[0], indent=2, default=str))
        print(f"\n\nGenerated {len(doctors)} doctors successfully!")

    except Exception as e:
        print(e)
        print(f"Error generating doctors: {e}")
