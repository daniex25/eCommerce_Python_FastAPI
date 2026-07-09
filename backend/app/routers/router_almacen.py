from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.deps import require_role
from app.db.database import get_db
from app.models.modelos_almacen import Categoria, Laboratorio, Producto, Lote
from app.schemas.schemas_almacen import (
    CategoriaCreate, CategoriaUpdate, CategoriaResponse,
    LaboratorioCreate, LaboratorioUpdate, LaboratorioResponse,
    ProductoCreate, ProductoUpdate, ProductoResponse,
    LoteCreate, LoteUpdate, LoteResponse,
)

router = APIRouter()

# Gestión de catálogo (crear/editar/eliminar productos, categorías,
# laboratorios) y de lotes: reservada a Administrador y Encargado de
# Almacén (RS0029). La consulta del catálogo (GET) permanece pública
# porque es la base de CUS102 — Consultar catálogo.
STAFF_ALMACEN = ("Administrador", "Encargado de Almacén", "Administrador del Sistema")
STAFF_CONSULTA_LOTES = STAFF_ALMACEN + ("Químico Farmacéutico", "Técnico de Farmacia")


# ── Categorias ─────────────────────────────────────────────────────────────
@router.get("/categorias", response_model=List[CategoriaResponse], tags=["Categorias"])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()


@router.get("/categorias/{codigo}", response_model=CategoriaResponse, tags=["Categorias"])
def obtener_categoria(codigo: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.codigoCategoria == codigo).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.post(
    "/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED,
    tags=["Categorias"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = Categoria(**data.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put(
    "/categorias/{codigo}", response_model=CategoriaResponse,
    tags=["Categorias"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def actualizar_categoria(codigo: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.codigoCategoria == codigo).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(categoria, campo, valor)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete(
    "/categorias/{codigo}", status_code=status.HTTP_204_NO_CONTENT,
    tags=["Categorias"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def eliminar_categoria(codigo: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.codigoCategoria == codigo).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()


# ── Laboratorios ───────────────────────────────────────────────────────────
@router.get("/laboratorios", response_model=List[LaboratorioResponse], tags=["Laboratorios"])
def listar_laboratorios(db: Session = Depends(get_db)):
    return db.query(Laboratorio).all()


@router.get("/laboratorios/{codigo}", response_model=LaboratorioResponse, tags=["Laboratorios"])
def obtener_laboratorio(codigo: int, db: Session = Depends(get_db)):
    lab = db.query(Laboratorio).filter(Laboratorio.codigoLaboratorio == codigo).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")
    return lab


@router.post(
    "/laboratorios", response_model=LaboratorioResponse, status_code=status.HTTP_201_CREATED,
    tags=["Laboratorios"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def crear_laboratorio(data: LaboratorioCreate, db: Session = Depends(get_db)):
    lab = Laboratorio(**data.model_dump())
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab


@router.put(
    "/laboratorios/{codigo}", response_model=LaboratorioResponse,
    tags=["Laboratorios"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def actualizar_laboratorio(codigo: int, data: LaboratorioUpdate, db: Session = Depends(get_db)):
    lab = db.query(Laboratorio).filter(Laboratorio.codigoLaboratorio == codigo).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(lab, campo, valor)
    db.commit()
    db.refresh(lab)
    return lab


@router.delete(
    "/laboratorios/{codigo}", status_code=status.HTTP_204_NO_CONTENT,
    tags=["Laboratorios"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def eliminar_laboratorio(codigo: int, db: Session = Depends(get_db)):
    lab = db.query(Laboratorio).filter(Laboratorio.codigoLaboratorio == codigo).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")
    db.delete(lab)
    db.commit()


# ── Productos ──────────────────────────────────────────────────────────────
@router.get("/productos", response_model=List[ProductoResponse], tags=["Productos"])
def listar_productos(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Nombre o código del producto (RS5202)"),
    categoria: Optional[int] = Query(None, description="codigoCategoria (RS5203)"),
    laboratorio: Optional[int] = Query(None, description="codigoLaboratorio (RS5203)"),
    precioMax: Optional[float] = Query(None, ge=0, description="Precio máximo (RS5203)"),
    soloDisponibles: bool = Query(False, description="Solo productos con stock > 0"),
):
    """CUS102 — Consultar catálogo. Filtros combinables por nombre/código,
    categoría, laboratorio, precio máximo y disponibilidad."""
    consulta = db.query(Producto)
    if search:
        termino = search.strip()
        if termino.isdigit():
            consulta = consulta.filter(Producto.codigoProducto == int(termino))
        else:
            consulta = consulta.filter(Producto.nombreProducto.ilike(f"%{termino}%"))
    if categoria is not None:
        consulta = consulta.filter(Producto.codigoCategoria == categoria)
    if laboratorio is not None:
        consulta = consulta.filter(Producto.codigoLaboratorio == laboratorio)
    if precioMax is not None:
        consulta = consulta.filter(Producto.precioVenta <= precioMax)
    if soloDisponibles:
        consulta = consulta.filter(Producto.stockDisponible > 0)
    return consulta.all()


@router.get("/productos/{codigo}", response_model=ProductoResponse, tags=["Productos"])
def obtener_producto(codigo: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.codigoProducto == codigo).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post(
    "/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED,
    tags=["Productos"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def crear_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    producto = Producto(**data.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put(
    "/productos/{codigo}", response_model=ProductoResponse,
    tags=["Productos"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def actualizar_producto(codigo: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.codigoProducto == codigo).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


@router.delete(
    "/productos/{codigo}", status_code=status.HTTP_204_NO_CONTENT,
    tags=["Productos"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def eliminar_producto(codigo: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.codigoProducto == codigo).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()


@router.get("/productos/{codigo}/lotes", response_model=List[LoteResponse], tags=["Productos"])
def listar_lotes_de_producto(codigo: int, db: Session = Depends(get_db)):
    """RS5204 — fecha de vencimiento del producto en la ficha técnica.

    Excepción puntual y acotada al bloqueo general de `/lotes` (Fase 1,
    RS0028): solo expone los lotes vendibles (Vigente/Por Vencer) de ESE
    producto, ordenados por FEFO — nunca lotes en Vencido/Cuarentena ni la
    trazabilidad interna completa del almacén.
    """
    producto = db.query(Producto).filter(Producto.codigoProducto == codigo).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return (
        db.query(Lote)
        .filter(
            Lote.codigoProducto == codigo,
            Lote.estado.in_(("Vigente", "Por Vencer")),
            Lote.stockDisponible > 0,
        )
        .order_by(Lote.fechaVencimiento.asc())
        .all()
    )


# ── Lotes ──────────────────────────────────────────────────────────────────
# Trazabilidad farmacológica (RN1301-1305): datos internos, no expuestos al
# público, consultables por el personal que dispensa o controla stock.
@router.get(
    "/lotes", response_model=List[LoteResponse], tags=["Lotes"],
    dependencies=[Depends(require_role(*STAFF_CONSULTA_LOTES))],
)
def listar_lotes(db: Session = Depends(get_db)):
    return db.query(Lote).all()


@router.get(
    "/lotes/{codigo}", response_model=LoteResponse, tags=["Lotes"],
    dependencies=[Depends(require_role(*STAFF_CONSULTA_LOTES))],
)
def obtener_lote(codigo: int, db: Session = Depends(get_db)):
    lote = db.query(Lote).filter(Lote.codigoLote == codigo).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lote


@router.post(
    "/lotes", response_model=LoteResponse, status_code=status.HTTP_201_CREATED,
    tags=["Lotes"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def crear_lote(data: LoteCreate, db: Session = Depends(get_db)):
    lote = Lote(**data.model_dump())
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return lote


@router.put(
    "/lotes/{codigo}", response_model=LoteResponse,
    tags=["Lotes"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def actualizar_lote(codigo: int, data: LoteUpdate, db: Session = Depends(get_db)):
    lote = db.query(Lote).filter(Lote.codigoLote == codigo).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(lote, campo, valor)
    db.commit()
    db.refresh(lote)
    return lote


@router.delete(
    "/lotes/{codigo}", status_code=status.HTTP_204_NO_CONTENT,
    tags=["Lotes"], dependencies=[Depends(require_role(*STAFF_ALMACEN))],
)
def eliminar_lote(codigo: int, db: Session = Depends(get_db)):
    lote = db.query(Lote).filter(Lote.codigoLote == codigo).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    db.delete(lote)
    db.commit()
