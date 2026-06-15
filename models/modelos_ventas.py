from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey
from database import Base

class Venta(Base):
    __tablename__ = "venta"
    id_venta = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=True) # Null si es de paso
    id_empleado = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=True) # Null si es web
    tipo_comprobante = Column(String(20)) # Boleta / Factura
    serie = Column(String(10))
    correlativo = Column(String(20))
    fecha_hora = Column(DateTime)
    total = Column(DECIMAL(10, 2))
    origen_venta = Column(String(10)) # WEB / POS
    estado_pago = Column(String(20))

class DetalleVenta(Base):
    __tablename__ = "detalle_venta"
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("venta.id_venta"))
    id_producto = Column(Integer, ForeignKey("producto.id_producto"))
    id_lote = Column(Integer, ForeignKey("lote.id_lote"))
    cantidad = Column(Integer)
    precio_unitario = Column(DECIMAL(10, 2))
    subtotal = Column(DECIMAL(10, 2))

class RecetaMedica(Base):
    __tablename__ = "receta_medica"
    id_receta = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("venta.id_venta"))
    imagen_url = Column(String(255))
    estado_validacion = Column(String(50))
    id_quimico_validador = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=True)

class Envio(Base):
    __tablename__ = "envio"
    id_envio = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("venta.id_venta"))
    id_repartidor = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=True)
    direccion_entrega = Column(String(255))
    estado_envio = Column(String(50))
    fecha_entrega = Column(DateTime, nullable=True)