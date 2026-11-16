from typing import Literal

from pydantic import BaseModel, Field


class DocMutationPayload(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = ""
    content: str = ""
    tags: list[str] = []
    status: Literal["published", "draft"] = "published"


class LikePayload(BaseModel):
    """点赞/取消点赞：liked=false 表示撤销，点赞数不会减到负数。"""

    liked: bool = True
