import calendar
import datetime
from email.utils import formatdate
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import Doc

router = APIRouter()

SITE_DESCRIPTION = "Velpro Blog：基于 Vue 3 + FastAPI 的个人技术知识博客。"


def to_rfc822(date_text: str) -> str:
    try:
        parsed = datetime.date.fromisoformat(date_text)
    except (TypeError, ValueError):
        return date_text

    timestamp = calendar.timegm(parsed.timetuple())
    return formatdate(timestamp, localtime=False, usegmt=True)


@router.get("/rss.xml")
def rss_feed(response: Response, db: Session = Depends(get_db)):
    """RSS 2.0 订阅源：运行时从已发布文档生成，供阅读器订阅。"""
    response.headers["Cache-Control"] = "public, max-age=1800"

    settings = get_settings()
    site = settings.site_url.rstrip("/")
    knowledge_url = f"{site}/#/knowledge"

    rows = (
        db.query(Doc.id, Doc.title, Doc.summary, Doc.create_time)
        .filter(Doc.status == "published")
        .order_by(Doc.create_time.desc(), Doc.id.desc())
        .limit(50)
        .all()
    )

    items = []
    for doc in rows:
        items.append(
            "<item>"
            f"<title>{escape(doc.title)}</title>"
            f"<link>{escape(knowledge_url)}</link>"
            '<guid isPermaLink="false">'
            f"{escape(doc.id)}"
            "</guid>"
            f"<pubDate>{escape(to_rfc822(doc.create_time))}</pubDate>"
            f"<description>{escape(doc.summary or '')}</description>"
            "</item>"
        )

    last_build = to_rfc822(rows[0].create_time) if rows else formatdate(usegmt=True)

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<rss version="2.0"><channel>'
        "<title>Velpro Blog</title>"
        f"<link>{escape(site)}</link>"
        f"<description>{escape(SITE_DESCRIPTION)}</description>"
        "<language>zh-cn</language>"
        f"<lastBuildDate>{escape(last_build)}</lastBuildDate>"
        + "".join(items)
        + "</channel></rss>"
    )

    return Response(content=xml, media_type="application/xml; charset=utf-8")
