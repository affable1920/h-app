class AppException(Exception):
    code: str = "APPLICATION_ERROR"

    # http hint only - another layer like ws ignores this, thus optional as well
    status_code: int | None = None
    message: str = "An application error occurred."

    def __init__(
            self,
            message: str | None = None,
            **context
    ) -> None:
        super().__init__(self.message)
        self.message = message or self.message
        self.context = context

#


class EntityNotFoundException(AppException):
    code = "ENTITY_NOT_FOUND"
    status_code = 404

    def __init__(
            self,
            entity_name: str,
            **context
    ) -> None:
        self.message = (
            f"The requested {entity_name} could not be found."
        )
        super().__init__(self.message, **context)

#


class AlreadyInUseException(AppException):
    code = "ALREADY_EXISTS"
    status_code = 409

    def __init__(
            self,
            identifier: str,
            message: str | None = None,
            **context
    ) -> None:
        self.message = f"{identifier} already exists. Try a different one."
        super().__init__(message, **context)


#


class ScheduleHasAppointments(AppException):
    code = "SCHEDULE_HAS_APPOINTMENTS"
    status_code = 409
    message = "The requested schedule cannot be deleted because it has active appointments"

    def __init__(
            self,
            **context
    ) -> None:
        super().__init__(self.message, **context)


#


class ConflictError(AppException):
    code = "CONFLICT_ERROR"
    status_code = 409

    def __init__(
            self,
            message: str,
            **context
    ) -> None:
        super().__init__(message, **context)


#
class InvalidCredentialsError(AppException):
    status_code = 401

    def __init__(
            self,
            message: str | None = None,
            **context
    ) -> None:
        super().__init__(message, **context)


#

class InvalidTokenError(AppException):
    status_code = 401
    code = "INVALID_TOKEN"

    def __init__(
            self,
            message: str | None = None,
            **context
    ) -> None:
        super().__init__(message, **context)
