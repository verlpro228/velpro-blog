"""启动期引导：安全配置校验、建表、管理员账号播种。"""

import logging

from ..models import User
from .config import get_settings
from .database import Base, SessionLocal, engine
from .security import hash_password

logger = logging.getLogger("velpro")


def verify_security_config() -> None:
    """启动前校验安全相关配置。

    JWT_SECRET 用默认值时：显式 production 环境直接拒绝启动（避免带默认密钥上线），
    其余环境只打告警，不打断本地开发。
    """
    settings = get_settings()
    if not settings.jwt_secret_is_default:
        return

    message = (
        "JWT_SECRET 仍是默认值 'please-change-me'，任何人都能伪造登录态。"
        '请执行 python -c "import secrets; print(secrets.token_hex(32))" 生成后写入 .env / Vercel 环境变量。'
    )
    if settings.is_explicit_production:
        raise RuntimeError(message)

    logger.warning(message)


def create_tables() -> None:
    """建表。依赖 models 包已被导入（models/__init__ 聚合导出全部模型）。"""
    Base.metadata.create_all(bind=engine)


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
