"""路由层统一依赖出口：数据库会话与当前登录用户。

路由里统一 `from ..core.deps import get_current_user, get_db`，
避免同一件事在不同模块各写一遍依赖来源。
"""

from .database import get_db
from .security import get_current_user

__all__ = ["get_current_user", "get_db"]
