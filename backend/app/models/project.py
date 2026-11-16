from sqlalchemy import JSON, Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cover: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    category: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    period: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    role: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tech_stacks: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    highlights: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    features: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    outcomes: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    # 个人职责列表，供"个人介绍"页项目经验区块回显
    responsibilities: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    metrics: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    # 是否在前台页面（项目展示 / 个人介绍）展示
    visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
