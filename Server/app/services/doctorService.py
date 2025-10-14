import json
from pathlib import Path
from typing_extensions import Self
from fastapi import Depends, HTTPException

from app.models.doctorModel.Doctor import Doctor
from app.models.QueryParams import QueryParameters, SortOrder, StatusOrder


class DoctorService:
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
            cls._instance.load_doctors()

        return cls._instance

    def load_doctors(self):
        if not self._doctors:
            try:
                with open(self._file_path, "r") as f:
                    self._doctors = json.load(f)

            except FileNotFoundError:
                # create a bg task for auto file creation later
                print("File not found")


#

    def get_doctors(self, kwargs: QueryParameters = Depends()):
        try:
            max, page, *rest = kwargs.model_dump(exclude_none=True).values()

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

            cache_key = "_".join(str(x)
                                 for x in [page, max, *[x for x in rest if x]] if x)

            if cache_key in self._cache and self._cache_is_valid:
                print("Cache hit under this key: ", cache_key)
                return self._cache[cache_key]

            doctors = self._doctors

            if kwargs.sort_by:
                prop, order = kwargs.sort_by

                doctors = sorted(doctors, key=lambda x: x.get(prop, "name"))
                doctors = doctors if order == SortOrder.ASC else doctors[::-1]

            if kwargs.search_query:
                doctors = [
                    doc for doc in doctors if kwargs.search_query in doc["name"].lower()]

            start = (page - 1) * max
            end = start + max

            paginated_doctors = doctors[start: min(end, len(doctors))]

            result = {
                "doctors": [Doctor(**doc) for doc in paginated_doctors],
                "total_count": len(self._doctors or []),
                "curr_count": len(paginated_doctors or []),
            }

            self._cache[cache_key] = result
            return result

        except Exception as e:
            print(e)

#

    def get_doctor_by_id(self, id: str) -> Doctor:
        try:
            curr_doctor = next(
                (doc for doc in self._doctors if doc["id"] == id))
            return Doctor(**curr_doctor)

        except Exception as e:
            print(e)
            raise HTTPException(404, "Doctor not found")


doctor_service = DoctorService()
