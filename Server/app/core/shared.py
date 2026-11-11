import logging
from fastapi import Request
from pydantic import BaseModel
from typing import Any, Mapping
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException


logger = logging.getLogger("Application exception logger..")


class HTTPError(BaseModel):
    message: str
    code: str
    status_code: int
    details: dict | None = None
    request_id: str | None = None


def error_response(
        status: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
        request_id: str | None = None,
        headers: Mapping[str, str] | None = None
) -> JSONResponse:
    body = HTTPError(
        status_code=status,
        code=code,
        message=message,
        details=details or {},
        request_id=request_id
    )

    return JSONResponse(
        content=body.model_dump(mode="json"),
        status_code=status,
        headers={
            "Cache-Control": "no-store", **(headers or {})
        }
    )


def log_app_error(
        request: Request, exc: AppException
) -> None:
    request_id = getattr(request.state, "request_id", None)

    logger.warning("""App exception
            message = %s,
            code = %s,
            status_code = %s,
            request_id = %s,
            request_path = %s,
            details = %s,
            context = %s""",
                   exc.message, exc.code, exc.status_code, request_id,
                   request.url.path, exc.details, exc.context
                   )
