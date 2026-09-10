import logging
from uuid import uuid4
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from .exceptions import AppException, InvalidTokenError


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

def unhandled_error_handler(
        request: Request, exc: Exception
) -> JSONResponse:
    rqst_id = getattr(request.state, "request_id", uuid4())

    logger.exception("Unhandled exception", extra={
        "path": request.url.path,
        "request_id": rqst_id,
        "context": exc
    })

    return JSONResponse(
        content={
            "detail": {
                "message": "An internal server error ocurred.",
                "code": "internal_server_error",
            }
        },
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

    return JSONResponse(
        content={
            "detail": {
                "message": msg,
                "code": code
            }
        },
        status_code=status_code
    )

# ===================================================================================================================


def validation_error_handler(
        request: Request, exc: RequestValidationError
) -> JSONResponse:
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

    return JSONResponse(
        status_code=422,
        content={
            "detail": {
                "message": "Recieved invalid request data.",
                "code": "validation_error"
            }
        }
    )


# ===================================================================================================================

def invalid_token_handler(
        request: Request, exc: InvalidTokenError
) -> JSONResponse:
    logger.exception(
        "Invalid token",
        extra={
            "path": request.url.path,
            "request_id": getattr(
                request.state, "request_id", uuid4()
            ),
        }
    )

    return JSONResponse(
        content={
            "detail": {
                "message": "Invalid or expired token",
                "code": "invalid_token"
            }
        },
        status_code=401,
        headers=exc.context["headers"] or {}
    )
