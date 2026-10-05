from datetime import datetime
from typing import Annotated, Literal, Self
from uuid import UUID

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.Base import Aliased, FromORM
from app.schemas.types import Username, Password, Email, LoginPassword


class PatientCreate(BaseModel):
    email: Email
    password: Password
    username: Username


class PatientLogin(BaseModel):
    email: Email
    password: LoginPassword


class DoctorLogin(BaseModel):
    id: str | None = None
    email: Email | None = None
    password: LoginPassword

    @model_validator(mode="after")
    def validate_user(self) -> Self:
        if self.email is None and self.id is None:
            raise ValueError(
                "An email id or your app-specific id is required."
            )
        return self


class BookingRequestData(FromORM, Aliased):
    scheduled_date: Annotated[
        datetime,
        Field(alias="date")
    ]
    doctor_id: UUID
    slot_id: UUID
    reason_for_visit: Annotated[
        str | None,
        Field(
            max_length=1000
        )
    ] = None


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

    email: Annotated[Email, Form(...)]
    password: Annotated[str, Form(...)]
    phone: Annotated[str | None, Form(max_length=10)] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )


def get_dr_onboarding(
    name: Annotated[str, Form(...)],
    gender: Annotated[
        Literal["male", "female"], Form(...)
    ],
    degree: Annotated[str, Form(...)],
    medical_college: Annotated[str, Form(...)],
    graduation_year: Annotated[int, Form(...)],
    license_number: Annotated[str, Form(...)],
    primary_specialization: Annotated[
        str, Form(...)
    ],
    email: Annotated[Email, Form(...)],
    password: Annotated[str, Form(...)],
    experience: Annotated[
        int | None, Form(...)
    ] = 0,
    secondary_focus_areas: Annotated[
        list[str] | str, Form(...)
    ] = [],
    bio: Annotated[
        str | None, Form(...)
    ] = None,
    phone: Annotated[
        str | None, Form(...)
    ] = None,
    profile: Annotated[
        UploadFile | None, File(...)
    ] = None
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
