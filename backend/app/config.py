from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MySQL（Aiven）连接串，例如：
    # mysql+pymysql://avnadmin:password@xxx.aivencloud.com:12345/defaultdb
    database_url: str = "mysql+pymysql://root:root@127.0.0.1:3306/velpro_blog"
    # Aiven CA 证书路径（相对项目根或绝对路径），留空则跳过证书验证
    db_ssl_ca_path: str = "backend/certs/ca.pem"

    # 环境变量/secret 粘贴时常带行尾换行，导致 "Incorrect database name 'xxx\n'"
    @field_validator("database_url", "db_ssl_ca_path", mode="after")
    @classmethod
    def strip_env_value(cls, value: str) -> str:
        return value.strip()

    # 站点对外地址（RSS 等订阅内容的链接前缀）
    site_url: str = "https://www.velpro.xyz"

    # 运行环境：development / production。
    # 显式设为 production 时，启动会校验 JWT_SECRET 不是默认值（见 main.verify_security_config）
    environment: str = "development"

    # 允许跨域的来源（逗号分隔）。前后端同域部署（Vercel 的默认形态）时浏览器不会触发跨域，
    # 默认只放行本地开发端口；前后端分域部署时用 CORS_ORIGINS 显式追加自己的域名。
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
    )

    jwt_secret: str = "please-change-me"
    jwt_expire_hours: int = 24 * 7

    # 首次启动/seed 时创建的管理员账号；admin_password 为空则不创建
    admin_username: str = "velpro"
    admin_password: str = ""
    admin_name: str = "Velpro"
    admin_avatar: str = "https://api.dicebear.com/9.x/glass/svg?seed=Velpro"
    admin_tagline: str = "Frontend Engineer"

    # 智谱 GLM（Longcat）配置，兼容旧的 ZHIPU_/VITE_ 前缀环境变量
    longcat_api_key: str = Field(
        default="",
        validation_alias=AliasChoices(
            "LONGCAT_API_KEY", "ZHIPU_API_KEY", "VITE_LONGCAT_API_KEY", "VITE_ZHIPU_API_KEY"
        ),
    )
    longcat_base_url: str = Field(
        default="https://open.bigmodel.cn/api/paas/v4",
        validation_alias=AliasChoices(
            "LONGCAT_BASE_URL", "ZHIPU_BASE_URL", "VITE_LONGCAT_BASE_URL", "VITE_ZHIPU_BASE_URL"
        ),
    )
    longcat_model: str = Field(
        default="glm-4-flash-250414",
        validation_alias=AliasChoices("LONGCAT_MODEL", "ZHIPU_MODEL", "VITE_LONGCAT_MODEL", "VITE_ZHIPU_MODEL"),
    )

    @property
    def longcat_chat_url(self) -> str:
        return f"{self.longcat_base_url.rstrip('/')}/chat/completions"

    @property
    def cors_origin_list(self) -> list[str]:
        """解析 CORS_ORIGINS，并始终带上站点自身来源。"""
        origins = [item.strip() for item in self.cors_origins.split(",") if item.strip()]
        site = self.site_url.rstrip("/")
        if site and site not in origins:
            origins.append(site)
        return origins

    @property
    def is_explicit_production(self) -> bool:
        return self.environment.strip().lower() in {"production", "prod"}

    @property
    def jwt_secret_is_default(self) -> bool:
        return self.jwt_secret.strip() in {"", "please-change-me"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
