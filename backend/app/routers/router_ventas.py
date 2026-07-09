from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import require_role
from app.db.database import get_db
from app.models.modelos_ventas import (
    Cliente, CarritodeCompras, Pedido, DetallePedido,
    RecetaMedica, Repartidor, Entrega, Pago, Comprobante,
)
from app.schemas.schemas_ventas import (
    ClienteCreate, ClienteUpdate, ClienteResponse,
    CarritoCreate, CarritoUpdate, CarritoResponse,
    PedidoCreate, PedidoUpdate, PedidoResponse,
    DetallePedidoCreate, DetallePedidoUpdate, DetallePedidoResponse,
    RecetaCreate, RecetaUpdate, RecetaResponse,
    RepartidorCreate, RepartidorUpdate, RepartidorResponse,
    EntregaCreate, EntregaUpdate, EntregaResponse,
    PagoCreate, PagoUpdate, PagoResponse,
    ComprobanteCreate, ComprobanteUpdate, ComprobanteResponse,
)

router = APIRouter()

# Grupos de rol (RS0029). El registro público de clientes se hace vía
# POST /auth/registro-cliente (CUS101), no por este CRUD genérico — de ahí
# que aquí Cliente quede restringido a personal administrativo.
ADMINISTRACION = ("Administrador", "Administrador del Sistema")
VENTAS_STAFF = ("Administrador", "Técnico de Farmacia", "Administrador del Sistema")
VENTAS_STAFF_ALMACEN = VENTAS_STAFF + ("Encargado de Almacén",)
CLIENTE_Y_STAFF = ("Cliente",) + VENTAS_STAFF
FARMACEUTICO = ("Químico Farmacéutico", "Administrador")
RECETA_LECTURA = ("Químico Farmacéutico", "Técnico de Farmacia", "Administrador", "Cliente")
DISTRIBUCION_STAFF = ("Repartidor", "Técnico de Farmacia", "Administrador", "Administrador del Sistema")
ENTREGA_LECTURA = DISTRIBUCION_STAFF + ("Cliente",)


# ── Clientes ───────────────────────────────────────────────────────────────
@router.get(
    "/clientes", response_model=List[ClienteResponse], tags=["Clientes"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()


@router.get(
    "/clientes/{codigo}", response_model=ClienteResponse, tags=["Clientes"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def obtener_cliente(codigo: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.codigoCliente == codigo).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.post(
    "/clientes", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED,
    tags=["Clientes"], dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def crear_cliente(data: ClienteCreate, db: Session = Depends(get_db)):
    cliente = Cliente(**data.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put(
    "/clientes/{codigo}", response_model=ClienteResponse, tags=["Clientes"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def actualizar_cliente(codigo: int, data: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.codigoCliente == codigo).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(cliente, campo, valor)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete(
    "/clientes/{codigo}", status_code=status.HTTP_204_NO_CONTENT, tags=["Clientes"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def eliminar_cliente(codigo: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.codigoCliente == codigo).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.delete(cliente)
    db.commit()


# ── Carritos ───────────────────────────────────────────────────────────────
@router.get(
    "/carritos", response_model=List[CarritoResponse], tags=["Carritos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF))],
)
def listar_carritos(db: Session = Depends(get_db)):
    return db.query(CarritodeCompras).all()


@router.get(
    "/carritos/{codigo}", response_model=CarritoResponse, tags=["Carritos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF))],
)
def obtener_carrito(codigo: int, db: Session = Depends(get_db)):
    carrito = db.query(CarritodeCompras).filter(CarritodeCompras.codigoCarrito == codigo).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    return carrito


@router.post(
    "/carritos", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED,
    tags=["Carritos"], dependencies=[Depends(require_role(*CLIENTE_Y_STAFF))],
)
def crear_carrito(data: CarritoCreate, db: Session = Depends(get_db)):
    carrito = CarritodeCompras(**data.model_dump())
    db.add(carrito)
    db.commit()
    db.refresh(carrito)
    return carrito


@router.put(
    "/carritos/{codigo}", response_model=CarritoResponse, tags=["Carritos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF))],
)
def actualizar_carrito(codigo: int, data: CarritoUpdate, db: Session = Depends(get_db)):
    carrito = db.query(CarritodeCompras).filter(CarritodeCompras.codigoCarrito == codigo).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(carrito, campo, valor)
    db.commit()
    db.refresh(carrito)
    return carrito


@router.delete(
    "/carritos/{codigo}", status_code=status.HTTP_204_NO_CONTENT, tags=["Carritos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF))],
)
def eliminar_carrito(codigo: int, db: Session = Depends(get_db)):
    carrito = db.query(CarritodeCompras).filter(CarritodeCompras.codigoCarrito == codigo).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    db.delete(carrito)
    db.commit()


# ── Pedidos ────────────────────────────────────────────────────────────────
@router.get(
    "/pedidos", response_model=List[PedidoResponse], tags=["Pedidos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF, "Encargado de Almacén"))],
)
def listar_pedidos(db: Session = Depends(get_db)):
    return db.query(Pedido).all()


@router.get(
    "/pedidos/{numero}", response_model=PedidoResponse, tags=["Pedidos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF, "Encargado de Almacén"))],
)
def obtener_pedido(numero: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.numeroPedido == numero).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.post(
    "/pedidos", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED,
    tags=["Pedidos"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def crear_pedido(data: PedidoCreate, db: Session = Depends(get_db)):
    pedido = Pedido(**data.model_dump())
    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return pedido


@router.put(
    "/pedidos/{numero}", response_model=PedidoResponse, tags=["Pedidos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def actualizar_pedido(numero: int, data: PedidoUpdate, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.numeroPedido == numero).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(pedido, campo, valor)
    db.commit()
    db.refresh(pedido)
    return pedido


@router.delete(
    "/pedidos/{numero}", status_code=status.HTTP_204_NO_CONTENT, tags=["Pedidos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def eliminar_pedido(numero: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.numeroPedido == numero).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    db.delete(pedido)
    db.commit()


# ── DetallePedido ──────────────────────────────────────────────────────────
@router.get(
    "/detalle-pedidos", response_model=List[DetallePedidoResponse], tags=["Detalle Pedidos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF, "Encargado de Almacén"))],
)
def listar_detalle_pedidos(db: Session = Depends(get_db)):
    return db.query(DetallePedido).all()


@router.get(
    "/detalle-pedidos/{id}", response_model=DetallePedidoResponse, tags=["Detalle Pedidos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF, "Encargado de Almacén"))],
)
def obtener_detalle_pedido(id: int, db: Session = Depends(get_db)):
    detalle = db.query(DetallePedido).filter(DetallePedido.idDetallePedido == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    return detalle


@router.post(
    "/detalle-pedidos", response_model=DetallePedidoResponse, status_code=status.HTTP_201_CREATED,
    tags=["Detalle Pedidos"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def crear_detalle_pedido(data: DetallePedidoCreate, db: Session = Depends(get_db)):
    detalle = DetallePedido(**data.model_dump())
    db.add(detalle)
    db.commit()
    db.refresh(detalle)
    return detalle


@router.put(
    "/detalle-pedidos/{id}", response_model=DetallePedidoResponse, tags=["Detalle Pedidos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def actualizar_detalle_pedido(id: int, data: DetallePedidoUpdate, db: Session = Depends(get_db)):
    detalle = db.query(DetallePedido).filter(DetallePedido.idDetallePedido == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(detalle, campo, valor)
    db.commit()
    db.refresh(detalle)
    return detalle


@router.delete(
    "/detalle-pedidos/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Detalle Pedidos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def eliminar_detalle_pedido(id: int, db: Session = Depends(get_db)):
    detalle = db.query(DetallePedido).filter(DetallePedido.idDetallePedido == id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    db.delete(detalle)
    db.commit()


# ── Recetas Medicas ────────────────────────────────────────────────────────
# Datos clínicos sensibles (RS0028): solo Químico Farmacéutico, Técnico de
# Farmacia y Administrador consultan la bandeja completa; el Cliente sube
# la propia (POST) pero la validación (PUT) es potestad exclusiva del Q.F.
@router.get(
    "/recetas-medicas", response_model=List[RecetaResponse], tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*RECETA_LECTURA))],
)
def listar_recetas(db: Session = Depends(get_db)):
    return db.query(RecetaMedica).all()


@router.get(
    "/recetas-medicas/{numero}", response_model=RecetaResponse, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*RECETA_LECTURA))],
)
def obtener_receta(numero: int, db: Session = Depends(get_db)):
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    return receta


@router.post(
    "/recetas-medicas", response_model=RecetaResponse, status_code=status.HTTP_201_CREATED,
    tags=["Recetas Medicas"], dependencies=[Depends(require_role("Cliente", *VENTAS_STAFF))],
)
def crear_receta(data: RecetaCreate, db: Session = Depends(get_db)):
    receta = RecetaMedica(**data.model_dump())
    db.add(receta)
    db.commit()
    db.refresh(receta)
    return receta


@router.put(
    "/recetas-medicas/{numero}", response_model=RecetaResponse, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*FARMACEUTICO))],
)
def actualizar_receta(numero: int, data: RecetaUpdate, db: Session = Depends(get_db)):
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(receta, campo, valor)
    db.commit()
    db.refresh(receta)
    return receta


@router.delete(
    "/recetas-medicas/{numero}", status_code=status.HTTP_204_NO_CONTENT, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def eliminar_receta(numero: int, db: Session = Depends(get_db)):
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    db.delete(receta)
    db.commit()


# ── Repartidores ───────────────────────────────────────────────────────────
@router.get(
    "/repartidores", response_model=List[RepartidorResponse], tags=["Repartidores"],
    dependencies=[Depends(require_role(*DISTRIBUCION_STAFF))],
)
def listar_repartidores(db: Session = Depends(get_db)):
    return db.query(Repartidor).all()


@router.get(
    "/repartidores/{codigo}", response_model=RepartidorResponse, tags=["Repartidores"],
    dependencies=[Depends(require_role(*DISTRIBUCION_STAFF))],
)
def obtener_repartidor(codigo: int, db: Session = Depends(get_db)):
    repartidor = db.query(Repartidor).filter(Repartidor.codigoRepartidor == codigo).first()
    if not repartidor:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    return repartidor


@router.post(
    "/repartidores", response_model=RepartidorResponse, status_code=status.HTTP_201_CREATED,
    tags=["Repartidores"], dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def crear_repartidor(data: RepartidorCreate, db: Session = Depends(get_db)):
    repartidor = Repartidor(**data.model_dump())
    db.add(repartidor)
    db.commit()
    db.refresh(repartidor)
    return repartidor


@router.put(
    "/repartidores/{codigo}", response_model=RepartidorResponse, tags=["Repartidores"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def actualizar_repartidor(codigo: int, data: RepartidorUpdate, db: Session = Depends(get_db)):
    repartidor = db.query(Repartidor).filter(Repartidor.codigoRepartidor == codigo).first()
    if not repartidor:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(repartidor, campo, valor)
    db.commit()
    db.refresh(repartidor)
    return repartidor


@router.delete(
    "/repartidores/{codigo}", status_code=status.HTTP_204_NO_CONTENT, tags=["Repartidores"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def eliminar_repartidor(codigo: int, db: Session = Depends(get_db)):
    repartidor = db.query(Repartidor).filter(Repartidor.codigoRepartidor == codigo).first()
    if not repartidor:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    db.delete(repartidor)
    db.commit()


# ── Entregas ───────────────────────────────────────────────────────────────
@router.get(
    "/entregas", response_model=List[EntregaResponse], tags=["Entregas"],
    dependencies=[Depends(require_role(*ENTREGA_LECTURA))],
)
def listar_entregas(db: Session = Depends(get_db)):
    return db.query(Entrega).all()


@router.get(
    "/entregas/{codigo}", response_model=EntregaResponse, tags=["Entregas"],
    dependencies=[Depends(require_role(*ENTREGA_LECTURA))],
)
def obtener_entrega(codigo: int, db: Session = Depends(get_db)):
    entrega = db.query(Entrega).filter(Entrega.codigoEntrega == codigo).first()
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    return entrega


@router.post(
    "/entregas", response_model=EntregaResponse, status_code=status.HTTP_201_CREATED,
    tags=["Entregas"], dependencies=[Depends(require_role(*DISTRIBUCION_STAFF))],
)
def crear_entrega(data: EntregaCreate, db: Session = Depends(get_db)):
    entrega = Entrega(**data.model_dump())
    db.add(entrega)
    db.commit()
    db.refresh(entrega)
    return entrega


@router.put(
    "/entregas/{codigo}", response_model=EntregaResponse, tags=["Entregas"],
    dependencies=[Depends(require_role(*DISTRIBUCION_STAFF))],
)
def actualizar_entrega(codigo: int, data: EntregaUpdate, db: Session = Depends(get_db)):
    entrega = db.query(Entrega).filter(Entrega.codigoEntrega == codigo).first()
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(entrega, campo, valor)
    db.commit()
    db.refresh(entrega)
    return entrega


@router.delete(
    "/entregas/{codigo}", status_code=status.HTTP_204_NO_CONTENT, tags=["Entregas"],
    dependencies=[Depends(require_role(*DISTRIBUCION_STAFF))],
)
def eliminar_entrega(codigo: int, db: Session = Depends(get_db)):
    entrega = db.query(Entrega).filter(Entrega.codigoEntrega == codigo).first()
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    db.delete(entrega)
    db.commit()


# ── Pagos ──────────────────────────────────────────────────────────────────
# Datos financieros: solo personal de ventas/administración (RS0028).
@router.get(
    "/pagos", response_model=List[PagoResponse], tags=["Pagos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def listar_pagos(db: Session = Depends(get_db)):
    return db.query(Pago).all()


@router.get(
    "/pagos/{codigo}", response_model=PagoResponse, tags=["Pagos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def obtener_pago(codigo: int, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.codigoPago == codigo).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return pago


@router.post(
    "/pagos", response_model=PagoResponse, status_code=status.HTTP_201_CREATED,
    tags=["Pagos"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def crear_pago(data: PagoCreate, db: Session = Depends(get_db)):
    pago = Pago(**data.model_dump())
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago


@router.put(
    "/pagos/{codigo}", response_model=PagoResponse, tags=["Pagos"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def actualizar_pago(codigo: int, data: PagoUpdate, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.codigoPago == codigo).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(pago, campo, valor)
    db.commit()
    db.refresh(pago)
    return pago


@router.delete(
    "/pagos/{codigo}", status_code=status.HTTP_204_NO_CONTENT, tags=["Pagos"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def eliminar_pago(codigo: int, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.codigoPago == codigo).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    db.delete(pago)
    db.commit()


# ── Comprobantes ───────────────────────────────────────────────────────────
@router.get(
    "/comprobantes", response_model=List[ComprobanteResponse], tags=["Comprobantes"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def listar_comprobantes(db: Session = Depends(get_db)):
    return db.query(Comprobante).all()


@router.get(
    "/comprobantes/{numero}", response_model=ComprobanteResponse, tags=["Comprobantes"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def obtener_comprobante(numero: str, db: Session = Depends(get_db)):
    comprobante = db.query(Comprobante).filter(Comprobante.numeroComprobante == numero).first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return comprobante


@router.post(
    "/comprobantes", response_model=ComprobanteResponse, status_code=status.HTTP_201_CREATED,
    tags=["Comprobantes"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def crear_comprobante(data: ComprobanteCreate, db: Session = Depends(get_db)):
    comprobante = Comprobante(**data.model_dump())
    db.add(comprobante)
    db.commit()
    db.refresh(comprobante)
    return comprobante


@router.put(
    "/comprobantes/{numero}", response_model=ComprobanteResponse, tags=["Comprobantes"],
    dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def actualizar_comprobante(numero: str, data: ComprobanteUpdate, db: Session = Depends(get_db)):
    comprobante = db.query(Comprobante).filter(Comprobante.numeroComprobante == numero).first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(comprobante, campo, valor)
    db.commit()
    db.refresh(comprobante)
    return comprobante


@router.delete(
    "/comprobantes/{numero}", status_code=status.HTTP_204_NO_CONTENT, tags=["Comprobantes"],
    dependencies=[Depends(require_role(*ADMINISTRACION))],
)
def eliminar_comprobante(numero: str, db: Session = Depends(get_db)):
    comprobante = db.query(Comprobante).filter(Comprobante.numeroComprobante == numero).first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    db.delete(comprobante)
    db.commit()
