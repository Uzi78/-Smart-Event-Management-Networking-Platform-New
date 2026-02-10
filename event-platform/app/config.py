from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # MongoDB
    mongodb_url: str
    database_name: str

    # Stripe
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str

    # PayPal
    paypal_mode: str = "sandbox"
    paypal_client_id: str
    paypal_client_secret: str

    # Email
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    email_from: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # App
    app_url: str
    api_url: str

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> "Settings":
    return Settings()


settings = get_settings()
