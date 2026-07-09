from sqlalchemy import Column, Integer, String, DECIMAL, Date, ForeignKey
from app.db.database import Base


class Proveedor(Base):
    __tablename__ = "Proveedor"

    rucProveedor = Column(String(11), primary_key=True)
    razonSocial = Column(String(200), nullable=False)
    direccion = Column(String(255))
    telefono = Column(String(20))
    correoElectronico = Column(String(150))


class OrdenDeCompra(Base):
    __tablename__ = "OrdenDeCompra"

    numeroOrden = Column(Integer, primary_key=True, autoincrement=True)
    rucProveedor = Column(String(11), ForeignKey("Proveedor.rucProveedor"))
    fechaEmision = Column(Date)
    montoTotal = Column(DECIMAL(10, 2))
    estado = Column(String(50))


class DetalleOrdenCompra(Base):
    __tablename__ = "DetalleOrdenCompra"

    idDetalleOrden = Column(Integer, primary_key=True, autoincrement=True)
    numeroOrden = Column(Integer, ForeignKey("OrdenDeCompra.numeroOrden"))
    codigoProducto = Column(Integer, ForeignKey("Producto.codigoProducto"))
    cantidad = Column(Integer)
    precioUnitario = Column(DECIMAL(10, 2))
    subtotal = Column(DECIMAL(10, 2))
