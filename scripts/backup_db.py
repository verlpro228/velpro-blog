"""数据库内容备份：导出 docs / projects / site_profile 三张表为 JSON。

注意：**绝不导出 users 表**（含密码哈希），本仓库为公开仓库。

用法：
  python scripts/backup_db.py
连接串从环境变量 DATABASE_URL 或项目根目录 .env 读取（与后端共用一套配置）。
输出：backups/backup-YYYY-MM-DD.json
"""

import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import text

from backend.app.database import SessionLocal

TABLES = [
    ("docs", "create_time DESC, id"),
    ("projects", "sort_order, id"),
    ("site_profile", "id"),
]


def dump_table(db, table: str, order_by: str) -> list[dict]:
    rows = db.execute(text(f"SELECT * FROM {table} ORDER BY {order_by}")).mappings().all()
    return [dict(row) for row in rows]


def main() -> None:
    out_dir = ROOT_DIR / "backups"
    out_dir.mkdir(exist_ok=True)
    output = out_dir / f"backup-{date.today().isoformat()}.json"

    db = SessionLocal()
    try:
        payload = {
            "exportedAt": datetime.now(timezone.utc).isoformat(),
            **{table: dump_table(db, table, order_by) for table, order_by in TABLES},
        }
    finally:
        db.close()

    output.write_text(
        json.dumps(payload, ensure_ascii=False, default=str, indent=2),
        encoding="utf-8",
    )
    print(
        "备份完成："
        f"{output}（docs={len(payload['docs'])} projects={len(payload['projects'])} "
        f"site_profile={len(payload['site_profile'])}）"
    )


if __name__ == "__main__":
    main()
