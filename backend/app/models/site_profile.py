from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class SiteProfile(Base):
    """个人介绍页信息（单例，id 固定 'main'）。"""

    __tablename__ = "site_profile"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    target: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    contacts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    skill_groups: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    # 专业技能详细描述（纯文本，支持换行）
    skill_details: Mapped[str | None] = mapped_column(Text, nullable=True, default="")
    # 工作经验：[{company, position, period, content}]
    experiences: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    education: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    timeline: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
