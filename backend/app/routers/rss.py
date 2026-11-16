from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..core.deps import get_db
from ..services.feed import build_rss_xml

router = APIRouter()


@router.get("/rss.xml")
def rss_feed(db: Session = Depends(get_db)):
    """RSS 2.0 订阅源：运行时从已发布文档生成，供阅读器订阅。"""
    # s-maxage 是 Vercel CDN 缓存的开关；只写 max-age 会被覆盖成 max-age=0。
    # 头必须挂在返回的 Response 上：路由返回 Response 实例时，注入的 response 对象不会被合并。
    return Response(
        content=build_rss_xml(db),
        media_type="application/xml; charset=utf-8",
        headers={"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300"},
    )
