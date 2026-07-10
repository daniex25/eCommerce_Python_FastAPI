from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_username: str = "root"
    db_password: str = ""
    db_hostname: str = "localhost"
    db_port: int = 3306
    db_name: str = "botica_central"  # <-- Aquí pon el nombre exacto que le diste a tu base de datos en phpMyAdmin
    debug: bool = False

    # Autenticación (Fase 1 — RS0028, RS0033). En producción, jwt_secret_key
    # debe sobreescribirse en el .env con un valor aleatorio y secreto.
    jwt_secret_key: str = "dev-secret-key-cambiar-en-produccion"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    class Config:
        env_file = ".env"


settings = Settings()
