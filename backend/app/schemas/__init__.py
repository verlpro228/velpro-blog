"""schemas：请求/响应契约层（Pydantic）。

按业务分文件，这里聚合导出，业务代码统一 `from ..schemas import Xxx` 即可。
`ok` 从 core.responses 再导出，保持旧引用路径不变。
"""

from ..core.responses import ok
from .ai import ChatMessage, ChatPayload
from .auth import LoginPayload, PasswordUpdatePayload, ProfileUpdatePayload, UserProfile
from .doc import DocMutationPayload, LikePayload
from .profile import (
    ContactItem,
    EducationItem,
    ExperienceItem,
    SiteProfilePayload,
    SkillGroup,
    TimelineItem,
)
from .project import ProjectMetric, ProjectMutationPayload, ProjectVisibilityPayload

__all__ = [
    "ChatMessage",
    "ChatPayload",
    "ContactItem",
    "DocMutationPayload",
    "EducationItem",
    "ExperienceItem",
    "LikePayload",
    "LoginPayload",
    "PasswordUpdatePayload",
    "ProfileUpdatePayload",
    "ProjectMetric",
    "ProjectMutationPayload",
    "ProjectVisibilityPayload",
    "SiteProfilePayload",
    "SkillGroup",
    "TimelineItem",
    "UserProfile",
    "ok",
]
