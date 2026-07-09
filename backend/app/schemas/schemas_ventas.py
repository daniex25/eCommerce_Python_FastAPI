from pydantic import BaseModel, ConfigDict, Field
from typing import List, Literal, Optional
from datetime import date

EstadoPedido = Literal["Pendiente", "Pagado", "Preparado", "En Ruta", "Entregado", "Incidencia"]
EstadoReceta = Literal["Pendiente", "Aprobada", "Rechazada"]
EstadoPago = Literal["Pendiente", "Aprobado", "Rechazado"]
EstadoSunat = Literal["Pendiente", "Aceptado", "Rechazado"]
TipoComprobante = Literal["Boleta", "Factura"]
MetodoPagoEcommerce = Literal["Yape", "Plin", "Tarjeta", "PagoEfectivo"]
MetodoPagoPOS = Literal["Efectivo", "Yape", "Plin", "Tarjeta"]


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


# ── DetallePedido ──────────────────────────────────────────────────────────
class DetallePedidoBase(BaseModel):
    numeroPedido: int
    codigoProducto: int
    nombreProducto: Optional[str] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetallePedidoCreate(DetallePedidoBase):
    pass


class DetallePedidoUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    codigoProducto: Optional[int] = None
    nombreProducto: Optional[str] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetallePedidoResponse(DetallePedidoBase):
    idDetallePedido: int
    model_config = ConfigDict(from_attributes=True)


# ── Pedido ─────────────────────────────────────────────────────────────────
class PedidoBase(BaseModel):
    codigoCliente: Optional[int] = None
    fechaPedido: Optional[date] = None
    estadoPedido: Optional[EstadoPedido] = None
    montoTotal: Optional[float] = None
    direccionEntrega: Optional[str] = None
    distrito: Optional[str] = None


class PedidoCreate(PedidoBase):
    pass


class PedidoUpdate(BaseModel):
    codigoCliente: Optional[int] = None
    fechaPedido: Optional[date] = None
    estadoPedido: Optional[EstadoPedido] = None
    montoTotal: Optional[float] = None
    direccionEntrega: Optional[str] = None
    distrito: Optional[str] = None


class PedidoResponse(PedidoBase):
    numeroPedido: int
    detalle: List[DetallePedidoResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ── RecetaMedica ───────────────────────────────────────────────────────────
class RecetaBase(BaseModel):
    numeroPedido: Optional[int] = None
    codigoProducto: Optional[int] = None
    codigoCliente: Optional[int] = None
    nombrePaciente: Optional[str] = None
    medicoTratante: Optional[str] = None
    cmpMedico: Optional[str] = None
    fechaEmision: Optional[date] = None
    estado: Optional[EstadoReceta] = None
    imagenUrl: Optional[str] = None


class RecetaCreate(RecetaBase):
    pass


class RecetaUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    codigoProducto: Optional[int] = None
    codigoCliente: Optional[int] = None
    nombrePaciente: Optional[str] = None
    medicoTratante: Optional[str] = None
    cmpMedico: Optional[str] = None
    fechaEmision: Optional[date] = None
    estado: Optional[EstadoReceta] = None
    imagenUrl: Optional[str] = None


class RecetaResponse(RecetaBase):
    numeroReceta: int
    model_config = ConfigDict(from_attributes=True)


class ValidarRecetaRequest(BaseModel):
    """PUT /recetas-medicas/{numero}/validar — CUS104, potestad del Q.F."""

    estado: Literal["Aprobada", "Rechazada"]


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
    estadoPago: Optional[EstadoPago] = None


class PagoCreate(PagoBase):
    pass


class PagoUpdate(BaseModel):
    numeroPedido: Optional[int] = None
    fechaPago: Optional[date] = None
    monto: Optional[float] = None
    metodoPago: Optional[str] = None
    estadoPago: Optional[EstadoPago] = None


class PagoResponse(PagoBase):
    codigoPago: int
    model_config = ConfigDict(from_attributes=True)


# ── Comprobante ────────────────────────────────────────────────────────────
class ComprobanteBase(BaseModel):
    codigoPago: Optional[int] = None
    tipoComprobante: Optional[TipoComprobante] = None
    fechaEmision: Optional[date] = None
    subtotal: Optional[float] = None
    igv: Optional[float] = None
    total: Optional[float] = None
    documentoCliente: Optional[str] = None
    nombreCliente: Optional[str] = None
    serie: Optional[str] = None
    correlativo: Optional[int] = None
    estadoSunat: Optional[EstadoSunat] = None


class ComprobanteCreate(ComprobanteBase):
    numeroComprobante: str


class ComprobanteUpdate(BaseModel):
    codigoPago: Optional[int] = None
    tipoComprobante: Optional[TipoComprobante] = None
    fechaEmision: Optional[date] = None
    subtotal: Optional[float] = None
    igv: Optional[float] = None
    total: Optional[float] = None
    documentoCliente: Optional[str] = None
    nombreCliente: Optional[str] = None
    serie: Optional[str] = None
    correlativo: Optional[int] = None
    estadoSunat: Optional[EstadoSunat] = None


class ComprobanteResponse(ComprobanteBase):
    numeroComprobante: str
    model_config = ConfigDict(from_attributes=True)


# ── Checkout (CUS105 / RS5304, RS5307, RS5308, RN1101) ─────────────────────
class ItemCheckoutRequest(BaseModel):
    codigoProducto: int
    cantidad: int = Field(gt=0)
    numeroReceta: Optional[int] = None


class CheckoutRequest(BaseModel):
    items: List[ItemCheckoutRequest] = Field(min_length=1)
    direccionEntrega: str
    distrito: Optional[str] = None
    metodoPago: MetodoPagoEcommerce
    tipoComprobante: TipoComprobante = "Boleta"
    documentoCliente: Optional[str] = None
    nombreCliente: Optional[str] = None


class CheckoutResponse(BaseModel):
    pedido: PedidoResponse
    pago: PagoResponse
    comprobante: ComprobanteResponse


# ── Venta POS (CUS202 / RS5404, RN1101) ─────────────────────────────────────
class RecetaInlinePOS(BaseModel):
    """Registro de receta física retenida en mostrador (RN1101, alt. 6.1)."""

    nombrePaciente: str
    medicoTratante: str
    cmpMedico: Optional[str] = None
    fechaEmision: Optional[date] = None


class ItemVentaPOSRequest(BaseModel):
    codigoProducto: int
    cantidad: int = Field(gt=0)
    receta: Optional[RecetaInlinePOS] = None


class VentaPOSRequest(BaseModel):
    items: List[ItemVentaPOSRequest] = Field(min_length=1)
    metodoPago: MetodoPagoPOS


class VentaPOSResponse(BaseModel):
    pedido: PedidoResponse
    pago: PagoResponse


# ── Emisión de comprobante (CUS203 / RS5308) ────────────────────────────────
class EmitirComprobanteRequest(BaseModel):
    codigoPago: int
    tipoComprobante: TipoComprobante = "Boleta"
    documentoCliente: Optional[str] = None
    nombreCliente: Optional[str] = None
