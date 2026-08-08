from app.schemas.Base import FromORM, IDMixin
from app.schemas.enums import Gender


class DrMinimal(FromORM, IDMixin):
    """
    A minimal dr object model to be sent to the client in the ai-model's response
    """

    name: str
    primary_specialization: str
    gender: Gender
    experience: int
