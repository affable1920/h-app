import json
import random

from app.constants import index as constants
from datetime import date, datetime, time, timedelta

from app.models.doctor_models.Doctor import Doctor
from app.models.doctor_models.Doctor import DrEssentials, DrSecondaries
from app.models.doctor_models.DoctorExtraTypes import Clinic, Slot, Schedule, Fee


class DataGenerator:
    def __init__(self):
        self.weekday_cache = set()

    def create_clinic(self) -> Clinic:
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
            "facilities": [],
            "rating": random.randint(1, 5),
            "reviews": random.randint(10, 100)
        }

        return Clinic(**clinic)

    def generate_clinics(self, single: bool = False) -> Clinic | list[Clinic]:
        """Generate one or multiple clinic records."""
        if single:
            return self.create_clinic()

        clinics = []
        for _ in range(2):
            clinics.append(self.create_clinic())

        return clinics

    def generate_fees(self, base_fee: int) -> Fee:
        """Generate consultation fees for in-person and online."""
        return Fee(**{
            "in_person": base_fee,
            "online": base_fee - 50,
        })

#

    def generate_slots(
        self, start: time, end: time, duration: int = 20, consults_online: bool = False
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

        while schedule_start <= schedule_end:
            slot_start = schedule_start
            slot_end = slot_start + timedelta(minutes=duration)

            # Check if the entire consultation fits within the available window
            if slot_end.time() <= end:
                slots.append(Slot(**{
                    "begin": slot_start.time(),
                    "duration": duration,
                    "booked": random.random() < 0.5,
                    "mode": "in_person" if not consults_online else random.choice(["in_person", "online"]),
                }))

            schedule_start += timedelta(minutes=duration)

        return slots

#

    def generate_schedules(
        self, base_duration: int = 20, consutls_online: bool = False
    ) -> list[Schedule]:
        """Generate realistic schedules with multiple clinics possible on same weekday."""
        schedules = []

        # Generate 2-4 schedule entries (allowing same weekday with different clinics)
        num_schedules = random.randint(2, 6)

        # cache: items with key = weekday, and val -> { count, is_morning }
        # max entries per weekday currently set to 2, morning and evening

        schedule_cache: dict[int, dict] = {}

        for _ in range(num_schedules):
            wkday = random.randint(0, 6)

            # one schedule -> one clinic,
            # possibe a dr has two schedules on a single day

            clinic = self.generate_clinics(single=True)

            # Randomly decide if this is a morning or afternoon slot
            is_morning = random.choice([True, False])

            if wkday in schedule_cache:
                cache = schedule_cache[wkday]

                if (cache.get("count") or 0) == 2:
                    num_schedules += 1

                    # continue to next iter if two schedules ve been set for a particular day
                    continue

                is_morning = False if cache.get("is_morning") == True else True

                cache["count"] += 1
                cache["is_morning"] = is_morning

            if is_morning:
                start = time(7, 30)
                end = time(11, 0)
            else:
                start = time(16, 0)
                end = time(20, 0)

            schedule = {
                "start": start,
                "end": end,
                "weekday": wkday,
                "dated": None,
                "clinic": clinic,
                "slots": self.generate_slots(start, end, base_duration, consutls_online),
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
            "name":  random.choice(constants.NAMES),
            "email": f"{random.choice(constants.NAMES).lower()}@medical.com",
            "credentials": random.choice(constants.CREDENTIALS),
            "primary_specialization": random.choice(constants.SPECIALIZATIONS),
        }

        # id auto-generated
        return DrEssentials(**essentials).model_dump()

    #

    def get_date_from_weekday(self, weekday: int):
        """

        gets the weekday index, 0 - MON, 6 - SUN
        subtracts today's weekday from the recieved weekday

        days ahead tells us how far we are from the 
        schedule's wkday. -ve: that wkday already passed this week

        then we add days_ahead to today's date to get the next possible
        date on the given weekday

        """
        today = datetime.now().date()

        days_ahead = weekday - today.weekday()

        if days_ahead <= 0:
            days_ahead += 7

        return today + timedelta(days_ahead)

        #

    def get_next_available_schedule(self, schedules: list[Schedule]):
        """ Gets the next available schedule's date for the current doctor """

        upcoming_schedule_dates: list[date] = []

        for schedule in schedules:
            wkday = schedule.weekday
            upcoming_schedule_dates.append(self.get_date_from_weekday(wkday))

        return sorted(upcoming_schedule_dates)[0]

    #

    def generate_secondaries(self) -> dict:
        """Generate secondary doctor information."""
        base_fee = random.randint(100, 400)

        fee = self.generate_fees(base_fee)
        consults_online = random.choice([True, False])

        if not consults_online:
            fee.online = None

        # doctor's per day average consultation duration
        base_consult_time = random.choice(
            constants.CONSULTATION_DURATION_OPTIONS)

        schedules = self.generate_schedules(
            base_consult_time, consults_online)
        next_available = self.get_next_available_schedule(schedules)

        currently_available = False

        return DrSecondaries(**{
            "fee": fee,
            "currently_available": currently_available,
            "secondary_specializations": random.sample(
                constants.SPECIALIZATIONS, k=random.randint(0, 3)
            ),
            "consults_online": consults_online,
            "reviews": random.randint(0, 100),
            "verified": random.random() < 0.7,
            "experience": random.randint(1, 35),
            "rating": round(random.uniform(1.5, 5.0), 2),
            "next_available": next_available,
            "last_updated": datetime.now(),
            "base_consult_time": base_consult_time,
            "base_fee": fee.in_person,
            "status": "available" if currently_available
            else random.choice(
                list(filter(lambda x: x != "available", constants.STATUSES))),
            "schedules": schedules,
            # "metadata": {
            #     "in_patient": random.choice([True, False]),
            #     "emergency_available": random.choice([True, False]),
            #     "home_visits": random.choice([True, False]),
            #     "accepts_insurance": random.choice([True, False]),
            # }
        }).model_dump()

    def generate_doctor(self) -> Doctor:
        """Generate a complete doctor record."""
        doctor = {**self.generate_essentials(), **self.generate_secondaries()}
        return Doctor(**doctor)


# Example usage

def main():
    try:
        def generate_doctors(count: int = 200) -> list[dict]:
            """Generate multiple doctor records."""
            doctors = [DataGenerator().generate_doctor().model_dump(
                mode="json") for _ in range(count)]
            return doctors

            # return {dr.id: dr.model_dump(mode='json') for dr in doctors}

        doctors = generate_doctors()

        with open("data/Doctors.json", "w") as f:
            json.dump(doctors, f, indent=2, default=str)

        # Print first doctor as JSON for visualization
        print(f"\n\nGenerated {len(doctors)} doctors successfully!")

    except Exception as e:
        print(e)
        print(f"Error generating doctors: {e}")


if __name__ == "__main__":
    main()
