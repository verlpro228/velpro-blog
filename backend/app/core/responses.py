"""统一响应封装。"""

from typing import Any


def ok(data: Any = None, message: str = "ok") -> dict:
    """对齐前端 ApiResponse：{ code, data, message }，code === 0 表示成功。"""
    return {"code": 0, "data": data, "message": message}
