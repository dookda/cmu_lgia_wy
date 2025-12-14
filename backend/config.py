from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # PostgreSQL
    pg_host: str = "postgis"
    pg_user: str = "postgres"
    pg_password: str = "1234"
    pg_name: str = "postgres"
    pg_port: int = 5432

    # JWT
    jwt_secret: str = "lgiadev"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
