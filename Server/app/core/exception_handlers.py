import logging
from uuid import uuid4
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from .exceptions import AppException


logger = logging.getLogger(__name__)


ERROR_MAP: dict[str, int] = {
    "RATE_LIMITED": 429
}


class ErrorHttp(BaseModel):
    message: str
    code: str
    status: int
    detail: dict | None = None


# ===================================================================================================================

def resolve_error_status_code(
        exc: AppException
) -> int:
    return exc.status_code or ERROR_MAP.get(exc.code, 500)


# ===================================================================================================================

def unhandled_error_handler(request: Request, exc: Exception):
    rqst_id = getattr(request.state, "request_id", uuid4())

    logger.exception("Unhandled exception", extra={
        "path": request.url.path,
        "request_id": rqst_id,
        "context": exc
    })

    error = ErrorHttp(
        message="An internal server error occurred.",
        code="Internal_Server_Error",
        status=500,
    )

    return JSONResponse(
        content=error.model_dump(),
        status_code=500
    )

# ===================================================================================================================


def application_error_handler(
        request: Request, exc: AppException
) -> JSONResponse:
    rqst_id = getattr(
        request.state, "request_id", uuid4()
    )

    status_code = resolve_error_status_code(exc)
    msg, code = exc.message, exc.code

    logger.exception("App Exception", extra={
        "code": code,
        "path": request.url.path,
        "request_id": rqst_id,
        **exc.context
    })

    error = ErrorHttp(
        message=msg,
        code=code,
        status=status_code,
    )

    return JSONResponse(
        content=error.model_dump(),
        status_code=status_code
    )

# ===================================================================================================================


def validation_error_handler(
        request: Request, exc: RequestValidationError
):
    logger.exception(
        "Request Validation error",
        extra={
            "path": request.url.path,
            "request_id": getattr(
                request.state, "request_id", uuid4()
            ),
            "details": exc.errors()
        }
    )

    error_http = ErrorHttp(
        message="Invalid Request Data.",
        code="VALIDATION_ERROR",
        status=422
    )

    return JSONResponse(
        status_code=422,
        content=error_http.model_dump()
    )
