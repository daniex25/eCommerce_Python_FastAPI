from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional
from datetime import date

CondicionVenta = Literal["Venta Libre", "Bajo Receta"]
EstadoLote = Literal["Vigente", "Por Vencer", "Vencido", "Cuarentena"]


# ── Categoria ──────────────────────────────────────────────────────────────
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class CategoriaResponse(CategoriaBase):
    codigoCategoria: int
    model_config = ConfigDict(from_attributes=True)


# ── Laboratorio ────────────────────────────────────────────────────────────
class LaboratorioBase(BaseModel):
    nombre: str
    pais: Optional[str] = None


class LaboratorioCreate(LaboratorioBase):
    pass


class LaboratorioUpdate(BaseModel):
    nombre: Optional[str] = None
    pais: Optional[str] = None


class LaboratorioResponse(LaboratorioBase):
    codigoLaboratorio: int
    model_config = ConfigDict(from_attributes=True)


# ── Producto ───────────────────────────────────────────────────────────────
class ProductoBase(BaseModel):
    codigoCategoria: Optional[int] = None
    codigoLaboratorio: Optional[int] = None
    nombreProducto: str
    descripcion: Optional[str] = None
    precioVenta: Optional[float] = None
    condicionVenta: Optional[CondicionVenta] = None
    stockDisponible: Optional[int] = 0
    stockMinimo: Optional[int] = 10
    imagenUrl: Optional[str] = None
    presentacion: Optional[str] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigoCategoria: Optional[int] = None
    codigoLaboratorio: Optional[int] = None
    nombreProducto: Optional[str] = None
    descripcion: Optional[str] = None
    precioVenta: Optional[float] = None
    condicionVenta: Optional[CondicionVenta] = None
    stockDisponible: Optional[int] = None
    stockMinimo: Optional[int] = None
    imagenUrl: Optional[str] = None
    presentacion: Optional[str] = None


class ProductoResponse(ProductoBase):
    codigoProducto: int
    model_config = ConfigDict(from_attributes=True)


# ── Lote ───────────────────────────────────────────────────────────────────
class LoteBase(BaseModel):
    codigoProducto: int
    numeroLote: str
    fechaVencimiento: Optional[date] = None
    stockDisponible: Optional[int] = 0
    estado: Optional[EstadoLote] = None


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    codigoProducto: Optional[int] = None
    numeroLote: Optional[str] = None
    fechaVencimiento: Optional[date] = None
    stockDisponible: Optional[int] = None
    estado: Optional[EstadoLote] = None


class LoteResponse(LoteBase):
    codigoLote: int
    model_config = ConfigDict(from_attributes=True)
