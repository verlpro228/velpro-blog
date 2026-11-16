"""极简的进程内滑动窗口限流。

定位说明：Vercel Serverless 是无状态、可多实例的，进程内计数只能约束单个实例，
真正的分布式限流需要 Redis 之类的共享存储。这里的目的是以**零新增依赖**的方式，
拦住最常见的脚本化密码爆破与刷量请求，对个人站点足够；如需跨实例精确限流，
把 `SlidingWindowLimiter.allow` 换成共享存储实现即可，调用方无需改动。
"""

from __future__ import annotations

import os
import threading
import time
from collections.abc import Callable

from fastapi import HTTPException, Request


class SlidingWindowLimiter:
    """按 key（通常是 IP）统计滑动窗口内的请求数。"""

    def __init__(self, max_events: int, window_seconds: float, max_keys: int = 4096) -> None:
        self.max_events = max_events
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            hits = [stamp for stamp in self._hits.get(key, ()) if now - stamp < self.window_seconds]
            if len(hits) >= self.max_events:
                self._hits[key] = hits
                return False

            hits.append(now)
            self._hits[key] = hits
            self._prune(now)
            return True

    def _prune(self, now: float) -> None:
        """key 数量超阈值时清掉已过期的桶，避免长期运行内存无界增长。"""
        if len(self._hits) <= self.max_keys:
            return

        expired = [
            key
            for key, hits in self._hits.items()
            if not hits or now - hits[-1] >= self.window_seconds
        ]
        for key in expired:
            self._hits.pop(key, None)


def client_ip(request: Request) -> str:
    """取真实来源 IP。

    转发头由客户端自行携带也可以伪造，因此只有在可信反向代理之后才采信：
    Vercel 运行时（VERCEL 环境变量）或显式设置 TRUST_PROXY_HEADERS=1 时启用，
    其余情况（本地直连 uvicorn）一律用 TCP 层的 request.client.host。
    """
    trust_proxy = bool(os.environ.get("VERCEL")) or os.environ.get("TRUST_PROXY_HEADERS") == "1"

    if trust_proxy:
        # Vercel 边缘网络写入，客户端无法覆盖
        real_ip = request.headers.get("x-real-ip")
        if real_ip and real_ip.strip():
            return real_ip.strip()

        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # 形如 "客户端, 代理1, 代理2"：最左可能是客户端伪造值，取最右一跳
            hops = [hop.strip() for hop in forwarded.split(",") if hop.strip()]
            if hops:
                return hops[-1]

    if request.client is not None:
        return request.client.host

    return "unknown"


def limit_requests(limiter: SlidingWindowLimiter, scope: str) -> Callable[[Request], None]:
    """把限流器包装成 FastAPI 依赖：超限直接抛 429。"""

    def dependency(request: Request) -> None:
        if not limiter.allow(f"{scope}:{client_ip(request)}"):
            raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")

    return dependency
