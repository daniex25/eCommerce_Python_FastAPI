from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_username: postgres
    db_password: admin
    db_hostname: localhost
    db_port: 5432
    db_name: eCommerceFastAPIdb