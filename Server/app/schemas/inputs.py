from datetime import datetime
from typing import Annotated, Literal, Self
from uuid import UUID

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, EmailStr, Field, model_validator
from app.schemas.Base import FromORM


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


class DrCreate(BaseModel):
    name: Annotated[str, Form(...)]
    gender: Annotated[Literal["male", "female"], Form(...)]
    profile: Annotated[UploadFile | None, File(...)] = None

    degree: Annotated[str, Form(...)]
    medical_college: Annotated[str, Form(...)]
    graduation_year: Annotated[int, Form(...)]
    license_number: Annotated[str, Form(...)]
    experience: Annotated[int, Form(...)]

    primary_specialization: Annotated[str, Form(...)]
    secondary_focus_areas: Annotated[list[str] | str, Form(...)] = []
    bio: Annotated[str | None, Form(...)] = None

    email: Annotated[EmailStr, Form(...)]
    password: Annotated[str, Form(...)]
    phone: Annotated[str | None, Form(max_length=10)] = None

    model_config = {
        "arbitrary_types_allowed": True,
    }


class BookingRequestData(FromORM):
    scheduled_date: Annotated[datetime, Field(alias="date")]
    doctor_id: Annotated[UUID, Field(alias="doctorId")]
    slot_id: Annotated[UUID, Field(alias="slotId")]


def get_dr_onboarding(
    name: Annotated[str, Form(...)],
    gender: Annotated[Literal["male", "female"], Form(...)],
    degree: Annotated[str, Form(...)],
    medical_college: Annotated[str, Form(...)],
    graduation_year: Annotated[int, Form(...)],
    license_number: Annotated[str, Form(...)],
    primary_specialization: Annotated[str, Form(...)],
    experience: Annotated[int, Form(...)],
    email: Annotated[EmailStr, Form(...)],
    password: Annotated[str, Form(...)],
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
