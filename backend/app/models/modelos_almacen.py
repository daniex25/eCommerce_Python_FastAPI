from sqlalchemy import Column, Integer, String, DECIMAL, Date, Text, ForeignKey
from app.db.database import Base


class Categoria(Base):
    __tablename__ = "Categoria"

    codigoCategoria = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))


class Laboratorio(Base):
    __tablename__ = "Laboratorio"

    codigoLaboratorio = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    pais = Column(String(100))


class Producto(Base):
    __tablename__ = "Producto"

    codigoProducto = Column(Integer, primary_key=True, autoincrement=True)
    codigoCategoria = Column(Integer, ForeignKey("Categoria.codigoCategoria"))
    codigoLaboratorio = Column(Integer, ForeignKey("Laboratorio.codigoLaboratorio"))
    nombreProducto = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precioVenta = Column(DECIMAL(10, 2))
    condicionVenta = Column(String(50))
    stockDisponible = Column(Integer, default=0)


class Lote(Base):
    __tablename__ = "Lote"

    codigoLote = Column(Integer, primary_key=True, autoincrement=True)
    codigoProducto = Column(Integer, ForeignKey("Producto.codigoProducto"))
    numeroLote = Column(String(100), nullable=False, unique=True)
    fechaVencimiento = Column(Date)
    stockDisponible = Column(Integer, default=0)
    estado = Column(String(50))
