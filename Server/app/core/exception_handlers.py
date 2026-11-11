import logging
from starlette.exceptions import HTTPException
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from .exceptions import AppException
from .shared import log_app_error, error_response


logger = logging.getLogger(__name__)


def unhandled_error_handler(
        request: Request, exc: Exception
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)

    logger.exception(
        f"Unhandled exception"
        "request id: %s"
        "request path: %s",
        request_id,
        request.url.path,
    )

    return error_response(
        status=500,
        code="unknown_error",
        message="An unexpected error occurred.",
        request_id=request_id
    )


def http_exception_handler(
        request: Request, exc: HTTPException
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)

    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "http_error")
        message = exc.detail.get("message", "Request failed.")

    else:
        code, message = "http_error", exc.detail

    logger.warning(
        """Http Exception..
                status_code: %s,
                code: %s,
                message: %s,
                request_id: %s,
                request_path: %s""",
        exc.status_code, code, message, request_id, request.url.path
    )

    return error_response(
        status=exc.status_code,
        code=code,
        message=message,
        request_id=request_id
    )


def validation_error_handler(
        request: Request, exc: RequestValidationError
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)

    errors = [
        {
            "loc": list(e["loc"]),
            "msg": e["msg"],
            "type": e["type"]
        } for e in exc.errors()
    ]

    logger.warning(
        """logged request validation error ..
                request_path:  %s,
                request_id:  %s
                status_code:  422,
                code:  "validation_error",
                message:  "An error occurred while validating a user's request data..",
                errors:  %s""",
        request.url.path, request_id, errors
    )

    return error_response(
        status=422,
        code="validation_error",
        message="Request data validation failed.",
        details={"errors": errors},
        request_id=request_id
    )


def application_error_handler(
        request: Request, exc: AppException
) -> JSONResponse:
    log_app_error(request, exc)

    return error_response(
        status=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
        request_id=getattr(request.state, "request_id", None)
    )
