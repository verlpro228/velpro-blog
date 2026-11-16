"""全局异常处理：把 HTTPException 与参数校验错误统一成 { code, data, message }。"""

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def http_exception_handler(_, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "data": None, "message": detail},
    )


async def validation_exception_handler(_, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(part) for part in first_error.get("loc", []) if part != "body")
    message = f"参数错误: {field} {first_error.get('msg', '')}".strip()
    return JSONResponse(
        status_code=422,
        content={"code": 422, "data": None, "message": message},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
