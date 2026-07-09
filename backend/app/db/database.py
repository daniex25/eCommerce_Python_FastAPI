from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import settings

URL_DATABASE = (
    f"postgresql://{settings.db_username}:{settings.db_password}"
    f"@{settings.db_hostname}:{settings.db_port}/{settings.db_name}"
)

engine = create_engine(URL_DATABASE, echo=settings.debug, pool_size=10, pool_pre_ping=True)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
