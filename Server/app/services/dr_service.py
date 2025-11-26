import json
from pathlib import Path
from fastapi import HTTPException
from typing_extensions import Self

from app.models.Responses import SlotRecord
from app.models.doctor_models.Doctor import Doctor
from app.models.QueryParams import Sort, SortOrder, RouteFilters


class DoctorService():
    _instance = None
    _doctors: list[dict] = []
    _cache: dict[str, dict] = {}
    _cache_is_valid: bool = True
    _file_path = Path("data/Doctors.json")

    def __new__(cls) -> Self:
        """

        _doctors are instantiated only once when this class is called anywhere
        creating an instance and populating the doctors list

        else if an instance is already present, that ll be returned and thus resulting in a
        singleton based approach

        """

        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.load()

        return cls._instance

    def load(self):
        if not self._doctors:
            try:
                with open(self._file_path, "r") as f:
                    self._doctors = json.load(f)

            except FileNotFoundError:
                # create a bg task for auto file creation later
                print("File not found")

#

    def filter(self, doctors: list[dict], filters: RouteFilters) -> list[dict]:
        filtered = doctors[:]

        if filters.specialization:
            print("Spec recieved to filter for: ",
                  filters.specialization.lower())

            filtered = [doc for doc in filtered if Doctor(
                **doc).primary_specialization.lower() == filters.specialization.lower()]

        if filters.min_rating:
            print("filtering against doc min_rating: ", filters.min_rating)
            filtered = [doc for doc in filtered if doc.get(
                "rating", 0) >= filters.min_rating]

        if filters.currently_available:
            print("filtering for currently available doctors: ")
            filtered = [doc for doc in filtered if Doctor(
                **doc).currently_available]

        if filters.mode:
            print("filtering against the selected consultation mode: ", filters.mode)
            if filters.mode.lower() == "online":
                filtered = [doc for doc in filtered if doc.get(
                    "consults_online", False)]

            else:
                filtered = [doc for doc in filtered if not doc.get(
                    "consults_online", False)]

        print("number of docs after applying all filters: ", len(filtered))
        return filtered


#

    def get(self, sort: Sort, max: int = 5, page: int = 1, search_query: str | None = None, **kwargs):
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
        cache_key = "_".join(str(x)
                             for x in [page, max, *[x for x in [search_query, sort] if x]] if x)

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
                    doc for doc in doctors if search_query in doc["name"].lower()]

            start = (page - 1) * max
            end = start + max

            paginated_doctors = doctors[start: min(end, len(doctors))]
            total_count = len(doctors)

            has_more = end < total_count

            response = {"entities": paginated_doctors, "paginated_count": len(paginated_doctors),
                        "total_count": total_count, "has_more": has_more, "applied_filters": applied_filters}

            self._cache[cache_key] = response
            return response

        except Exception as e:
            raise HTTPException(500, f"Something went wrong, {str(e)}")

#

    def get_by_id(self, id: str) -> Doctor:
        try:
            rqstd_dr = next(
                (doc for doc in self._doctors if doc["id"] == id))
            return Doctor(**rqstd_dr)

        except Exception as e:
            print(e)
            raise HTTPException(404, "Doctor not found")


doctor_service = DoctorService()


class DoctorHelper():
    def __init__(self, id: str):
        self._dr: Doctor = doctor_service.get_by_id(id)


#

    def book(self, schedule_id: str, slot_id: str, **kwargs) -> SlotRecord | None:
        dr = self._dr

        rqstd_schedule = next(
            s for s in dr.schedules if s.id == schedule_id)

        if not rqstd_schedule:
            raise HTTPException(404, "Schedule not found !")

        if rqstd_schedule.is_recurring:
            slots = rqstd_schedule.slots
            target = next(slot for slot in slots if slot.id == slot_id)

            if not target:
                raise HTTPException(404, "Slot not found !")

            if target.booked:
                raise HTTPException(400, "Slot already booked !")

            slot_record: dict = kwargs.copy()
            slot_record.update(
                {"day": rqstd_schedule.weekday, "doctor_name": self._dr.name,
                 "dept": self._dr.primary_specialization, "metadata": {"target_slot": target}})

            target.booked = True
            return SlotRecord(**slot_record)
