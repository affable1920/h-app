from datetime import datetime
import json
from pathlib import Path
from fastapi import HTTPException
from typing_extensions import Self

from app.schemas.doctor import Doctor
from app.schemas.responses import SlotRecord
from app.schemas.query_params import Sort, SortOrder, RouteFilters


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

    def filter(self, doctors: list[dict], filters: RouteFilters) -> list[dict]:
        filtered = doctors[:]

        if filters.specialization:
            print("Spec recieved to filter for: ", filters.specialization.lower())

            filtered = [
                doc
                for doc in filtered
                if Doctor(**doc).primary_specialization.lower()
                == filters.specialization.lower()
            ]

        if filters.min_rating:
            print("filtering against doc min_rating: ", filters.min_rating)
            filtered = [
                doc for doc in filtered if doc.get("rating", 0) >= filters.min_rating
            ]

        if filters.currently_available:
            print("filtering for currently available doctors: ")
            filtered = [doc for doc in filtered if Doctor(**doc).currently_available]

        if filters.mode:
            print("filtering against the selected consultation mode: ", filters.mode)
            if filters.mode.lower() == "online":
                filtered = [
                    doc for doc in filtered if doc.get("consults_online", False)
                ]

            else:
                filtered = [
                    doc for doc in filtered if not doc.get("consults_online", False)
                ]

        print("number of docs after applying all filters: ", len(filtered))
        return filtered

    #

    def get(
        self,
        sort: Sort,
        max: int = 5,
        page: int = 1,
        search_query: str | None = None,
        **kwargs,
    ):
        """

        if any of the params are not provided, then they are set to None
        and thus are not included in the cache key so that the cache key
        is not affected by the missing params and the cache key remains the same for the same query

        *[x for x in rest if x]

        Moreover, the list comprehension for the rest list will return
        nothing if rest would turn out to be empty, or

        if any item is None, the if x also handles that case, leaving that out
        as well.

        All items returned from the outside comprehension would be joined
        together after ofcourse converting em to strings sperated by "_"

        """

        #
        cache_key = "_".join(
            str(x) for x in [page, max, *[x for x in [search_query, sort] if x]] if x
        )

        applied_filters: list[tuple[str, str]] = []

        try:
            # if cache_key in self._cache:
            #     print("Cache hit under this key: ", cache_key)
            #     return self._cache[cache_key]

            doctors = self._doctors[:]

            if sort:
                print("sorting the docs list: ", sort)
                prop, order = sort

                doctors = sorted(doctors, key=lambda x: x.get(prop, "name"))
                doctors = doctors if order == SortOrder.ASC else doctors[::-1]

            if kwargs:
                for k, v in kwargs.items():
                    if v:
                        applied_filters.append((k, v))

                print("recieved filters: ", kwargs)
                doctors = self.filter(doctors, RouteFilters(**kwargs))

            if search_query:
                doctors = [
                    doc
                    for doc in doctors
                    if search_query.lower() in doc["name"].lower()
                ]

            start = (page - 1) * max
            end = start + max

            paginated_doctors = doctors[start : min(end, len(doctors))]
            total_count = len(doctors)

            has_more = end < total_count

            response = {
                "entities": paginated_doctors,
                "paginated_count": len(paginated_doctors),
                "total_count": total_count,
                "has_more": has_more,
                "applied_filters": applied_filters,
            }

            self._cache[cache_key] = response
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

    def save_dr(self, dr: Doctor):
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

        dr_service.save_dr(updated_dr)

        return slot_record
