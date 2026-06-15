from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, Date, ForeignKey, Text # <-- Agrega Text aquí
from database import Base

class Categoria(Base):
    __tablename__ = "categoria"
    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)

class Producto(Base):
    __tablename__ = "producto"
    id_producto = Column(Integer, primary_key=True, index=True)
    id_categoria = Column(Integer, ForeignKey("categoria.id_categoria"))
    codigo_barras = Column(String(50), unique=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)  # <--- AGREGAR ESTA LÍNEA AQUÍ
    precio_venta = Column(DECIMAL(10, 2))
    requiere_receta = Column(Boolean, default=False)
    stock_total = Column(Integer, default=0)

class Lote(Base):
    __tablename__ = "lote"
    id_lote = Column(Integer, primary_key=True, index=True)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"))
    codigo_lote = Column(String(50), nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    stock_lote = Column(Integer, nullable=False)

class Proveedor(Base):
    __tablename__ = "proveedor"
    id_proveedor = Column(Integer, primary_key=True, index=True)
    ruc = Column(String(11), unique=True, index=True)
    razon_social = Column(String(150), nullable=False)
    contacto = Column(String(100))