from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.modelos_compras import Proveedor, OrdenDeCompra, DetalleOrdenCompra
from app.schemas.schemas_compras import (
    ProveedorCreate, ProveedorUpdate, ProveedorResponse,
    OrdenCompraCreate, OrdenCompraUpdate, OrdenCompraResponse,
    DetalleOrdenCreate, DetalleOrdenUpdate, DetalleOrdenResponse,
)

router = APIRouter()


# ── Proveedores ────────────────────────────────────────────────────────────
@router.get("/proveedores", response_model=List[ProveedorResponse], tags=["Proveedores"])
def listar_proveedores(db: Session = Depends(get_db)):
    return db.query(Proveedor).all()


@router.get("/proveedores/{ruc}", response_model=ProveedorResponse, tags=["Proveedores"])
def obtener_proveedor(ruc: str, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.rucProveedor == ruc).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


@router.post("/proveedores", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED, tags=["Proveedores"])
def crear_proveedor(data: ProveedorCreate, db: Session = Depends(get_db)):
    proveedor = Proveedor(**data.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.put("/proveedores/{ruc}", response_model=ProveedorResponse, tags=["Proveedores"])
def actualizar_proveedor(ruc: str, data: ProveedorUpdate, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.rucProveedor == ruc).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(proveedor, campo, valor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.delete("/proveedores/{ruc}", status_code=status.HTTP_204_NO_CONTENT, tags=["Proveedores"])
def eliminar_proveedor(ruc: str, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.rucProveedor == ruc).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(proveedor)
    db.commit()


# ── Ordenes de Compra ──────────────────────────────────────────────────────
@router.get("/ordenes-compra", response_model=List[OrdenCompraResponse], tags=["Ordenes de Compra"])
def listar_ordenes(db: Session = Depends(get_db)):
    return db.query(OrdenDeCompra).all()


@router.get("/ordenes-compra/{numero}", response_model=OrdenCompraResponse, tags=["Ordenes de Compra"])
def obtener_orden(numero: int, db: Session = Depends(get_db)):
    orden = db.query(OrdenDeCompra).filter(OrdenDeCompra.numeroOrden == numero).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    return orden


@router.post("/ordenes-compra", response_model=OrdenCompraResponse, status_code=status.HTTP_201_CREATED, tags=["Ordenes de Compra"])
def crear_orden(data: OrdenCompraCreate, db: Session = Depends(get_db)):
    orden = OrdenDeCompra(**data.model_dump())
    db.add(orden)
    db.commit()
    db.refresh(orden)
    return orden


@router.put("/ordenes-compra/{numero}", response_model=OrdenCompraResponse, tags=["Ordenes de Compra"])
def actualizar_orden(numero: int, data: OrdenCompraUpdate, db: Session = Depends(get_db)):
    orden = db.query(OrdenDeCompra).filter(OrdenDeCompra.numeroOrden == numero).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(orden, campo, valor)
    db.commit()
    db.refresh(orden)
    return orden


@router.delete("/ordenes-compra/{numero}", status_code=status.HTTP_204_NO_CONTENT, tags=["Ordenes de Compra"])
def eliminar_orden(numero: int, db: Session = Depends(get_db)):
    orden = db.query(OrdenDeCompra).filter(OrdenDeCompra.numeroOrden == numero).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    db.delete(orden)
    db.commit()


# ── Detalle Ordenes de Compra ──────────────────────────────────────────────
@router.get("/detalle-ordenes-compra", response_model=List[DetalleOrdenResponse], tags=["Detalle Ordenes Compra"])
def listar_detalle_ordenes(db: Session = Depends(get_db)):
    return db.query(DetalleOrdenCompra).all()


@router.get("/detalle-ordenes-compra/{id}", response_model=DetalleOrdenResponse, tags=["Detalle Ordenes Compra"])
def obtener_detalle_orden(id: int, db: Session = Depends(get_db)):
    detalle = db.query(DetalleOrdenCompra).filter(DetalleOrdenCompra.idDetalleOrden == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de orden no encontrado")
    return detalle


@router.post("/detalle-ordenes-compra", response_model=DetalleOrdenResponse, status_code=status.HTTP_201_CREATED, tags=["Detalle Ordenes Compra"])
def crear_detalle_orden(data: DetalleOrdenCreate, db: Session = Depends(get_db)):
    detalle = DetalleOrdenCompra(**data.model_dump())
    db.add(detalle)
    db.commit()
    db.refresh(detalle)
    return detalle


@router.put("/detalle-ordenes-compra/{id}", response_model=DetalleOrdenResponse, tags=["Detalle Ordenes Compra"])
def actualizar_detalle_orden(id: int, data: DetalleOrdenUpdate, db: Session = Depends(get_db)):
    detalle = db.query(DetalleOrdenCompra).filter(DetalleOrdenCompra.idDetalleOrden == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de orden no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(detalle, campo, valor)
    db.commit()
    db.refresh(detalle)
    return detalle


@router.delete("/detalle-ordenes-compra/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Detalle Ordenes Compra"])
def eliminar_detalle_orden(id: int, db: Session = Depends(get_db)):
    detalle = db.query(DetalleOrdenCompra).filter(DetalleOrdenCompra.idDetalleOrden == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de orden no encontrado")
    db.delete(detalle)
    db.commit()
