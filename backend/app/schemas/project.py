from pydantic import BaseModel, Field


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
