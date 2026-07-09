from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_username: str = "postgres"
    db_password: str = "admin"
    db_hostname: str = "localhost"
    db_port: int = 5432
    db_name: str = "eCommerceFastAPIdb"
    debug: bool = False

    # Autenticación (Fase 1 — RS0028, RS0033). En producción, jwt_secret_key
    # debe sobreescribirse en el .env con un valor aleatorio y secreto.
    jwt_secret_key: str = "dev-secret-key-cambiar-en-produccion"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    class Config:
        env_file = ".env"


settings = Settings()
