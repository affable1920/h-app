from datetime import datetime
from math import ceil
from uuid import UUID
from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session, Query

from app.config import Mode
from app.database.entry import get_db
from app.database.models import Doctor as DBDoctor

from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.responses import PaginatedResponse, SlotRecord
from app.schemas.query_params import FilterParams, PaginationParams, SortOrder


class DoctorService:
    def __init__(self, db: Session):
        self.db = db
        self.InvalidPageError = HTTPException(
            404,
            detail={
                "msg": "Invalid page !",
                "desc": "The user is requesting a non-existing bigger page number.",
            },
        )

    @staticmethod
    def get_summaried(dr: DBDoctor) -> DoctorSummary:
        return DoctorSummary.model_validate(dr)

    @staticmethod
    def get_full_dr(dr: DBDoctor) -> Doctor:
        return Doctor.model_validate(dr, from_attributes=True)

    @staticmethod
    def __filter(
        query: Query[DBDoctor], filters: FilterParams = Depends()
    ) -> Query[DBDoctor]:
        """
        (args): all filters to be used for doctors

        Return -> a query with only the doctors that meet the filter criteria.

        This utility func only extracts fields from the query params that we use,
        (in this route), to filter doctors.

        So, this func has nothing to do with sorting and paginating.
        """

        if filters.specialization:
            query = query.filter(
                DBDoctor.primary_specialization == filters.specialization
            )

        if filters.min_rating:
            query = query.filter(DBDoctor.rating >= filters.min_rating)

        if filters.currently_available:
            query = query.filter(DBDoctor.currently_available)

        if filters.search_query:
            query = query.filter(DBDoctor.fullname.icontains(filters.search_query))

        if filters.mode == Mode.ONLINE:
            query = query.filter(DBDoctor.consults_online)

        return query

    #

    def get(self, pagination: PaginationParams, filters: FilterParams):
        query = self.db.query(DBDoctor)
        total_count = query.count()

        last_page = ceil(total_count / (pagination.max))

        if pagination.page > last_page:
            raise self.InvalidPageError

        try:
            query = self.__filter(query, filters)

            if pagination.sort_by:
                sort_column = getattr(DBDoctor, pagination.sort_by)
                order = pagination.sort_order

                if order == SortOrder.DESC:
                    sort_column = sort_column.desc()

                query = query.order_by(sort_column)

            query = query.offset(pagination.offset).limit(pagination.max)

        except Exception as e:
            print(e)
            raise HTTPException(500, f"Something went wrong, {str(e)}")

        doctors = [self.get_summaried(dr) for dr in query.all()]
        paginated_count = len(doctors)

        return PaginatedResponse(
            entities=doctors,
            total_count=total_count,
            has_prev=pagination.page != 1,
            paginated_count=paginated_count,
            has_next=pagination.page < ceil(total_count / pagination.max),
        )

    #

    def get_by_id(self, id: UUID) -> Doctor | None:
        rqstd_doctor = self.db.query(DBDoctor).where(DBDoctor.id == id).first()

        if not rqstd_doctor:
            raise HTTPException(
                404,
                detail={
                    "detail": {"id": id},
                    "msg": "Doctor not found !",
                    "desc": "No such doctor exists in our db",
                },
            )

        return self.get_full_dr(rqstd_doctor) if rqstd_doctor else None

    def update_doctor(self, id: UUID):
        pass


class DoctorHelper:
    def __init__(self, id: str, db: Session):
        self.db = db

    async def book(
        self,
        dr_id: UUID,
        schedule_id: str,
        slot_id: str,
        patient_name: str,
        patient_contact: str,
        db: Session = Depends(get_db),
    ) -> SlotRecord | None:
        dr_service = DoctorService(db)

        rqstd_doctor = dr_service.get_by_id(dr_id)

        if not rqstd_doctor:
            raise HTTPException(404, "Doctor not found !")

        dr = rqstd_doctor.model_copy(deep=True)
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

        slot_record: SlotRecord = SlotRecord(
            **{
                "patient_name": patient_name,
                "patient_contact": patient_contact,
                "dept": dr.primary_specialization,
                "doctor_name": dr.fullname,
                "metadata": {"target_slot": updated_slot},
                "booked_at": datetime.now().isoformat(),
            }
        )

        dr_service.update_doctor(id=dr_id)
        return slot_record
