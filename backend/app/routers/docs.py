import time
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Doc, User
from ..schemas import DocMutationPayload, ok
from ..security import get_current_user

router = APIRouter()


def serialize_doc(doc: Doc) -> dict:
    return {
        "id": doc.id,
        "title": doc.title,
        "summary": doc.summary or "",
        "content": doc.content or "",
        "tags": list(doc.tags or []),
        "createTime": doc.create_time,
    }


def create_doc_id() -> str:
    millis = int(time.time() * 1000)
    return f"doc-{millis}-{uuid.uuid4().hex[:6]}"


def get_doc_or_404(db: Session, doc_id: str) -> Doc:
    doc = db.get(Doc, doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.get("")
def list_docs(response: Response, db: Session = Depends(get_db)):
    """列表接口不查询/不返回全文 content（70KB+ 的大字段），点开某篇时用单篇接口加载。"""
    response.headers["Cache-Control"] = "public, max-age=30"
    rows = (
        db.query(Doc.id, Doc.title, Doc.summary, Doc.tags, Doc.create_time)
        .order_by(Doc.create_time.desc(), Doc.id.desc())
        .all()
    )
    return ok(
        [
            {
                "id": row.id,
                "title": row.title,
                "summary": row.summary or "",
                "content": "",
                "tags": list(row.tags or []),
                "createTime": row.create_time,
            }
            for row in rows
        ]
    )


@router.get("/{doc_id}")
def get_doc(doc_id: str, response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "public, max-age=60"
    doc = get_doc_or_404(db, doc_id)
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
