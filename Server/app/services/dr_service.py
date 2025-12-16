from abc import ABC, abstractmethod
from datetime import datetime
import json
from pathlib import Path
from fastapi import HTTPException
from typing_extensions import Self

from app.schemas.doctor import Doctor
from app.schemas.responses import SlotRecord
from app.schemas.query_params import DrQueryParams, SortOrder


class BaseService(ABC):
    @abstractmethod
    def paginate():
        pass

    @abstractmethod
    def filter():
        pass


class DoctorService:
    _instance = None
    _doctors: list[dict] = []
    _cache: dict[str, dict] = {}
    _file_path = Path("data/Doctors.json")

    def __new__(cls) -> Self:
        """

        Singleton pattern -
        a single doctor service class for the whole app.

        helps prevent loading doctor objects from storage every time the class is
        instantiated (as the class could be used in multiple modules accross the app).

        The same instance of the class is returned (if present) every time it's called
        On the first call, the doctor's are loaded into memory.

        Using the cache-is-valid flag helps make sure that python loads the data again after
        a necessary change and data must be re-loaded.

        """

        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.load()

        return cls._instance

    #

    def load(self):
        try:
            with open(self._file_path, "r") as f:
                self._doctors = json.load(f)

        except json.JSONDecodeError as e:
            print(e)
            raise HTTPException(500, "Error loading doctors from file storage")

        except FileNotFoundError as e:
            # create a bg task for auto file creation later
            print(e)
            raise HTTPException(500, "File not found error")

        except Exception as e:
            print(e)
            raise HTTPException(500, "Internal server error")

    #

    @staticmethod
    def __filter(doctors: list[dict], filters: DrQueryParams):
        filtered = doctors[:]
        applied_filters = []

        if filters.specialization:
            print("Spec recieved to filter for: ", filters.specialization.lower())
            applied_filters.append(filters.specialization)

            filtered = [
                doc
                for doc in filtered
                if Doctor(**doc).primary_specialization
                == filters.specialization.lower()
            ]

        if filters.min_rating:
            print("filtering against doc min_rating: ", filters.min_rating)
            applied_filters.append(filters.min_rating)

            filtered = [
                doc for doc in filtered if doc.get("rating", 0) >= filters.min_rating
            ]

        if filters.currently_available:
            print("filtering for currently available doctors: ")
            applied_filters.append(filters.currently_available)
            filtered = [doc for doc in filtered if Doctor(**doc).currently_available]

        if filters.mode:
            print("filtering against the selected consultation mode: ", filters.mode)
            applied_filters.append(filters.mode)

            if filters.mode.lower() == "online":
                filtered = [
                    doc for doc in filtered if doc.get("consults_online", False)
                ]

        print("number of docs after applying all filters: ", len(filtered))
        return filtered, applied_filters

    #

    @staticmethod
    def __paginate(doctors: list[dict], page: int, max: int):
        paginated = doctors[::]

        start = (page - 1) * max
        end = start + max

        has_more = len(doctors) > end
        return paginated[start : min(end, len(doctors))], has_more

    #

    def get(self, params: DrQueryParams):
        try:
            doctors = self._doctors[:]
            applied_filters = []

            if params.sort:
                prop, order = params.sort.by, params.sort.order

                doctors = sorted(doctors, key=lambda x: x.get(prop, "name"))
                doctors = doctors if order == SortOrder.ASC else doctors[::-1]

            if params:
                doctors, applied_filters = self.__filter(doctors, params)

            if params.search_query:
                sq = params.search_query
                doctors = [doc for doc in doctors if sq in doc["name"]]

            paginated_doctors, has_more = self.__paginate(
                doctors, params.page, params.max
            )
            total_count = len(self._doctors)

            response = {
                "entities": paginated_doctors,
                "paginated_count": len(paginated_doctors),
                "total_count": total_count,
                "has_more": has_more,
                "applied_filters": applied_filters,
            }

            return response

        except Exception as e:
            raise HTTPException(500, f"Something went wrong, {str(e)}")

    #

    def get_by_id(self, id: str) -> Doctor:
        dr = next((doc for doc in self._doctors if doc["id"] == id), None)

        if not dr:
            raise HTTPException(404, "Doctor not found !")

        return Doctor(**dr)

    #

    def update_doctor(self, dr: Doctor):
        try:
            with open(self._file_path, "w") as f:
                drs = [
                    dr.model_dump(mode="json") if doctor.get("id") == dr.id else doctor
                    for doctor in self._doctors
                ]

                json.dump(drs, f, indent=4)
                print("Doctor updated successfully!")

            self.load()

        except FileNotFoundError as e:
            print("Error updating the dr, doctors file not found", e)
            raise HTTPException(500, f"Something went wrong, {str(e)}")

        except json.JSONDecodeError as e:
            print("Error updating the dr, invalid json", e)
            raise HTTPException(500, f"Something went wrong, {str(e)}")

        except Exception as e:
            print("Error while updating doctor! ", e)
            raise HTTPException(500, f"Something went wrong, {str(e)}")


dr_service = DoctorService()


class DoctorHelper(Doctor):
    def __init__(self, id: str):
        self._dr: Doctor = dr_service.get_by_id(id)

    #

    async def book(
        self, schedule_id: str, slot_id: str, patient_name: str, patient_contact: str
    ) -> SlotRecord | None:
        if not self._dr:
            raise HTTPException(404, "Doctor not found !")

        dr = self._dr.model_copy(deep=True)

        rqstd_schedule = next((s for s in dr.schedules if s.id == schedule_id), None)

        if not rqstd_schedule:
            raise HTTPException(404, "Schedule not found !")

        if not rqstd_schedule.is_active:
            raise HTTPException(
                400,
                "The doctor has not started in-person consultations yet. Please check back later!",
            )

        slots = rqstd_schedule.slots
        rqstd_slot = next((slot for slot in slots if slot.id == slot_id))

        if not rqstd_slot:
            raise HTTPException(
                404,
                "The requested slot could not found. Please try with another one or check again!",
            )

        if rqstd_slot.booked:
            raise HTTPException(400, "The slot has already been booked!")

        updated_slot = rqstd_slot.model_copy(update={"booked": True})

        updated_slots = [updated_slot if slot.id == slot_id else slot for slot in slots]

        updated_schedule = rqstd_schedule.model_copy(update={"slots": updated_slots})

        updated_dr = dr.model_copy(
            update={
                "schedules": [
                    schedule if schedule.id != schedule_id else updated_schedule
                    for schedule in dr.schedules
                ]
            }
        )

        slot_record: SlotRecord = SlotRecord(
            **{
                "patient_name": patient_name,
                "patient_contact": patient_contact,
                "dept": self._dr.primary_specialization,
                "day": rqstd_schedule.weekday,
                "doctor_name": self._dr.name,
                "metadata": {"target_slot": updated_slot},
                "booked_at": datetime.now().isoformat(),
            }
        )

        dr_service.update_doctor(updated_dr)
        return slot_record
