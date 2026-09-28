from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SiteProfile, User
from ..schemas import SiteProfilePayload, ok
from ..security import get_current_user

router = APIRouter()

PROFILE_ID = "main"


def serialize_profile(profile: SiteProfile) -> dict:
    return {
        "name": profile.name,
        "target": profile.target or "",
        "summary": profile.summary or "",
        "contacts": list(profile.contacts or []),
        "skillGroups": list(profile.skill_groups or []),
        "education": list(profile.education or []),
        "timeline": list(profile.timeline or []),
    }


@router.get("")
def get_site_profile(response: Response, db: Session = Depends(get_db)):
    # 短缓存：减少跨地域重复请求，前端还有一层 store 缓存兜底即时性
    response.headers["Cache-Control"] = "public, max-age=30"
    profile = db.get(SiteProfile, PROFILE_ID)
    if profile is None:
        return ok(None, "未初始化")
    return ok(serialize_profile(profile))


@router.put("")
def update_site_profile(
    payload: SiteProfilePayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    profile = db.get(SiteProfile, PROFILE_ID)
    if profile is None:
        profile = SiteProfile(id=PROFILE_ID, name=payload.name)
        db.add(profile)

    profile.name = payload.name
    profile.target = payload.target
    profile.summary = payload.summary
    profile.contacts = [item.model_dump() for item in payload.contacts]
    profile.skill_groups = [item.model_dump() for item in payload.skillGroups]
    profile.education = [item.model_dump() for item in payload.education]
    profile.timeline = [item.model_dump() for item in payload.timeline]

    db.commit()
    db.refresh(profile)
    return ok(serialize_profile(profile), "保存成功")
