from collections import Counter
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Doc, Project, User
from ..schemas import ok
from ..security import get_current_user

router = APIRouter()

TOP_DOC_LIMIT = 10
MONTH_WINDOW = 12


def _month_key(create_time: str) -> str:
    """create_time 形如 YYYY-MM-DD；异常数据返回空串由调用方跳过。"""
    parts = (create_time or "").split("-")
    return f"{parts[0]}-{parts[1]}" if len(parts) >= 2 else ""


@router.get("")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """后台看板统计：概览数字 + 浏览量 Top 榜 + 标签分布 + 月度产出（近 12 个月）。"""
    docs = (
        db.query(Doc.id, Doc.title, Doc.views, Doc.likes, Doc.status, Doc.tags, Doc.create_time)
        .all()
    )
    project_count = db.query(Project.id).count()

    published = [d for d in docs if d.status == "published"]
    drafts = [d for d in docs if d.status != "published"]

    top_docs = sorted(
        published,
        key=lambda d: (d.views or 0, d.likes or 0),
        reverse=True,
    )[:TOP_DOC_LIMIT]

    # 标签分布：数据量小，Python 侧聚合（MySQL JSON_TABLE 在免配置环境下更难维护）
    tag_counter: Counter = Counter()
    for doc in published:
        for tag in doc.tags or []:
            tag_counter[tag] += 1

    # 月度产出：近 12 个月，缺失月份补 0，保持图表 x 轴连续
    current = date.today()
    month_keys = []
    year, month = current.year, current.month
    for _ in range(MONTH_WINDOW):
        month_keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            year -= 1
            month = 12
    month_keys.reverse()

    publish_counter: Counter = Counter()
    for doc in published:
        key = _month_key(doc.create_time)
        if key:
            publish_counter[key] += 1

    return ok(
        {
            "overview": {
                "docCount": len(published),
                "draftCount": len(drafts),
                "projectCount": project_count,
                "totalViews": sum(d.views or 0 for d in docs),
                "totalLikes": sum(d.likes or 0 for d in docs),
            },
            "topDocs": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "views": doc.views or 0,
                    "likes": doc.likes or 0,
                }
                for doc in top_docs
            ],
            "tagStats": [
                {"name": name, "count": count}
                for name, count in tag_counter.most_common()
            ],
            "monthly": [
                {"month": key, "count": publish_counter.get(key, 0)}
                for key in month_keys
            ],
        }
    )
