import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Project, User
from ..schemas import ProjectMutationPayload, ProjectVisibilityPayload, ok
from ..security import get_current_user

router = APIRouter()


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


@router.get("")
def list_projects(response: Response, db: Session = Depends(get_db)):
    # 前台公开接口：只返回开启展示的项目
    # 短缓存：减少跨地域重复请求，前端还有一层 store 缓存兜底即时性
    response.headers["Cache-Control"] = "public, max-age=30"
    projects = (
        db.query(Project)
        .filter(Project.visible.is_(True))
        .order_by(Project.sort_order, Project.id)
        .all()
    )
    return ok([serialize_project(project) for project in projects])


@router.get("/manage")
def list_all_projects(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """后台管理接口：返回全部项目（含已隐藏）。"""
    projects = db.query(Project).order_by(Project.sort_order, Project.id).all()
    return ok([serialize_project(project) for project in projects])


@router.post("")
def create_project(
    payload: ProjectMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = Project(id=f"proj-{uuid.uuid4().hex[:8]}")
    apply_payload(project, payload)
    db.add(project)
    db.commit()
    db.refresh(project)
    return ok(serialize_project(project), "创建成功")


@router.put("/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    apply_payload(project, payload)
    db.commit()
    db.refresh(project)
    return ok(serialize_project(project), "更新成功")


@router.put("/{project_id}/visibility")
def update_project_visibility(
    project_id: str,
    payload: ProjectVisibilityPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """切换项目是否在前台展示。"""
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    project.visible = payload.visible
    db.commit()
    db.refresh(project)
    return ok(serialize_project(project), "已更新展示状态" if payload.visible else "已改为前台隐藏")


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    db.delete(project)
    db.commit()
    return ok({"success": True}, "删除成功")
