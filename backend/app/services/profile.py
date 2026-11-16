"""站点个人资料（单例）业务逻辑。"""

from sqlalchemy.orm import Session

from ..models import SiteProfile
from ..schemas import SiteProfilePayload

PROFILE_ID = "main"


def serialize_profile(profile: SiteProfile) -> dict:
    return {
        "name": profile.name,
        "target": profile.target or "",
        "summary": profile.summary or "",
        "contacts": list(profile.contacts or []),
        "skillGroups": list(profile.skill_groups or []),
        "skillDetails": profile.skill_details or "",
        "experiences": list(profile.experiences or []),
        "education": list(profile.education or []),
        "timeline": list(profile.timeline or []),
    }


def get_site_profile(db: Session) -> SiteProfile | None:
    return db.get(SiteProfile, PROFILE_ID)


def save_site_profile(db: Session, payload: SiteProfilePayload) -> SiteProfile:
    profile = db.get(SiteProfile, PROFILE_ID)
    if profile is None:
        profile = SiteProfile(id=PROFILE_ID, name=payload.name)
        db.add(profile)

    profile.name = payload.name
    profile.target = payload.target
    profile.summary = payload.summary
    profile.contacts = [item.model_dump() for item in payload.contacts]
    profile.skill_groups = [item.model_dump() for item in payload.skillGroups]
    profile.skill_details = payload.skillDetails
    profile.experiences = [item.model_dump() for item in payload.experiences]
    profile.education = [item.model_dump() for item in payload.education]
    profile.timeline = [item.model_dump() for item in payload.timeline]

    db.commit()
    db.refresh(profile)
    return profile
