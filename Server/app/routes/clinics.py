from fastapi import APIRouter, Depends
import json
from pathlib import Path


router = APIRouter(prefix="/clinics", tags=["clinics"])


class ClinicService:
    file_path = "data/clinics.json"

    def __init__(self):
        self.clinics_cache: dict[str, dict] = {}
        self.clinics: dict[str, dict] = self.get_clinics()

    def get_clinics(self, cache_key: str | None = None):
        if cache_key and cache_key in self.clinics_cache:
            return self.clinics_cache[cache_key]

        if not Path(self.file_path).exists():
            with open(self.file_path, "w") as f:
                json.dump({}, f)
            return {}

        try:
            with open(self.file_path, "r") as f:
                return json.load(f)

        except FileNotFoundError:
            return {}


@router.get("")
async def get_clinics(clinic_service: ClinicService = Depends(ClinicService)):
    print(get_clinics)
    return clinic_service.get_clinics()


@router.get("/{clinic_id}")
async def get_clinic():
    return {"message": "Hello World"}
