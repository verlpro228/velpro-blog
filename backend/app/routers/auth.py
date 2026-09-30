from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..rate_limit import SlidingWindowLimiter, limit_requests
from ..schemas import LoginPayload, PasswordUpdatePayload, ProfileUpdatePayload, ok
from ..security import (
    create_access_token,
    get_current_user,
    hash_password,
    user_profile,
    verify_password,
)

router = APIRouter()

# 登录接口限流：同一来源 5 分钟内最多 10 次，拦住脚本化密码爆破
login_limiter = SlidingWindowLimiter(max_events=10, window_seconds=300)


@router.post("/login", dependencies=[Depends(limit_requests(login_limiter, "login"))])
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    username = payload.username.strip()
    user = db.query(User).filter(User.username == username).first()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="账号或密码错误")

    token = create_access_token(user)
    return ok({"token": token, "userInfo": user_profile(user)})


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return ok(user_profile(user))


@router.put("/profile")
def update_profile(
    payload: ProfileUpdatePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user.name = payload.name.strip()
    user.tagline = payload.tagline.strip()
    db.commit()
    db.refresh(user)
    return ok(user_profile(user), "个人信息已更新")


@router.put("/password")
def update_password(
    payload: PasswordUpdatePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not verify_password(payload.oldPassword, user.password_hash):
        # 用 400 而非 401，避免前端拦截器误判为登录失效
        raise HTTPException(status_code=400, detail="原密码不正确")

    user.password_hash = hash_password(payload.newPassword)
    db.commit()
    return ok({"success": True}, "密码已更新，请重新登录")
