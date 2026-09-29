from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import User
from .routers import ai, auth, docs, profile, projects, rss, stats
from .security import hash_password


def ensure_admin_user() -> None:
    """配置了 admin_password 且库里没有该用户时创建管理员（仅首次初始化，之后改密码走后台接口，以数据库为准）。"""
    settings = get_settings()
    if not settings.admin_password:
        return

    db = SessionLocal()
    try:
        exists = db.query(User).filter(User.username == settings.admin_username).first()
        if exists:
            return

        db.add(
            User(
                id="u_admin",
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
                name=settings.admin_name,
                role="admin",
                avatar=settings.admin_avatar,
                tagline=settings.admin_tagline,
            )
        )
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_admin_user()
    yield


app = FastAPI(title="velpro-blog-api", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 文档接口返回全文 markdown（70KB+），压缩后体积能小 80%，跨地域传输提速明显
app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "data": None, "message": detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(part) for part in first_error.get("loc", []) if part != "body")
    message = f"参数错误: {field} {first_error.get('msg', '')}".strip()
    return JSONResponse(
        status_code=422,
        content={"code": 422, "data": None, "message": message},
    )


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(docs.router, prefix="/api/docs", tags=["docs"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(rss.router, prefix="/api", tags=["rss"])


@app.get("/api/health")
def health():
    return {"code": 0, "data": {"status": "up"}, "message": "ok"}
