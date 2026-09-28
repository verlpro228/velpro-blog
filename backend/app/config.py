from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
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


@lru_cache
def get_settings() -> Settings:
    return Settings()
