from typing import Any

from pydantic import BaseModel, Field


def ok(data: Any = None, message: str = "ok") -> dict:
    """对齐前端 ApiResponse：{ code, data, message }，code === 0 表示成功。"""
    return {"code": 0, "data": data, "message": message}


class LoginPayload(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserProfile(BaseModel):
    id: str
    name: str
    role: str
    avatar: str
    tagline: str


class DocMutationPayload(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = ""
    content: str = ""
    tags: list[str] = []


class ProfileUpdatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    tagline: str = ""


class PasswordUpdatePayload(BaseModel):
    oldPassword: str = Field(min_length=1)
    newPassword: str = Field(min_length=6, max_length=128)


class ProjectMetric(BaseModel):
    label: str
    value: str


class ProjectMutationPayload(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = ""
    cover: str = ""
    category: str = ""
    period: str = ""
    role: str = ""
    techStacks: list[str] = []
    highlights: list[str] = []
    features: list[str] = []
    outcomes: list[str] = []
    responsibilities: list[str] = []
    metrics: list[ProjectMetric] = []
    sortOrder: int = 0


class ProjectVisibilityPayload(BaseModel):
    visible: bool


class ContactItem(BaseModel):
    label: str
    value: str
    href: str = ""


class SkillGroup(BaseModel):
    title: str
    items: list[str] = []


class ExperienceItem(BaseModel):
    company: str
    position: str = ""
    period: str = ""
    content: str = ""


class EducationItem(BaseModel):
    school: str
    major: str
    period: str
    honors: str = ""


class TimelineItem(BaseModel):
    id: str = ""
    title: str
    period: str
    description: str


class SiteProfilePayload(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    target: str = ""
    summary: str = ""
    contacts: list[ContactItem] = []
    skillGroups: list[SkillGroup] = []
    skillDetails: str = ""
    experiences: list[ExperienceItem] = []
    education: list[EducationItem] = []
    timeline: list[TimelineItem] = []


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatPayload(BaseModel):
    messages: list[ChatMessage] = []
