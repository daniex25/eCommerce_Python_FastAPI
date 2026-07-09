from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from app.db.database import Base


class Usuario(Base):
    __tablename__ = "Usuario"

    codigoUsuario = Column(Integer, primary_key=True, autoincrement=True)
    nombres = Column(String(150), nullable=False)
    correoElectronico = Column(String(150), nullable=False, unique=True)
    passwordHash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)
    estado = Column(Boolean, default=True, nullable=False)
    codigoCliente = Column(Integer, ForeignKey("Cliente.codigoCliente"), nullable=True)
    fechaCreacion = Column(DateTime, server_default=func.now())
    ultimoAcceso = Column(DateTime, nullable=True)


class RegistroAuditoria(Base):
    __tablename__ = "RegistroAuditoria"

    codigoRegistro = Column(Integer, primary_key=True, autoincrement=True)
    codigoUsuario = Column(Integer, ForeignKey("Usuario.codigoUsuario"), nullable=True)
    correoUsuario = Column(String(150), nullable=False)
    accion = Column(String(100), nullable=False)
    entidad = Column(String(100), nullable=True)
    entidadId = Column(String(50), nullable=True)
    resultado = Column(String(20), nullable=False)
    detalle = Column(Text, nullable=True)
    fechaHora = Column(DateTime, server_default=func.now(), nullable=False)
