from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


# ── Cliente ────────────────────────────────────────────────────────────────
class ClienteBase(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    dni: Optional[str] = None
    telefono: Optional[str] = None
    correoElectronico: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = True


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    dni: Optional[str] = None
    telefono: Optional[str] = None
    correoElectronico: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None


class ClienteResponse(ClienteBase):
    codigoCliente: int
    model_config = ConfigDict(from_attributes=True)


# ── CarritodeCompras ───────────────────────────────────────────────────────
class CarritoBase(BaseModel):
    codigoCliente: Optional[int] = None
    fechaCreacion: Optional[date] = None
    totalProductos: Optional[int] = 0
    montoEstimado: Optional[float] = None


class CarritoCreate(CarritoBase):
    pass


class CarritoUpdate(BaseModel):
    codigoCliente: Optional[int] = None
    fechaCreacion: Optional[date] = None
    totalProductos: Optional[int] = None
    montoEstimado: Optional[float] = None


class CarritoResponse(CarritoBase):
    codigoCarrito: int
    model_config = ConfigDict(from_attributes=True)


# ── Pedido ─────────────────────────────────────────────────────────────────
class PedidoBase(BaseModel):
    codigoCliente: Optional[int] = None
    fechaPedido: Optional[date] = None
    estadoPedido: Optional[str] = None
    montoTotal: Optional[float] = None
    direccionEntrega: Optional[str] = None


class PedidoCreate(PedidoBase):
    pass


class PedidoUpdate(BaseModel):
    codigoCliente: Optional[int] = None
    fechaPedido: Optional[date] = None
    estadoPedido: Optional[str] = None
    montoTotal: Optional[float] = None
    direccionEntrega: Optional[str] = None


class PedidoResponse(PedidoBase):
    numeroPedido: int
    model_config = ConfigDict(from_attributes=True)


# ── DetallePedido ──────────────────────────────────────────────────────────
class DetallePedidoBase(BaseModel):
    numeroPedido: int
    codigoProducto: int
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetallePedidoCreate(DetallePedidoBase):
    pass


class DetallePedidoUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    codigoProducto: Optional[int] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetallePedidoResponse(DetallePedidoBase):
    idDetallePedido: int
    model_config = ConfigDict(from_attributes=True)


# ── RecetaMedica ───────────────────────────────────────────────────────────
class RecetaBase(BaseModel):
    numeroPedido: Optional[int] = None
    nombrePaciente: Optional[str] = None
    medicoTratante: Optional[str] = None
    fechaEmision: Optional[date] = None
    estado: Optional[str] = None


class RecetaCreate(RecetaBase):
    pass


class RecetaUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    nombrePaciente: Optional[str] = None
    medicoTratante: Optional[str] = None
    fechaEmision: Optional[date] = None
    estado: Optional[str] = None


class RecetaResponse(RecetaBase):
    numeroReceta: int
    model_config = ConfigDict(from_attributes=True)


# ── Repartidor ─────────────────────────────────────────────────────────────
class RepartidorBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    estado: Optional[bool] = True


class RepartidorCreate(RepartidorBase):
    pass


class RepartidorUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[bool] = None


class RepartidorResponse(RepartidorBase):
    codigoRepartidor: int
    model_config = ConfigDict(from_attributes=True)


# ── Entrega ────────────────────────────────────────────────────────────────
class EntregaBase(BaseModel):
    numeroPedido: Optional[int] = None
    codigoRepartidor: Optional[int] = None
    fechaEntrega: Optional[date] = None
    direccionEntrega: Optional[str] = None
    estadoEntrega: Optional[str] = None


class EntregaCreate(EntregaBase):
    pass


class EntregaUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    codigoRepartidor: Optional[int] = None
    fechaEntrega: Optional[date] = None
    direccionEntrega: Optional[str] = None
    estadoEntrega: Optional[str] = None


class EntregaResponse(EntregaBase):
    codigoEntrega: int
    model_config = ConfigDict(from_attributes=True)


# ── Pago ───────────────────────────────────────────────────────────────────
class PagoBase(BaseModel):
    numeroPedido: Optional[int] = None
    fechaPago: Optional[date] = None
    monto: Optional[float] = None
    metodoPago: Optional[str] = None
    estadoPago: Optional[str] = None


class PagoCreate(PagoBase):
    pass


class PagoUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    fechaPago: Optional[date] = None
    monto: Optional[float] = None
    metodoPago: Optional[str] = None
    estadoPago: Optional[str] = None


class PagoResponse(PagoBase):
    codigoPago: int
    model_config = ConfigDict(from_attributes=True)


# ── Comprobante ────────────────────────────────────────────────────────────
class ComprobanteBase(BaseModel):
    codigoPago: Optional[int] = None
    tipoComprobante: Optional[str] = None
    fechaEmision: Optional[date] = None
    subtotal: Optional[float] = None
    igv: Optional[float] = None
    total: Optional[float] = None


class ComprobanteCreate(ComprobanteBase):
    numeroComprobante: str


class ComprobanteUpdate(BaseModel):
    codigoPago: Optional[int] = None
    tipoComprobante: Optional[str] = None
    fechaEmision: Optional[date] = None
    subtotal: Optional[float] = None
    igv: Optional[float] = None
    total: Optional[float] = None


class ComprobanteResponse(ComprobanteBase):
    numeroComprobante: str
    model_config = ConfigDict(from_attributes=True)
