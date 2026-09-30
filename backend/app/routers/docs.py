import time
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Doc, User
from ..rate_limit import SlidingWindowLimiter, limit_requests
from ..schemas import DocMutationPayload, ok
from ..security import get_current_user

router = APIRouter()

# 阅读量/点赞是公开写接口，按来源限流防止脚本刷量（正常阅读每篇每会话只上报一次）
interaction_limiter = SlidingWindowLimiter(max_events=30, window_seconds=60)


def serialize_doc(doc: Doc, *, include_content: bool = True) -> dict:
    data = {
        "id": doc.id,
        "title": doc.title,
        "summary": doc.summary or "",
        "tags": list(doc.tags or []),
        "createTime": doc.create_time,
        "views": doc.views,
        "likes": doc.likes,
        "status": doc.status,
    }

    if include_content:
        data["content"] = doc.content or ""

    return data


def create_doc_id() -> str:
    millis = int(time.time() * 1000)
    return f"doc-{millis}-{uuid.uuid4().hex[:6]}"


def get_doc_or_404(db: Session, doc_id: str) -> Doc:
    doc = db.get(Doc, doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


def list_doc_rows(db: Session, *, published_only: bool) -> list:
    """列表只取轻量列；content 是 70KB+ 大字段，整列拉取会让跨区链路的列表接口超时。"""
    query = db.query(
        Doc.id,
        Doc.title,
        Doc.summary,
        Doc.tags,
        Doc.create_time,
        Doc.views,
        Doc.likes,
        Doc.status,
    )
    if published_only:
        query = query.filter(Doc.status == "published")
    return query.order_by(Doc.create_time.desc(), Doc.id.desc()).all()


@router.get("")
def list_docs(response: Response, db: Session = Depends(get_db)):
    """公开列表：只返回已发布文档，不查询/不返回全文 content，点开某篇时用单篇接口加载。"""
    response.headers["Cache-Control"] = "public, max-age=30"
    rows = list_doc_rows(db, published_only=True)
    return ok([serialize_doc(row, include_content=False) for row in rows])


@router.get("/manage")
def manage_docs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """后台列表：全部文档（含草稿），带浏览量/点赞/状态。"""
    rows = list_doc_rows(db, published_only=False)
    return ok([serialize_doc(row, include_content=False) for row in rows])


@router.get("/{doc_id}")
def get_doc(doc_id: str, response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "public, max-age=60"
    doc = get_doc_or_404(db, doc_id)

    if doc.status != "published":
        # 单篇详情对草稿同样返回 404，避免未发布内容被直接链接访问
        raise HTTPException(status_code=404, detail="文档不存在")

    return ok(serialize_doc(doc))


@router.post("")
def create_doc(
    payload: DocMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = Doc(
        id=create_doc_id(),
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        tags=list(payload.tags),
        create_time=date.today().isoformat(),
        status=payload.status,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return ok(serialize_doc(doc), "创建成功")


@router.put("/{doc_id}")
def update_doc(
    doc_id: str,
    payload: DocMutationPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = get_doc_or_404(db, doc_id)
    doc.title = payload.title
    doc.summary = payload.summary
    doc.content = payload.content
    doc.tags = list(payload.tags)
    doc.status = payload.status
    db.commit()
    db.refresh(doc)
    return ok(serialize_doc(doc), "更新成功")


@router.delete("/{doc_id}")
def delete_doc(
    doc_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = get_doc_or_404(db, doc_id)
    db.delete(doc)
    db.commit()
    return ok({"success": True}, "删除成功")


@router.post("/{doc_id}/view", dependencies=[Depends(limit_requests(interaction_limiter, "view"))])
def report_view(doc_id: str, db: Session = Depends(get_db)):
    """浏览量 +1（客户端每会话去重，公开文档才计数）。"""
    doc = get_doc_or_404(db, doc_id)

    if doc.status != "published":
        raise HTTPException(status_code=404, detail="文档不存在")

    doc.views = doc.views + 1
    db.commit()
    db.refresh(doc)
    return ok({"views": doc.views})


@router.post("/{doc_id}/like", dependencies=[Depends(limit_requests(interaction_limiter, "like"))])
def like_doc(doc_id: str, db: Session = Depends(get_db)):
    """点赞 +1（客户端本地存储去重，公开文档才可赞）。"""
    doc = get_doc_or_404(db, doc_id)

    if doc.status != "published":
        raise HTTPException(status_code=404, detail="文档不存在")

    doc.likes = doc.likes + 1
    db.commit()
    db.refresh(doc)
    return ok({"likes": doc.likes})
