from sqlalchemy import JSON, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


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


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="admin")
    avatar: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    tagline: Mapped[str] = mapped_column(String(255), nullable=False, default="")


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


class SiteProfile(Base):
    """个人介绍页信息（单例，id 固定 'main'）。"""

    __tablename__ = "site_profile"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    target: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    contacts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    skill_groups: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    education: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    timeline: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
