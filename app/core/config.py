from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_username: str = "postgres"
    db_password: str = "admin"
    db_hostname: str = "localhost"
    db_port: int = 5432
    db_name: str = "eCommerceFastAPIdb"

    class Config:
        env_file = ".env"


settings = Settings()
