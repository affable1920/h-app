from math import ceil
from typing import Any, Sequence
from uuid import UUID
from datetime import datetime
from certifi import where
from fastapi import Depends, HTTPException, status

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, Query
from sqlalchemy.exc import SQLAlchemyError

from app.shared.enums import Mode, Status
from app.database.models import Appointment, Doctor as DBDoctor, Schedule, Slot

from app.schemas.http import PaginatedResponse
from app.schemas.doctor import Doctor, DoctorSummary
from app.schemas.query_params import ALLOWED_SORT_COLS, FilterParams, PaginationParams, SortOrder


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
        self.session = db

    @staticmethod
    def get_DR_summary_model(dr: DBDoctor) -> DoctorSummary:
        return DoctorSummary.model_validate(dr)

    @staticmethod
    def get_DR_model(dr: DBDoctor) -> Doctor:
        return Doctor.model_validate(dr)

    @staticmethod
    def __filter(
        query: Select, filters: FilterParams = Depends()
    ) -> Select:
        """
        (args): all filters to be used for doctors

        Return -> a query with only the doctors that meet the filter criteria.

        This utility func only extracts fields from the query params that we use,
        (in this route), to filter doctors.

        So, this func has nothing to do with sorting and paginating.
        """
        resultant_query = query

        if filters.specialization:
            resultant_query = query.where(
                DBDoctor.primary_specialization == filters.specialization
            )

        if filters.min_rating:
            resultant_query = query.where(
                DBDoctor.rating >= filters.min_rating)

        if filters.currently_available:
            resultant_query = query.filter(DBDoctor.status == Status.AVAILABLE)

        if filters.search_query:
            resultant_query = query.where(
                DBDoctor.name.icontains(filters.search_query))

        if filters.mode == Mode.ONLINE:
            resultant_query = query.where(DBDoctor.consults_online)

        return resultant_query

    #

    def get_all(self, pagination: PaginationParams, filters: FilterParams):
        try:
            stmt = select(DBDoctor)
            stmt = self.__filter(stmt, filters)

            if pagination.sort_by:
                sort_column = getattr(DBDoctor, pagination.sort_by)

                if pagination.sort_order == SortOrder.DESC:
                    sort_column = sort_column.desc()

                stmt = stmt.order_by(sort_column)

            stmt = stmt.offset(pagination.offset).limit(pagination.max)
            result = self.session.execute(stmt).scalars().all()

            doctors = [self.get_DR_summary_model(dr) for dr in result]

            count = self.session.execute(
                select(func.count()).select_from(DBDoctor)).scalar()

            last_page = (count or 0) // pagination.max

            response = {
                "entities": doctors, "count": count, "has_prev": pagination.page != 1,
                "has_next": pagination.page < last_page
            }
            return response

        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "detail": str(e),
                    "type": "DATABASE ERROR",
                    "msg": "Something went wrong, please try again later !",
                },
            )

        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=500,
                detail={
                    "detail": str(e),
                    "type": "internal server error",
                    "msg": "an internal server error occurred.",
                },
            )

    #

    def get_by_id(self, id: UUID) -> Doctor | None:
        stmt = select(DBDoctor).where(DBDoctor.id == id)
        db_doctor = self.session.execute(stmt).scalar()

        if not db_doctor:
            raise ValueError("Doctor not found.")
        return self.get_DR_model(db_doctor)

    #

    def book(
        self,
        doctor_id: UUID,
        scheduled_date: datetime,
        slot_id: UUID,
        patient_id: UUID | None,
        guest_name: str | None,
        guest_contact: str | None,
    ):
        stmt = (select(Slot, Schedule)
                .join(Schedule, Slot.schedule_id == Schedule.id)
                .join(DBDoctor, Schedule.doctor_id == DBDoctor.id)
                .where(Slot.id == slot_id)
                .where(DBDoctor.id == doctor_id))

        result = self.session.execute(stmt).one_or_none()

        if result is None:
            raise ValueError("Slot not found.")

        slot, schedule = result.tuple()

        if slot.booked:
            raise ValueError("Slot already booked ..")

        if not schedule.is_active:
            raise ValueError("This scheduled is no longer active ..")

        if scheduled_date.weekday() not in schedule.weekdays:
            raise ValueError("Slot doesn't match schedule ..")

        slot.booked = True
        appointment = Appointment(
            slot_id=slot.id, scheduled_date=scheduled_date)

        if patient_id:
            appointment.patient_id = patient_id

        else:
            appointment.guest_name = guest_name
            appointment.guest_contact = guest_contact

        self.session.add(appointment)
        self.session.flush([appointment, slot, schedule])

        return appointment
