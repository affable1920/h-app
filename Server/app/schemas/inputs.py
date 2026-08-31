from datetime import datetime, time
from typing import Annotated, Literal, Self
from uuid import UUID

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from app.schemas.Base import Aliased, FromORM, IDSerialized, snake_to_camel


class PatientCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class PatientLogin(BaseModel):
    email: EmailStr
    password: str


class DoctorLogin(BaseModel):
    email: str | None = None
    password: str
    id: str | None = None

    @model_validator(mode="after")
    def validate_user(self) -> Self:
        if self.email is None and self.id is None:
            raise ValueError(
                "An email id or your app-specific id is required."
            )
        return self


class BookingRequestData(FromORM, Aliased):
    scheduled_date: Annotated[datetime, Field(alias="date")]
    doctor_id: IDSerialized
    slot_id: IDSerialized


class DrCreate(Aliased):
    name: Annotated[str, Form(...)]
    gender: Annotated[Literal["male", "female"], Form(...)]
    profile: Annotated[UploadFile | None, File(...)] = None

    degree: Annotated[str, Form(...)]
    medical_college: Annotated[str, Form(...)]
    graduation_year: Annotated[int, Form(...)]
    license_number: Annotated[str, Form(...)]
    experience: Annotated[int | None, Form(...)] = None

    primary_specialization: Annotated[str, Form(...)]
    secondary_focus_areas: Annotated[list[str] | str, Form(...)] = []
    bio: Annotated[str | None, Form(...)] = None

    email: Annotated[EmailStr, Form(...)]
    password: Annotated[str, Form(...)]
    phone: Annotated[str | None, Form(max_length=10)] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )


def get_dr_onboarding(
    name: Annotated[str, Form(...)],
    gender: Annotated[Literal["male", "female"], Form(...)],
    degree: Annotated[str, Form(...)],
    medical_college: Annotated[str, Form(...)],
    graduation_year: Annotated[int, Form(...)],
    license_number: Annotated[str, Form(...)],
    primary_specialization: Annotated[str, Form(...)],
    email: Annotated[EmailStr, Form(...)],
    password: Annotated[str, Form(...)],
    experience: Annotated[int | None, Form(...)] = 0,
    secondary_focus_areas: Annotated[list[str] | str, Form(...)] = [],
    bio: Annotated[str | None, Form(...)] = None,
    phone: Annotated[str | None, Form(...)] = None,
    profile: Annotated[UploadFile | None, File(...)] = None
) -> DrCreate:
    return DrCreate(
        name=name,
        profile=profile,
        gender=gender,
        degree=degree,
        graduation_year=graduation_year,
        medical_college=medical_college,
        license_number=license_number,
        experience=experience,
        primary_specialization=primary_specialization,
        secondary_focus_areas=secondary_focus_areas,
        bio=bio,
        email=email,
        phone=phone,
        password=password
    )


class CreateSchedule(FromORM, Aliased):
    orientation: Literal["week", "month"] = Field(
        alias="every"
    )
    weekdays: list[int] = Field(
        min_length=1,
        description=("Weekdays as integers representing the iso weekday format."
                     "Monday == 1, Sunday == 7")
    )
    start_time: time
    end_time: time
    location: str
    base_slot_duration: int
    max_slots: Annotated[int, Field(
        description=(
            "The maximum number of slots to generate per day/date of a schedule."
        ),
        gt=0,
    )] | Literal[False] = False
    repeat: bool = Field(
        alias="autoRepeat",
        default=True
    )
    active: bool = Field(
        alias="setActive",
        default=True
    )
    allow_online_consultations: bool | None = False
