"""文档业务逻辑：列表查询、单篇读取、增删改、浏览量与点赞计数。"""

import time
import uuid
from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import Doc
from ..schemas import DocMutationPayload


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


def get_published_doc_or_404(db: Session, doc_id: str) -> Doc:
    """单篇详情用：草稿同样返回 404，避免未发布内容被直接链接访问。"""
    doc = get_doc_or_404(db, doc_id)
    if doc.status != "published":
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


def list_docs(db: Session, *, published_only: bool) -> list[dict]:
    """文档列表（不含正文 content）。"""
    rows = list_doc_rows(db, published_only=published_only)
    return [serialize_doc(row, include_content=False) for row in rows]


def create_doc(db: Session, payload: DocMutationPayload) -> Doc:
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
    return doc


def update_doc(db: Session, doc_id: str, payload: DocMutationPayload) -> Doc:
    doc = get_doc_or_404(db, doc_id)
    doc.title = payload.title
    doc.summary = payload.summary
    doc.content = payload.content
    doc.tags = list(payload.tags)
    doc.status = payload.status
    db.commit()
    db.refresh(doc)
    return doc


def delete_doc(db: Session, doc_id: str) -> None:
    doc = get_doc_or_404(db, doc_id)
    db.delete(doc)
    db.commit()


def report_view(db: Session, doc_id: str) -> int:
    """浏览量 +1（客户端每会话去重，公开文档才计数）。"""
    doc = get_published_doc_or_404(db, doc_id)
    doc.views = doc.views + 1
    db.commit()
    db.refresh(doc)
    return doc.views


def set_like(db: Session, doc_id: str, liked: bool) -> int:
    """点赞/取消点赞，点赞数不会减到负数。"""
    doc = get_published_doc_or_404(db, doc_id)
    if liked:
        doc.likes = doc.likes + 1
    else:
        doc.likes = max(0, doc.likes - 1)
    db.commit()
    db.refresh(doc)
    return doc.likes
