from datetime import datetime
from statistics import mean
from typing import Annotated, Self

from fastapi import File, Form, UploadFile
from pydantic import Field, computed_field, model_validator

from app.schemas.base import EntityResponse, StrictRequest
from app.schemas.enums import Gender, Status
from app.schemas.review import ReviewResponse
from app.schemas.schedule import Schedule
from app.schemas.types import Email, LoginPassword, Password, Username


class DoctorLogin(StrictRequest):
    id: str | None = None
    email: Email | None = None
    password: LoginPassword

    @model_validator(mode="after")
    def validate_identity(self) -> Self:
        if (
            self.email is None and self.id is None
        ):
            raise ValueError(
                "An email or app-specific id is required."
            )

        return self


class DrCreate(StrictRequest):
    name: Annotated[Username, Form(...)]
    gender: Annotated[Gender, Form(...)]
    profile: Annotated[UploadFile | None, File(...)] = None
    degree: Annotated[str, Form(...)]
    medical_college: Annotated[str, Form(...)] = "NA"
    graduation_year: Annotated[int | None, Form(...)] = None
    license_number: Annotated[str, Form(...)]
    experience: Annotated[int | None, Form(...)] = None
    primary_specialization: Annotated[str, Form(...)]
    secondary_focus_areas: Annotated[list[str], Form(...)] = []
    bio: Annotated[str | None, Form(...)] = None
    email: Annotated[Email, Form(...)]
    password: Annotated[Password, Form(...)]
    phone: Annotated[str | None, Form(max_length=10)] = None


def get_dr_onboarding(
    name: Annotated[Username, Form(...)],
    gender: Annotated[Gender, Form(...)],
    degree: Annotated[str, Form(...)],
    license_number: Annotated[str, Form(...)],
    primary_specialization: Annotated[str, Form(...)],
    email: Annotated[Email, Form(...)],
    password: Annotated[Password, Form(...)],
    medical_college: Annotated[str, Form(...)] = "NA",
    graduation_year: Annotated[int | None, Form(...)] = None,
    experience: Annotated[int | None, Form(...)] = 0,
    secondary_focus_areas: Annotated[list[str], Form(...)] = [],
    bio: Annotated[str | None, Form(...)] = None,
    phone: Annotated[str | None, Form(...)] = None,
    profile: Annotated[UploadFile | None, File(...)] = None,
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
        password=password,
    )


class DoctorHttpMinimal(EntityResponse):
    name: str
    primary_specialization: str
    experience: int
    verified: bool = False
    status: Status | None = Status.UNKNOWN
    reviews: list[ReviewResponse] = Field(
        default_factory=list,
        exclude=True
    )

    image: str | None = Field(exclude=True)

    @computed_field
    @property
    def review_count(self) -> int:
        return len(self.reviews)

    @computed_field
    @property
    def rating(self) -> float:
        ratings = [review.rating for review in self.reviews]
        return round(mean(ratings), 2) if ratings else 0.0

    @computed_field
    @property
    def image_url(self) -> str | None:
        if self.image:
            return f"data:image/jpeg;base64,{self.image}"
        return None


class DoctorHttpFull(DoctorHttpMinimal):
    credentials: str
    gender: Gender
    consults_online: bool = False
    booking_enabled: bool = False
    secondary_focus_areas: list[str] = Field(default_factory=list)
    last_updated: datetime | None = None
    schedules: list[Schedule] = Field(default_factory=list)


class DrProfileResponse(DoctorHttpFull):
    college_studied: str | None = None
    graduation_year: int | None = None
    bio: str | None = None
    license_number: str
    email: Email
    email_verified: bool = False
