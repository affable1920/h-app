import json
from pathlib import Path
from typing_extensions import Self


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
                # create a bg task for auto file creation
                print("File not found")


#

    def get_doctors(self, search_query: str, max: int = 5, page: int = 1):
        cache_key = f"{page}-{max}-{search_query}"
        print(cache_key)
        if cache_key in self._cache and self._cache_is_valid:
            print("Cache hit")
            return self._cache[cache_key]

        doctors = self._doctors

        if search_query:
            doctors = [
                doc for doc in doctors if search_query in doc["name"].lower()]

        start = (page - 1) * max
        end = start + max

        paginated_doctors = doctors[start: min(end, len(doctors))]
        result = {
            "doctors": paginated_doctors,
            "total_count": len(self._doctors),
            "curr_count": len(paginated_doctors),
        }

        self._cache[cache_key] = result
        return result

#

    def get_doctor_by_id(self, id: str):
        return next((doc for doc in self._doctors if doc["id"] == id), None)


doctor_service = DoctorService()
