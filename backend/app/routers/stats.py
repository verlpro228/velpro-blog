from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, get_db
from ..core.responses import ok
from ..models import User
from ..services.stats import collect_stats

router = APIRouter()


@router.get("")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """后台看板统计：概览数字 + 浏览量 Top 榜 + 标签分布 + 月度产出（近 12 个月）。"""
    return ok(collect_stats(db))


@router.get("/public")
def get_public_stats(db: Session = Depends(get_db)):
    """前台统计页：免鉴权公开口径（草稿数属内部信息，不对外暴露）。"""
    data = collect_stats(db)
    data["overview"].pop("draftCount", None)
    # 禁止浏览器/CDN 缓存，保证统计实时
    return JSONResponse(content=ok(data), headers={"Cache-Control": "no-store"})
