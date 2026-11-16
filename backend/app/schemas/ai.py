from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=200_000)


class ChatPayload(BaseModel):
    # 上限只为拦住异常请求：正常对话带上整篇文章上下文也远低于这个量级
    messages: list[ChatMessage] = Field(default_factory=list, max_length=50)
