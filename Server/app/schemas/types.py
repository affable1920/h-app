from typing import Annotated
from pydantic import (
    BeforeValidator,
    EmailStr,
    StringConstraints
)


def normalize_email(
        value: object
) -> object:
    if isinstance(value, str):
        return value.strip().casefold()
    return value


Email = Annotated[
    EmailStr,
    BeforeValidator(normalize_email)
]

Username = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=4,
        max_length=50,
    )
]


Password = Annotated[
    str,
    StringConstraints(
        min_length=12,
        max_length=128
    )
]


# A login password type to support login for earlier accounts
LoginPassword = Annotated[
    str,
    StringConstraints(
        min_length=1,
        max_length=128
    )
]
