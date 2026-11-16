"""站点地图：运行时从已发布文档生成 sitemap.xml，供搜索引擎抓取。

路径是根级的 `/sitemap.xml`（不是 `/api/sitemap.xml`）：
- 线上需要在 `vercel.json` 里单独放行到 Python 函数（否则会被 SPA 兜底吃掉）
- 本地开发由 `vite.config.ts` 的代理转发到后端
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..core.deps import get_db
from ..services.feed import build_sitemap_xml

router = APIRouter()


@router.get("/sitemap.xml")
def sitemap(db: Session = Depends(get_db)):
    """sitemap.xml：固定页面 + 全部已发布文档（每篇一个独立 URL）。"""
    # 必须带 s-maxage，Vercel 才会把函数响应放进 CDN 缓存。
    # 只写 max-age 会被 Vercel 覆盖成 "max-age=0, must-revalidate"，
    # 导致每次抓取都要冷启动函数 + 跨区查库（实测冷启动 5.6s），搜索引擎容易抓取失败。
    # 头必须挂在返回的 Response 上：路由返回 Response 实例时，注入的 response 对象不会被合并。
    return Response(
        content=build_sitemap_xml(db),
        media_type="application/xml; charset=utf-8",
        headers={"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300"},
    )
