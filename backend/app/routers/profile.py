from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, get_db
from ..core.responses import ok
from ..models import User
from ..schemas import SiteProfilePayload
from ..services import profile as profile_service

router = APIRouter()


@router.get("")
def get_site_profile(response: Response, db: Session = Depends(get_db)):
    # 短缓存：减少跨地域重复请求，前端还有一层 store 缓存兜底即时性
    response.headers["Cache-Control"] = "public, max-age=30"
    profile = profile_service.get_site_profile(db)
    if profile is None:
        return ok(None, "未初始化")
    return ok(profile_service.serialize_profile(profile))


@router.put("")
def update_site_profile(
    payload: SiteProfilePayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    profile = profile_service.save_site_profile(db, payload)
    return ok(profile_service.serialize_profile(profile), "保存成功")
