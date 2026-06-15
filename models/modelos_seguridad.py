from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class Rol(Base):
    __tablename__ = "rol"
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)

class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True, index=True)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"))
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    estado = Column(Boolean, default=True)

class Cliente(Base):
    __tablename__ = "cliente"
    id_cliente = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    dni = Column(String(15), unique=True)
    nombres = Column(String(100))
    apellidos = Column(String(100))
    telefono = Column(String(20))
    direccion_principal = Column(String(200))

class Empleado(Base):
    __tablename__ = "empleado"
    id_empleado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    nombres = Column(String(100))
    apellidos = Column(String(100))
    turno = Column(String(50))