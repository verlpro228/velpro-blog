"""登录鉴权与账号自助维护。"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..core.security import create_access_token, hash_password, verify_password
from ..models import User
from ..schemas import LoginPayload, PasswordUpdatePayload, ProfileUpdatePayload


def authenticate(db: Session, payload: LoginPayload) -> User:
    """校验账号密码，失败统一返回 401（不区分账号不存在与密码错误）。"""
    username = payload.username.strip()
    user = db.query(User).filter(User.username == username).first()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="账号或密码错误")

    return user


def issue_token(user: User) -> str:
    return create_access_token(user)


def update_profile(db: Session, user: User, payload: ProfileUpdatePayload) -> User:
    user.name = payload.name.strip()
    user.tagline = payload.tagline.strip()
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, payload: PasswordUpdatePayload) -> None:
    if not verify_password(payload.oldPassword, user.password_hash):
        # 用 400 而非 401，避免前端拦截器误判为登录失效
        raise HTTPException(status_code=400, detail="原密码不正确")

    user.password_hash = hash_password(payload.newPassword)
    db.commit()
