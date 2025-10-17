import json
from typing import Self
from pathlib import Path

from fastapi import HTTPException
from app.models.doctor_models.DoctorExtraTypes import Clinic


class ClinicService:
    _instance = None
    _clinics: list[dict] = []
    _cache: dict[str, dict] = {}
    _cache_is_valid: bool = True

    _file_path = Path("data/clinics.json")

    def __new__(cls) -> Self:
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.load_clinics()

        return cls._instance

    def load_clinics(self):
        try:
            if not self._file_path.exists() or self._file_path.stat().st_size == 0:
                with open(self._file_path, "w") as f:
                    json.dump([], f)
                    return []

            with open(self._file_path, "r") as f:
                self._clinics = json.load(f)

        except FileNotFoundError as e:
            # create a bg task for auto file creation later
            print(e)
            return []

        except json.JSONDecodeError as e:
            print(e)
            return []

#
    def get_clinics(self):
        try:
            response = {"data": [Clinic(**clinic) for clinic in self._clinics], "total_count": len(
                self._clinics), "curr_count": len(self._clinics)}

            print(response)
            return response

        except Exception as e:
            print(e)


#

    def get_clinic_by_id(self, id: str) -> Clinic:
        try:
            curr_clinic = next(
                (clinic for clinic in self._clinics if clinic["id"] == id))
            return Clinic(**curr_clinic)

        except Exception as e:
            print(e)
            raise HTTPException(404, "Clinic not found")


service = ClinicService()
