from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, get_db
from ..core.responses import ok
from ..models import User
from ..schemas import ProjectMutationPayload, ProjectVisibilityPayload
from ..services import projects as project_service

router = APIRouter()


@router.get("")
def list_projects(response: Response, db: Session = Depends(get_db)):
    # 前台公开接口：只返回开启展示的项目
    # 短缓存：减少跨地域重复请求，前端还有一层 store 缓存兜底即时性
    response.headers["Cache-Control"] = "public, max-age=30"
    return ok(project_service.list_visible_projects(db))


@router.get("/manage")
def list_all_projects(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """后台管理接口：返回全部项目（含已隐藏）。"""
    return ok(project_service.list_all_projects(db))


@router.post("")
def create_project(
    payload: ProjectMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = project_service.create_project(db, payload)
    return ok(project_service.serialize_project(project), "创建成功")


@router.put("/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = project_service.update_project(db, project_id, payload)
    return ok(project_service.serialize_project(project), "更新成功")


@router.put("/{project_id}/visibility")
def update_project_visibility(
    project_id: str,
    payload: ProjectVisibilityPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """切换项目是否在前台展示。"""
    project = project_service.set_project_visibility(db, project_id, payload.visible)
    message = "已更新展示状态" if payload.visible else "已改为前台隐藏"
    return ok(project_service.serialize_project(project), message)


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project_service.delete_project(db, project_id)
    return ok({"success": True}, "删除成功")
