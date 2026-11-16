from sqlalchemy import JSON, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Doc(Base):
    __tablename__ = "docs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content: Mapped[str] = mapped_column(
        Text().with_variant(LONGTEXT(), "mysql"), nullable=False, default=""
    )
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    create_time: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    # 浏览量 / 点赞：由公开接口累加，客户端自行去重（会话/本地存储）
    views: Mapped[int] = mapped_column(nullable=False, default=0)
    likes: Mapped[int] = mapped_column(nullable=False, default=0)
    # published：公开列表可见；draft：仅后台 manage 列表可见
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="published")
