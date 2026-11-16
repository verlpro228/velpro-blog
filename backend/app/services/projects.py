"""项目业务逻辑：前台列表、后台全量列表、增删改与展示状态切换。"""

import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import Project
from ..schemas import ProjectMutationPayload


def serialize_project(project: Project) -> dict:
    return {
        "id": project.id,
        "title": project.title,
        "summary": project.summary or "",
        "cover": project.cover or "",
        "category": project.category or "",
        "period": project.period or "",
        "role": project.role or "",
        "techStacks": list(project.tech_stacks or []),
        "highlights": list(project.highlights or []),
        "features": list(project.features or []),
        "outcomes": list(project.outcomes or []),
        "responsibilities": list(project.responsibilities or []),
        "metrics": list(project.metrics or []),
        "sortOrder": project.sort_order,
        "visible": bool(project.visible),
    }


def apply_payload(project: Project, payload: ProjectMutationPayload) -> None:
    project.title = payload.title
    project.summary = payload.summary
    project.cover = payload.cover
    project.category = payload.category
    project.period = payload.period
    project.role = payload.role
    project.tech_stacks = list(payload.techStacks)
    project.highlights = list(payload.highlights)
    project.features = list(payload.features)
    project.outcomes = list(payload.outcomes)
    project.responsibilities = list(payload.responsibilities)
    project.metrics = [item.model_dump() for item in payload.metrics]
    project.sort_order = payload.sortOrder


def get_project_or_404(db: Session, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


def list_visible_projects(db: Session) -> list[dict]:
    """前台公开接口：只返回开启展示的项目。"""
    projects = (
        db.query(Project)
        .filter(Project.visible.is_(True))
        .order_by(Project.sort_order, Project.id)
        .all()
    )
    return [serialize_project(project) for project in projects]


def list_all_projects(db: Session) -> list[dict]:
    """后台管理接口：返回全部项目（含已隐藏）。"""
    projects = db.query(Project).order_by(Project.sort_order, Project.id).all()
    return [serialize_project(project) for project in projects]


def create_project(db: Session, payload: ProjectMutationPayload) -> Project:
    project = Project(id=f"proj-{uuid.uuid4().hex[:8]}")
    apply_payload(project, payload)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: str, payload: ProjectMutationPayload) -> Project:
    project = get_project_or_404(db, project_id)
    apply_payload(project, payload)
    db.commit()
    db.refresh(project)
    return project


def set_project_visibility(db: Session, project_id: str, visible: bool) -> Project:
    """切换项目是否在前台展示。"""
    project = get_project_or_404(db, project_id)
    project.visible = visible
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: str) -> None:
    project = get_project_or_404(db, project_id)
    db.delete(project)
    db.commit()
