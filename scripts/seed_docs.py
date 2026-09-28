"""把静态文档种子数据导入 MySQL（可重复执行，按 id 覆盖更新）。

用法：
    pnpm dlx tsx scripts/export-docs.ts > scripts/docs-seed.json
    python scripts/seed_docs.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.main import ensure_admin_user  # noqa: E402
from backend.app.models import Doc  # noqa: E402

SEED_FILE = Path(__file__).resolve().parent / "docs-seed.json"


def main() -> None:
    if not SEED_FILE.exists():
        sys.exit(
            f"未找到 {SEED_FILE}\n"
            "请先运行：pnpm dlx tsx scripts/export-docs.ts > scripts/docs-seed.json"
        )

    docs = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    Base.metadata.create_all(bind=engine)
    ensure_admin_user()

    db = SessionLocal()
    created, updated = 0, 0
    try:
        for item in docs:
            existing = db.get(Doc, item["id"])
            if existing:
                existing.title = item["title"]
                existing.summary = item.get("summary", "")
                existing.content = item.get("content", "")
                existing.tags = list(item.get("tags", []))
                existing.create_time = item.get("createTime", existing.create_time)
                updated += 1
            else:
                db.add(
                    Doc(
                        id=item["id"],
                        title=item["title"],
                        summary=item.get("summary", ""),
                        content=item.get("content", ""),
                        tags=list(item.get("tags", [])),
                        create_time=item.get("createTime", ""),
                    )
                )
                created += 1
        db.commit()
    finally:
        db.close()

    print(f"完成：新增 {created} 篇，更新 {updated} 篇")


if __name__ == "__main__":
    main()
