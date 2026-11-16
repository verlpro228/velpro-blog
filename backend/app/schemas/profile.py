from pydantic import BaseModel, Field


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
    major: str = ""
    period: str = ""
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
