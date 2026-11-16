from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..core.deps import get_current_user, get_db
from ..core.rate_limit import SlidingWindowLimiter, limit_requests
from ..core.responses import ok
from ..models import User
from ..schemas import DocMutationPayload, LikePayload
from ..services import docs as doc_service

router = APIRouter()

# 阅读量/点赞是公开写接口，按来源限流防止脚本刷量（正常阅读每篇每会话只上报一次）
interaction_limiter = SlidingWindowLimiter(max_events=30, window_seconds=60)


@router.get("")
def list_docs(response: Response, db: Session = Depends(get_db)):
    """公开列表：只返回已发布文档，不查询/不返回全文 content，点开某篇时用单篇接口加载。"""
    response.headers["Cache-Control"] = "public, max-age=30"
    return ok(doc_service.list_docs(db, published_only=True))


@router.get("/manage")
def manage_docs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """后台列表：全部文档（含草稿），带浏览量/点赞/状态。"""
    return ok(doc_service.list_docs(db, published_only=False))


@router.get("/{doc_id}")
def get_doc(doc_id: str, response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "public, max-age=60"
    doc = doc_service.get_published_doc_or_404(db, doc_id)
    return ok(doc_service.serialize_doc(doc))


@router.post("")
def create_doc(
    payload: DocMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = doc_service.create_doc(db, payload)
    return ok(doc_service.serialize_doc(doc), "创建成功")


@router.put("/{doc_id}")
def update_doc(
    doc_id: str,
    payload: DocMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = doc_service.update_doc(db, doc_id, payload)
    return ok(doc_service.serialize_doc(doc), "更新成功")


@router.delete("/{doc_id}")
def delete_doc(
    doc_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc_service.delete_doc(db, doc_id)
    return ok({"success": True}, "删除成功")


@router.post("/{doc_id}/view", dependencies=[Depends(limit_requests(interaction_limiter, "view"))])
def report_view(doc_id: str, db: Session = Depends(get_db)):
    """浏览量 +1（客户端每会话去重，公开文档才计数）。"""
    return ok({"views": doc_service.report_view(db, doc_id)})


@router.post("/{doc_id}/like", dependencies=[Depends(limit_requests(interaction_limiter, "like"))])
def like_doc(doc_id: str, payload: LikePayload | None = None, db: Session = Depends(get_db)):
    """点赞/取消点赞（客户端本地存储去重，公开文档才可赞）。liked=False 撤销点赞。"""
    # 兼容旧客户端：不带 body 视为点赞
    liked = payload.liked if payload is not None else True
    return ok({"likes": doc_service.set_like(db, doc_id, liked)})
