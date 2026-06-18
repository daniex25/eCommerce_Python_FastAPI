from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


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
    condicionVenta: Optional[str] = None
    stockDisponible: Optional[int] = 0


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigoCategoria: Optional[int] = None
    codigoLaboratorio: Optional[int] = None
    nombreProducto: Optional[str] = None
    descripcion: Optional[str] = None
    precioVenta: Optional[float] = None
    condicionVenta: Optional[str] = None
    stockDisponible: Optional[int] = None


class ProductoResponse(ProductoBase):
    codigoProducto: int
    model_config = ConfigDict(from_attributes=True)


# ── Lote ───────────────────────────────────────────────────────────────────
class LoteBase(BaseModel):
    codigoProducto: int
    numeroLote: str
    fechaVencimiento: Optional[date] = None
    stockDisponible: Optional[int] = 0
    estado: Optional[str] = None


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    codigoProducto: Optional[int] = None
    numeroLote: Optional[str] = None
    fechaVencimiento: Optional[date] = None
    stockDisponible: Optional[int] = None
    estado: Optional[str] = None


class LoteResponse(LoteBase):
    codigoLote: int
    model_config = ConfigDict(from_attributes=True)
