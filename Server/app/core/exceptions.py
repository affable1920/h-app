from typing import Any, Mapping


class AppException(Exception):
    status_code: int = 500
    code: str = "application_error"
    message: str = "An application error occurred."

    def __init__(
            self,
            message: str | None = None,
            *,
            code: str | None = None,
            details: dict[str, Any] | None = None,
            headers: Mapping[str, str] | None = None,
            **context
    ) -> None:
        self.message = message or self.message
        self.code = code or self.code
        self.details = details or {}  # public, sent to the client
        self.context = context       # internal, logged only
        self.headers = headers

        super().__init__(self.message)


class EntityNotFoundException(AppException):
    code = "entity_not_found"
    status_code = 404

    def __init__(
            self,
            entity_name: str,
            **context
    ) -> None:
        super().__init__(
            f"The requested {entity_name.lower()} could not be found.",
            details={"name": entity_name},
            **context
        )


class ConflictError(AppException):
    code = "conflict_error"
    status_code = 409

    def __init__(
            self,
            message: str,
            **context
    ) -> None:
        super().__init__(
            message,
            **context,
        )


class AlreadyInUseException(ConflictError):
    code = "already_exists"

    def __init__(
            self,
            field: str,
            message: str | None = None,
            **context
    ) -> None:
        super().__init__(
            message=(
                f"{field.lower()} already exists."
                if message is None else message
            ),
            details={"field": field},
            **context
        )


class ScheduleHasAppointments(ConflictError):
    def __init__(
            self,
            **context
    ) -> None:
        super().__init__(
            "The requested action cannot proceed because the appointment "
            "has history.",
            code="schedule_has_appointments",
            **context
        )


class AuthenticationError(AppException):
    status_code = 401
    code = "authentication_error"


class AuthorizationError(AppException):
    status_code = 403
    code = "authorization_error"
