from pydantic import Field, computed_field

from app.schemas.base import EntityResponse
from app.schemas.review import ReviewResponse


class ClinicHttpMinimal(EntityResponse):
    name: str
    location: str
    reviews: list[ReviewResponse] = Field(
        default_factory=list,
        exclude=True
    )

    facilities: list[str] = Field(default_factory=list)

    @computed_field
    @property
    def rating(self) -> float:
        ratings = [review.rating for review in self.reviews]
        return round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    @computed_field
    @property
    def review_count(self) -> int:
        return len(self.reviews)


class ClinicHttpFull(ClinicHttpMinimal):
    owner: str | None = None
    pincode: str | None = None
    contacts: list[str] = Field(
        default_factory=list,
        validation_alias="contact_numbers",
    )


class DoctorClinicResponse(ClinicHttpMinimal):
    contacts: list[str] = Field(
        default_factory=list,
        validation_alias="contact_numbers",
    )
