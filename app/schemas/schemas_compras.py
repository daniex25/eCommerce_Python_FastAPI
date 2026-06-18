from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


# ── Proveedor ──────────────────────────────────────────────────────────────
class ProveedorBase(BaseModel):
    razonSocial: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correoElectronico: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    rucProveedor: str


class ProveedorUpdate(BaseModel):
    razonSocial: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correoElectronico: Optional[str] = None


class ProveedorResponse(ProveedorBase):
    rucProveedor: str
    model_config = ConfigDict(from_attributes=True)


# ── OrdenDeCompra ──────────────────────────────────────────────────────────
class OrdenCompraBase(BaseModel):
    rucProveedor: Optional[str] = None
    fechaEmision: Optional[date] = None
    montoTotal: Optional[float] = None
    estado: Optional[str] = None


class OrdenCompraCreate(OrdenCompraBase):
    pass


class OrdenCompraUpdate(BaseModel):
    rucProveedor: Optional[str] = None
    fechaEmision: Optional[date] = None
    montoTotal: Optional[float] = None
    estado: Optional[str] = None


class OrdenCompraResponse(OrdenCompraBase):
    numeroOrden: int
    model_config = ConfigDict(from_attributes=True)


# ── DetalleOrdenCompra ─────────────────────────────────────────────────────
class DetalleOrdenBase(BaseModel):
    numeroOrden: int
    codigoProducto: int
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetalleOrdenCreate(DetalleOrdenBase):
    pass


class DetalleOrdenUpdate(BaseModel):
    numeroOrden: Optional[int] = None
    codigoProducto: Optional[int] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None


class DetalleOrdenResponse(DetalleOrdenBase):
    idDetalleOrden: int
    model_config = ConfigDict(from_attributes=True)
