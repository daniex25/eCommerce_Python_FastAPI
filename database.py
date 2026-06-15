from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Conexión a tu XAMPP local (por defecto el usuario es 'root' y sin contraseña)
URL_BASE_DATOS = "mysql+pymysql://root:@localhost:3306/botica_central"

engine = create_engine(URL_BASE_DATOS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()