"""站点地图：运行时从已发布文档生成 sitemap.xml，供搜索引擎抓取。

路径是根级的 `/sitemap.xml`（不是 `/api/sitemap.xml`）：
- 线上需要在 `vercel.json` 里单独放行到 Python 函数（否则会被 SPA 兜底吃掉）
- 本地开发由 `vite.config.ts` 的代理转发到后端
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from xml.sax.saxutils import escape

from ..config import get_settings
from ..database import get_db
from ..models import Doc

router = APIRouter()

# 固定页面：(路径, 更新频率, 优先级)
STATIC_PAGES = [
    ("/", "weekly", "1.0"),
    ("/knowledge", "daily", "0.9"),
    ("/archive", "weekly", "0.7"),
    ("/projects", "weekly", "0.8"),
    ("/about", "monthly", "0.7"),
    ("/guestbook", "monthly", "0.5"),
    ("/links", "monthly", "0.4"),
]


@router.get("/sitemap.xml")
def sitemap(response: Response, db: Session = Depends(get_db)):
    """sitemap.xml：固定页面 + 全部已发布文档（每篇一个独立 URL）。"""
    response.headers["Cache-Control"] = "public, max-age=1800"

    site = get_settings().site_url.rstrip("/")

    rows = (
        db.query(Doc.id, Doc.create_time)
        .filter(Doc.status == "published")
        .order_by(Doc.create_time.desc(), Doc.id.desc())
        .all()
    )

    entries = []
    for path, changefreq, priority in STATIC_PAGES:
        loc = escape(f"{site}{path}")
        entries.append(
            f"<url><loc>{loc}</loc>"
            f"<changefreq>{changefreq}</changefreq>"
            f"<priority>{priority}</priority></url>"
        )

    for doc in rows:
        loc = escape(f"{site}/knowledge/{doc.id}")
        lastmod = escape(doc.create_time or "")
        lastmod_tag = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
        entries.append(
            f"<url><loc>{loc}</loc>{lastmod_tag}"
            "<changefreq>monthly</changefreq><priority>0.6</priority></url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(entries)
        + "</urlset>"
    )

    return Response(content=xml, media_type="application/xml; charset=utf-8")
