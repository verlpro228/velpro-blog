import sys
from pathlib import Path

# Vercel Python runtime 以项目根为工作目录，这里兜底保证可导入 backend 包
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.main import app  # noqa: E402,F401
