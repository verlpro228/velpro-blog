"""订阅源与站点地图：从已发布文档生成 RSS 2.0 / sitemap.xml 文本。"""

import calendar
import datetime
from email.utils import formatdate
from xml.sax.saxutils import escape

from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..models import Doc

SITE_DESCRIPTION = "Velpro Blog：基于 Vue 3 + FastAPI 的个人技术知识博客。"

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


def to_rfc822(date_text: str) -> str:
    try:
        parsed = datetime.date.fromisoformat(date_text)
    except (TypeError, ValueError):
        return date_text

    timestamp = calendar.timegm(parsed.timetuple())
    return formatdate(timestamp, localtime=False, usegmt=True)


def build_rss_xml(db: Session) -> str:
    """RSS 2.0 订阅源：运行时从已发布文档生成，供阅读器订阅。"""
    site = get_settings().site_url.rstrip("/")

    rows = (
        db.query(Doc.id, Doc.title, Doc.summary, Doc.content, Doc.create_time)
        .filter(Doc.status == "published")
        .order_by(Doc.create_time.desc(), Doc.id.desc())
        .limit(50)
        .all()
    )

    items = []
    for doc in rows:
        # 每篇指向自己的独立 URL（History 路由后不再是统一的 /#/knowledge）
        doc_url = f"{site}/knowledge/{doc.id}"
        # 全文输出：CDATA 包裹让阅读器内直接读全文；content 中若出现 "]]>" 需拆分转义
        cdata_content = (doc.content or "").replace("]]>", "]]]]><![CDATA[>")
        items.append(
            "<item>"
            f"<title>{escape(doc.title)}</title>"
            f"<link>{escape(doc_url)}</link>"
            '<guid isPermaLink="false">'
            f"{escape(doc.id)}"
            "</guid>"
            f"<pubDate>{escape(to_rfc822(doc.create_time))}</pubDate>"
            f"<description><![CDATA[{cdata_content}]]></description>"
            "</item>"
        )

    last_build = to_rfc822(rows[0].create_time) if rows else formatdate(usegmt=True)

    return (
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


def build_sitemap_xml(db: Session) -> str:
    """sitemap.xml：固定页面 + 全部已发布文档（每篇一个独立 URL）。"""
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

    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(entries)
        + "</urlset>"
    )
