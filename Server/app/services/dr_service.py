from datetime import datetime
from math import ceil
from uuid import UUID
from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session, Query
from sqlalchemy.exc import SQLAlchemyError

from app.config import Mode
from app.database.models import Appointment, Patient as DBPatient, Doctor as DBDoctor

from app.schemas.dr_extra import Clinic, Slot
from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.http import PaginatedResponse, Patient, AppointmentRecord
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

        self.DoctorNotFoundError = HTTPException(
            404,
            detail={
                "detail": {"id": id},
                "msg": "Doctor not found !",
                "desc": "No such doctor exists in our db",
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
        try:
            rqstd_doctor = self.db.query(DBDoctor).where(DBDoctor.id == id).first()
            return self.get_full_dr(rqstd_doctor) if rqstd_doctor else None

        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(
                500,
                {
                    "detail": e,
                    "desc": "DATABASE ERROR",
                    "msg": "Something went wrong, please try again later !",
                },
            )

    def book(
        self,
        id: UUID,
        date: datetime,
        clinic_id: UUID | None,
        schedule_id: UUID,
        slot_id: UUID,
        patient: dict,
    ):
        try:
            rqstd_doctor = self.db.query(DBDoctor).where(DBDoctor.id == id).first()

            if not rqstd_doctor:
                raise ValueError("Doctor not found !")

            target_schedule = next(
                (s for s in rqstd_doctor.schedules if s.id == schedule_id), None
            )

            if not target_schedule:
                raise ValueError("Schedule not found !")

            if not target_schedule.is_active:
                raise ValueError(
                    "The doctor has not started in-person consultations yet."
                )

            target_slot = next(
                (s for s in target_schedule.slots if s.id == slot_id), None
            )
            if not target_slot:
                raise ValueError(
                    "The requested slot could not found. Please try with another one or check again!"
                )

            if target_slot.booked:
                raise ValueError("Slot already booked !")

            db_patient = DBPatient(**patient)

            self.db.add(db_patient)
            self.db.flush()  # This generates the PatientID without committing

            print(f"creating appointment for patient {db_patient.id}")
            created_appointment = Appointment(
                date=date,
                doctor_id=id,
                slot_id=target_slot.id,
                patient_id=db_patient.id,
                schedule_id=target_schedule.id,
                clinic_id=clinic_id if clinic_id else target_schedule.clinic_id,
            )

            target_slot.booked = True
            self.db.add(created_appointment)
            self.db.commit()

            print(
                f"Appointment successfullt created and saved with id: {created_appointment.id}"
            )
            self.db.refresh(target_schedule)

            response = AppointmentRecord(
                patient=Patient.model_validate(patient),
                date=date,
                slot=Slot.model_validate(target_slot),
                doctor=self.get_full_dr(rqstd_doctor),
                clinic=Clinic.model_validate(target_schedule.clinic),
            )

            return response

        except ValueError as e:
            print(e)
            self.db.rollback()
            raise

        except SQLAlchemyError as e:
            print(e)
            self.db.rollback()
            raise HTTPException(
                500,
                {
                    "detail": e,
                    "desc": "DATABASE ERROR",
                    "msg": "An unexpected error occurred.",
                },
            )
