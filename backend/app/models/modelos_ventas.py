from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, Date, ForeignKey
from app.db.database import Base


class Cliente(Base):
    __tablename__ = "Cliente"

    codigoCliente = Column(Integer, primary_key=True, autoincrement=True)
    nombres = Column(String(100))
    apellidos = Column(String(100))
    dni = Column(String(15), unique=True)
    telefono = Column(String(20))
    correoElectronico = Column(String(150), unique=True)
    direccion = Column(String(255))
    estado = Column(Boolean, default=True)


class CarritodeCompras(Base):
    __tablename__ = "CarritodeCompras"

    codigoCarrito = Column(Integer, primary_key=True, autoincrement=True)
    codigoCliente = Column(Integer, ForeignKey("Cliente.codigoCliente"))
    fechaCreacion = Column(Date)
    totalProductos = Column(Integer, default=0)
    montoEstimado = Column(DECIMAL(10, 2))


class Pedido(Base):
    __tablename__ = "Pedido"

    numeroPedido = Column(Integer, primary_key=True, autoincrement=True)
    codigoCliente = Column(Integer, ForeignKey("Cliente.codigoCliente"))
    fechaPedido = Column(Date)
    estadoPedido = Column(String(50))
    montoTotal = Column(DECIMAL(10, 2))
    direccionEntrega = Column(String(255))


class DetallePedido(Base):
    __tablename__ = "DetallePedido"

    idDetallePedido = Column(Integer, primary_key=True, autoincrement=True)
    numeroPedido = Column(Integer, ForeignKey("Pedido.numeroPedido"))
    codigoProducto = Column(Integer, ForeignKey("Producto.codigoProducto"))
    cantidad = Column(Integer)
    precioUnitario = Column(DECIMAL(10, 2))
    subtotal = Column(DECIMAL(10, 2))


class RecetaMedica(Base):
    __tablename__ = "RecetaMedica"

    numeroReceta = Column(Integer, primary_key=True, autoincrement=True)
    numeroPedido = Column(Integer, ForeignKey("Pedido.numeroPedido"))
    nombrePaciente = Column(String(150))
    medicoTratante = Column(String(150))
    fechaEmision = Column(Date)
    estado = Column(String(50))


class Repartidor(Base):
    __tablename__ = "Repartidor"

    codigoRepartidor = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    telefono = Column(String(20))
    estado = Column(Boolean, default=True)


class Entrega(Base):
    __tablename__ = "Entrega"

    codigoEntrega = Column(Integer, primary_key=True, autoincrement=True)
    numeroPedido = Column(Integer, ForeignKey("Pedido.numeroPedido"))
    codigoRepartidor = Column(Integer, ForeignKey("Repartidor.codigoRepartidor"))
    fechaEntrega = Column(Date)
    direccionEntrega = Column(String(255))
    estadoEntrega = Column(String(50))


class Pago(Base):
    __tablename__ = "Pago"

    codigoPago = Column(Integer, primary_key=True, autoincrement=True)
    numeroPedido = Column(Integer, ForeignKey("Pedido.numeroPedido"))
    fechaPago = Column(Date)
    monto = Column(DECIMAL(10, 2))
    metodoPago = Column(String(50))
    estadoPago = Column(String(50))


class Comprobante(Base):
    __tablename__ = "Comprobante"

    numeroComprobante = Column(String(20), primary_key=True)
    codigoPago = Column(Integer, ForeignKey("Pago.codigoPago"))
    tipoComprobante = Column(String(50))
    fechaEmision = Column(Date)
    subtotal = Column(DECIMAL(10, 2))
    igv = Column(DECIMAL(10, 2))
    total = Column(DECIMAL(10, 2))
