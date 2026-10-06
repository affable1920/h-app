from uuid import UUID

from pydantic import ConfigDict, Field

from app.schemas.base import EntityResponse
from app.schemas.enums import ReviewableEntity


class ReviewResponse(EntityResponse):
    rating: float = Field(ge=0, le=5)
    comment: str | None = None
    entity: ReviewableEntity
    entity_id: UUID
    appointment_id: UUID | None = None
    patient_id: UUID

    model_config = ConfigDict(use_enum_values=True)
