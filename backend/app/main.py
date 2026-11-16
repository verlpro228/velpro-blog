"""应用装配层：中间件、异常处理、路由注册、生命周期。

目录分层：
- core/      基础设施（配置、数据库、鉴权、限流、响应与异常）
- models/    ORM 模型
- schemas/   请求/响应契约
- services/  业务逻辑
- routers/   HTTP 路由（只做入参解析与响应返回）
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .core.bootstrap import create_tables, ensure_admin_user, verify_security_config
from .core.config import get_settings
from .core.errors import register_exception_handlers
from .routers import ai, auth, docs, profile, projects, rss, sitemap, stats


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    ensure_admin_user()
    yield


verify_security_config()

app = FastAPI(title="velpro-blog-api", lifespan=lifespan)

# 前后端同域部署时浏览器不触发跨域，这里只放行本地开发端口与站点自身来源，
# 需要额外域名时通过 CORS_ORIGINS 显式追加（不再使用 allow_origins=["*"]）
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# 文档接口返回全文 markdown（70KB+），压缩后体积能小 80%，跨地域传输提速明显
app.add_middleware(GZipMiddleware, minimum_size=1024)

register_exception_handlers(app)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(docs.router, prefix="/api/docs", tags=["docs"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(rss.router, prefix="/api", tags=["rss"])
# 根级路径（非 /api），需 vercel.json 单独放行，见 routers/sitemap.py
app.include_router(sitemap.router, tags=["seo"])


@app.get("/api/health")
def health():
    return {"code": 0, "data": {"status": "up"}, "message": "ok"}


# scripts/seed_docs.py 通过 `from backend.app.main import ensure_admin_user` 复用播种逻辑
__all__ = ["app", "ensure_admin_user"]
