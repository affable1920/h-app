from app.schemas.base import EntityResponse
from app.schemas.enums import Gender


class DrMinimal(EntityResponse):
    """
    A minimal dr object model to be sent to the client in the ai-model's response
    """

    name: str
    primary_specialization: str
    gender: Gender
    experience: int
