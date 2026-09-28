"""把"项目展示"和"个人介绍"页的静态数据导入 MySQL（可重复执行，按 id 覆盖）。

用法：python scripts/seed_content.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.models import Project, SiteProfile  # noqa: E402

PROJECTS = [
    {
        "id": "cvita",
        "title": "CVita - AI 心理健康助手",
        "summary": "基于 Vue 3 的 AI 心理健康服务平台，整合智能对话、情绪日记、内容知识库与运营分析能力。",
        "cover": "",
        "category": "AI 服务平台",
        "period": "2026.01 - 2026.03",
        "role": "负责前端架构设计与核心模块开发，覆盖用户端与后台内容管理端。",
        "techStacks": ["Vue 3", "Vite", "Element Plus", "Pinia", "Vue Router", "ECharts", "Axios", "SSE"],
        "highlights": ["SSE 流式对话", "情绪识别与风险分级", "知识库 CMS + 数据分析后台"],
        "features": [
            "支持多会话 AI 对话与历史记录检索",
            "支持情绪日志记录、趋势分析与反馈建议",
            "支持内容发布、编辑、标签管理与图文预览",
            "通过数据看板可视化核心业务指标",
        ],
        "outcomes": [
            "形成用户端与后台端协同闭环",
            "显著提升内容运营效率与分析效率",
            "完成可持续迭代的前端工程结构",
        ],
        "responsibilities": [
            "独立负责前端架构设计与核心模块拆分，完成用户端与后台管理端的页面搭建",
            "实现基于 SSE 的流式 AI 对话、情绪识别与风险预警反馈链路",
            "开发情绪日记、知识库 CMS、数据可视化看板等核心业务模块",
            "封装请求拦截、路由守卫与通用组件，统一权限控制与交互反馈",
        ],
        "metrics": [
            {"label": "核心模块", "value": "4 大类"},
            {"label": "风险分级", "value": "4 级"},
            {"label": "情绪标签", "value": "8 类"},
        ],
        "sortOrder": 0,
    },
    {
        "id": "cvita-resume-platform",
        "title": "CVita 在线简历生成平台",
        "summary": "一款纯前端、零后端依赖的在线简历生成工具，支持简历编辑、实时预览、模板切换、PDF 导出与 JSON 备份，强调低门槛、隐私安全与跨设备使用体验。",
        "cover": "",
        "category": "前端工具 SaaS",
        "period": "2025",
        "role": "独立负责产品设计、前端架构与核心功能开发，完成首页、模板中心、编辑器、预览页与部署上线全流程。",
        "techStacks": ["Vue 3", "Vite 8", "Vue Router 4", "Element Plus", "Tailwind CSS", "GSAP 3", "html2canvas", "jsPDF"],
        "highlights": ["纯前端零后端依赖", "6 套模板一键切换", "PDF 导出 + JSON 导入导出"],
        "features": [
            "设计统一数据 Schema，支持教育背景、项目经历、技能特长等 9 类简历模块灵活配置",
            "实现左右分栏实时预览编辑器，左侧表单编辑与右侧 A4 简历预览同步更新",
            "基于 html2canvas + jsPDF 实现高精度 PDF 导出，并处理字体加载、分页切割与图片兼容问题",
            "支持 LocalStorage 本地持久化、JSON 导入导出、模块拖拽排序、深色模式与响应式布局",
        ],
        "outcomes": [
            "形成从首页引导、模板选择、内容编辑到导出交付的完整产品闭环",
            "在纯前端架构下兼顾了隐私安全、部署成本与可扩展性",
            "适合作为前端工程化、交互设计与工具型 SaaS 产品能力的综合展示案例",
        ],
        "responsibilities": [
            "独立完成产品架构设计与前端工程搭建，覆盖首页、模板中心、编辑器与预览页四大核心模块",
            "设计统一数据 Schema，支持 9 类简历模块配置，并通过 LocalStorage 实现本地持久化存储",
            "开发所见即所得的双栏编辑器与 6 套模板切换能力，保证数据无损迁移与跨模板复用",
            "基于 html2canvas + jsPDF 实现高精度 PDF 导出，并补齐 JSON 导入导出、模块拖拽、深色模式等体验能力",
        ],
        "metrics": [
            {"label": "模板数量", "value": "6 套"},
            {"label": "简历模块", "value": "9 类"},
            {"label": "导出能力", "value": "PDF / JSON"},
        ],
        "sortOrder": 1,
    },
    {
        "id": "medical-mini-program",
        "title": "医疗陪诊服务小程序",
        "summary": "基于 UniApp + Vue 3 的陪诊服务小程序，提供陪诊、取药、送检等服务场景下的完整下单流程。",
        "cover": "",
        "category": "微信小程序",
        "period": "2026.03 - 2026.04",
        "role": "独立负责项目架构、核心业务功能开发与微信生态能力接入。",
        "techStacks": ["UniApp", "Vue 3", "Composition API", "Vite", "SCSS"],
        "highlights": ["多服务类型下单", "订单全生命周期管理", "登录/导航/支付能力接入"],
        "features": [
            "支持陪诊、代取药、送结果等多类型服务下单",
            "支持订单创建、支付倒计时、状态流转与取消",
            "支持就诊人信息管理与复用",
            "封装导航栏、时间选择器、倒计时等业务组件",
        ],
        "outcomes": [
            "打通从浏览到下单支付的完整链路",
            "建立统一一致的小程序交互体验",
            "为后续多平台适配保留扩展空间",
        ],
        "responsibilities": [
            "负责小程序整体页面架构与组件化方案设计，组织核心业务流程",
            "实现多服务类型差异化下单、订单状态流转与支付倒计时能力",
            "接入微信登录、地址选择、导航等原生能力，完善用户服务链路",
            "封装导航栏、日期时间选择器、倒计时与分享弹窗等业务组件",
        ],
        "metrics": [
            {"label": "服务类型", "value": "6 种"},
            {"label": "业务组件", "value": "5+"},
            {"label": "闭环流程", "value": "下单到履约"},
        ],
        "sortOrder": 2,
    },
]

SITE_PROFILE = {
    "id": "main",
    "name": "李登凯",
    "target": "前端开发工程师",
    "summary": "专注 Vue 3、企业后台与内容平台建设，关注工程化质量、业务闭环与用户体验。",
    "contacts": [
        {"label": "手机号", "value": "17651707339", "href": ""},
        {"label": "邮箱", "value": "k2280406@163.com", "href": ""},
        {"label": "GitHub", "value": "https://github.com/verlpro228/velpro-blog", "href": ""},
        {"label": "博客", "value": "站内知识库", "href": "/knowledge"},
    ],
    "skillGroups": [
        {
            "title": "基础",
            "items": ["HTML5 / CSS3 / JavaScript ES6+", "TypeScript", "响应式布局 / 移动端适配", "HTTP / RESTful API 协作"],
        },
        {
            "title": "框架",
            "items": ["Vue 3", "Pinia / Vuex", "Vue Router", "Element Plus / Vant", "Uniapp"],
        },
        {
            "title": "工程化",
            "items": ["Vite", "Axios 封装", "动态路由与权限控制", "Mock / 状态持久化", "Git / pnpm"],
        },
    ],
    "education": [
        {"school": "河南大学民生学院", "major": "本科 - 数据科学与大数据技术", "period": "2023 - 2027"},
    ],
    "timeline": [
        {
            "id": "1",
            "title": "夯实基础：HTML / CSS / JavaScript 核心语法与 DOM 操作",
            "period": "2025.09 - 2025.11",
            "description": "掌握语义化标签、盒模型、Flex/Grid 布局与响应式设计原则。\n深入理解作用域链、闭包、事件循环和异步编程，建立对浏览器渲染流程的基础认知。",
        },
        {
            "id": "2",
            "title": "网络通信入门：Ajax 请求与前后端数据交互实践",
            "period": "2025.12",
            "description": "熟练使用 fetch 与 axios 发起 HTTP 请求，处理 GET/POST 方法及参数传递。\n理解跨域原理与 JSON 数据解析流程，逐步建立前端客户端视角。",
        },
        {
            "id": "3",
            "title": "框架进阶：Vue 3 组合式 API 与组件化开发体系搭建",
            "period": "2026.01 - 2026.02",
            "description": "系统学习 Composition API、响应式系统与生命周期管理。\n实践单文件组件开发模式，集成 Vue Router 与 Pinia/Vuex 组织页面与状态。",
        },
        {
            "id": "4",
            "title": "工程化落地：从项目实战到架构思维成型",
            "period": "2026.03 - 至今",
            "description": "独立构建包含 H5 用户端与 PC 管理后台的双端应用，覆盖 CRUD、权限控制、订单流程等核心业务。\n引入 Vite、Axios 拦截器、动态路由生成与规范化工程流程，形成完整开发闭环意识。",
        },
    ],
}


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    created, updated = 0, 0
    try:
        for item in PROJECTS:
            project = db.get(Project, item["id"])
            values = {
                "title": item["title"],
                "summary": item["summary"],
                "cover": item["cover"],
                "category": item["category"],
                "period": item["period"],
                "role": item["role"],
                "tech_stacks": item["techStacks"],
                "highlights": item["highlights"],
                "features": item["features"],
                "outcomes": item["outcomes"],
                "responsibilities": item["responsibilities"],
                "metrics": item["metrics"],
                "sort_order": item["sortOrder"],
            }
            if project:
                for key, value in values.items():
                    setattr(project, key, value)
                updated += 1
            else:
                db.add(Project(id=item["id"], **values))
                created += 1

        profile = db.get(SiteProfile, SITE_PROFILE["id"])
        profile_values = {
            "name": SITE_PROFILE["name"],
            "target": SITE_PROFILE["target"],
            "summary": SITE_PROFILE["summary"],
            "contacts": SITE_PROFILE["contacts"],
            "skill_groups": SITE_PROFILE["skillGroups"],
            "education": SITE_PROFILE["education"],
            "timeline": SITE_PROFILE["timeline"],
        }
        if profile:
            for key, value in profile_values.items():
                setattr(profile, key, value)
        else:
            db.add(SiteProfile(id=SITE_PROFILE["id"], **profile_values))

        db.commit()
    finally:
        db.close()

    print(f"完成：项目新增 {created} 个、更新 {updated} 个，个人介绍已写入")


if __name__ == "__main__":
    main()
