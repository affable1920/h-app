from math import ceil
from uuid import UUID
from datetime import datetime
from fastapi import Depends, HTTPException, status

from sqlalchemy.orm import Session, Query
from sqlalchemy.exc import SQLAlchemyError

from app.config import Mode
from app.database.models import Appointment, Doctor as DBDoctor, Schedule, Slot

from app.schemas.http import PaginatedResponse
from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.query_params import FilterParams, PaginationParams, SortOrder


class InvalidPageException(Exception):
    def __init__(self, msg: str, page_rqstd: int, max_page: int):
        super().__init__(msg)
        self.max_page = max_page
        self.page_rqstd = page_rqstd


class DoctorNotFoundException(Exception):
    def __init__(self, msg: str):
        super().__init__(status.HTTP_400_BAD_REQUEST, msg)


#


class DoctorService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def get_summaried(dr: DBDoctor) -> DoctorSummary:
        return DoctorSummary.model_validate(dr)

    @staticmethod
    def get_full_dr(dr: DBDoctor) -> Doctor:
        return Doctor.model_validate(dr)

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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "type": "invalid page request",
                    "msg": "invalid page reuested by the user.",
                    "details": {"max_page": last_page, "page_rqstd": pagination.page},
                },
            )

        try:
            query = self.__filter(query, filters)

            if pagination.sort_by:
                sort_column = getattr(DBDoctor, pagination.sort_by)
                order = pagination.sort_order

                if order == SortOrder.DESC:
                    sort_column = sort_column.desc()

                query = query.order_by(sort_column)

            query = query.offset(pagination.offset).limit(pagination.max)

            doctors = [self.get_summaried(dr) for dr in query.all()]
            paginated_count = len(doctors)

            return PaginatedResponse(
                entities=doctors,
                total_count=total_count,
                has_prev=pagination.page != 1,
                paginated_count=paginated_count,
                has_next=pagination.page < last_page,
            )

        except SQLAlchemyError as e:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                {
                    "detail": str(e),
                    "type": "DATABASE ERROR",
                    "msg": "Something went wrong, please try again later !",
                },
            )

        except Exception as e:
            print(e)
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                {
                    "detail": str(e),
                    "type": "internal server error",
                    "msg": "an internal server error occurred.",
                },
            )

    #

    def get_by_id(self, id: UUID) -> Doctor | None:
        try:
            rqstd_doctor = self.db.query(DBDoctor).where(DBDoctor.id == id).first()
            if not rqstd_doctor:
                raise DoctorNotFoundException("the requested doctor does not exist")

            return self.get_full_dr(rqstd_doctor)

        except SQLAlchemyError as e:
            print(e)
            raise HTTPException(
                500,
                {
                    "detail": str(e),
                    "type": "DATABASE ERROR",
                    "msg": "Something went wrong, please try again later !",
                },
            )

    #

    def book(
        self,
        id: UUID,
        date: datetime,
        slot_id: UUID,
        schedule_id: UUID,
        guest_name: str | None,
        clinic_id: UUID | None,
        patient_id: UUID | None,
        guest_contact: str | None,
    ):
        try:
            target_slot = (
                self.db.query(Slot)
                .join(Slot.schedule)
                .where(
                    Slot.id == slot_id,
                    Slot.schedule_id == schedule_id,
                    Schedule.doctor_id == id,
                    Schedule.clinic_id == clinic_id,
                )
                .with_for_update()
                .first()
            )

            if not target_slot:
                raise ValueError("No such slot exists for the doctor")

            if target_slot.booked:
                raise ValueError("Slot already booked !")

            target_slot.booked = True
            created_appointment: Appointment

            if patient_id:
                created_appointment = Appointment(
                    date=date,
                    doctor_id=id,
                    patient_id=patient_id,
                    slot_id=target_slot.id,
                    schedule_id=target_slot.schedule_id,
                    clinic_id=clinic_id
                    if clinic_id
                    else target_slot.schedule.clinic_id,
                )

            else:
                created_appointment = Appointment(
                    date=date,
                    doctor_id=id,
                    slot_id=target_slot.id,
                    guest_name=guest_name,
                    guest_contact=guest_contact,
                    schedule_id=target_slot.schedule_id,
                    clinic_id=clinic_id
                    if clinic_id
                    else target_slot.schedule.clinic_id,
                )

            self.db.add(created_appointment)
            target_slot.booked = True

            self.db.commit()
            self.db.refresh(target_slot)

            print(
                f"Appointment successfully created and saved with id: {created_appointment.id}"
            )

            return created_appointment

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
