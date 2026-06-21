from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_USE_TLS: bool = True
    SMS_API_URL: str | None = None
    SMS_API_KEY: str | None = None
    SMS_FROM: str | None = None
    SMS_PROVIDER: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_FROM_NUMBER: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
