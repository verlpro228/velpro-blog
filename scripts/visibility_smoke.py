"""临时验证：可见性开关 + 编辑保存不会重置可见性。"""

import httpx

BASE = "http://127.0.0.1:8000/api"
token = httpx.post(
    f"{BASE}/auth/login",
    json={"username": "admin", "password": "123456"},
    timeout=20,
).json()["data"]["token"]
headers = {"Authorization": f"Bearer {token}"}

# 1. 恢复我测试时隐藏的 velpro-blog
response = httpx.put(
    f"{BASE}/projects/velpro-blog/visibility", json={"visible": True}, headers=headers, timeout=20
).json()
print("restore velpro-blog ->", response["message"], "| visible:", response["data"]["visible"])

# 2. 模拟前端编辑保存一个隐藏中的项目（payload 不含 visible），可见性不应被重置
manage = httpx.get(f"{BASE}/projects/manage", headers=headers, timeout=20).json()["data"]
target = next(item for item in manage if item["id"] == "cvita")
print("before edit | cvita visible:", target["visible"])

payload = {
    key: target[key]
    for key in (
        "title",
        "summary",
        "cover",
        "category",
        "period",
        "role",
        "techStacks",
        "highlights",
        "features",
        "outcomes",
        "responsibilities",
        "metrics",
        "sortOrder",
    )
}
updated = httpx.put(f"{BASE}/projects/cvita", json=payload, headers=headers, timeout=20).json()
print("after edit | cvita visible:", updated["data"]["visible"])
assert updated["data"]["visible"] is False, "编辑保存把可见性重置了！"
print("PASS: 编辑保存不会重置可见性")

# 3. 当前状态汇总
final = httpx.get(f"{BASE}/projects/manage", headers=headers, timeout=20).json()["data"]
print("--- final state ---")
for item in final:
    print("VISIBLE" if item["visible"] else "HIDDEN ", "|", item["sortOrder"], item["title"])
