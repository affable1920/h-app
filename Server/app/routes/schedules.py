from fastapi import APIRouter
from pydantic import BaseModel

from app.services.dr_service import doctor_service


router = APIRouter(prefix="/schedules", tags=["schedules"])


class Schedule(BaseModel):
    date: str
    slot: str
    clinic: str


day_map = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
}


@router.post("/{id}")
async def set_schedule(clinic_id: str, slot_id: str, wkday: str):
    try:
        curr_doctor = doctor_service.get_doctor_by_id
        if not curr_doctor:
            return "Doctor not found"

        # wkday = datetime.fromisoformat(sch.date).isoweekday()
        # wkday = day_map[wkday].strip()

        # rqstd_schedule = next((s for s in (
        #     curr_doctor.schedules or []) if s.weekday.lower().strip() == wkday), None)

        # if rqstd_schedule:
        #     rqstd_slot = next((slot for slot in (
        #         rqstd_schedule.slots or []) if sch.slot.begin == slot.begin), None)
        #     print(rqstd_slot)

    except Exception as e:
        print(e)
