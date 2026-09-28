import os
import ssl as ssl_lib
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import ROOT_DIR, get_settings


class Base(DeclarativeBase):
    pass


def _resolve_ssl_context():
    """Aiven MySQL 强制 SSL。优先使用 CA 证书验证；证书缺失时退回仅加密不验证。"""
    settings = get_settings()
    ca_path = Path(settings.db_ssl_ca_path) if settings.db_ssl_ca_path else None
    if ca_path and not ca_path.is_absolute():
        ca_path = ROOT_DIR / ca_path

    if ca_path and ca_path.exists():
        return ssl_lib.create_default_context(cafile=str(ca_path))

    context = ssl_lib.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl_lib.CERT_NONE
    return context


settings = get_settings()

connect_args = {}
engine_kwargs = {}

if settings.database_url.startswith("mysql"):
    # Aiven 强制 SSL：每次新建连接都要完整走 TCP + TLS + 认证握手，跨地域时这一
    # 步就是最大的延迟来源。用小连接池复用连接，只有查询本身的耗时。
    connect_args["ssl"] = _resolve_ssl_context()
    engine_kwargs.update(
        pool_size=3,  # 常驻连接数（Aiven 免费版连接数有限，保持小池）
        max_overflow=2,  # 峰值额外连接
        pool_recycle=280,  # 在服务端回收空闲连接前主动重建，避免用到被切断的连接
        # serverless 实例会被冻结/唤醒（池中连接可能已死），需要探活；本地开发
        # 链路 RTT 高，探活要多花一个网络往返，靠 recycle 兜底即可
        pool_pre_ping=bool(os.environ.get("VERCEL")),
    )

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
