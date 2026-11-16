from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, get_db
from ..core.rate_limit import SlidingWindowLimiter, limit_requests
from ..core.responses import ok
from ..core.security import user_profile
from ..models import User
from ..schemas import LoginPayload, PasswordUpdatePayload, ProfileUpdatePayload
from ..services import auth as auth_service

router = APIRouter()

# 登录接口限流：同一来源 5 分钟内最多 10 次，拦住脚本化密码爆破
login_limiter = SlidingWindowLimiter(max_events=10, window_seconds=300)


@router.post("/login", dependencies=[Depends(limit_requests(login_limiter, "login"))])
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, payload)
    token = auth_service.issue_token(user)
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
    updated = auth_service.update_profile(db, user, payload)
    return ok(user_profile(updated), "个人信息已更新")


@router.put("/password")
def update_password(
    payload: PasswordUpdatePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    auth_service.change_password(db, user, payload)
    return ok({"success": True}, "密码已更新，请重新登录")
