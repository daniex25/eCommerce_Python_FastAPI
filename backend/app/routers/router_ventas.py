import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_current_user, require_role
from app.db.database import get_db
from app.models.modelos_seguridad import Usuario
from app.models.modelos_ventas import (
    Cliente, CarritodeCompras, Pedido, DetallePedido,
    RecetaMedica, Repartidor, Entrega, Pago, Comprobante,
)
from app.schemas.schemas_ventas import (
    ClienteCreate, ClienteUpdate, ClienteResponse,
    CarritoCreate, CarritoUpdate, CarritoResponse,
    PedidoCreate, PedidoUpdate, PedidoResponse,
    DetallePedidoCreate, DetallePedidoUpdate, DetallePedidoResponse,
    RecetaCreate, RecetaUpdate, RecetaResponse, ValidarRecetaRequest,
    RepartidorCreate, RepartidorUpdate, RepartidorResponse,
    EntregaCreate, EntregaUpdate, EntregaResponse,
    PagoCreate, PagoUpdate, PagoResponse,
    ComprobanteCreate, ComprobanteUpdate, ComprobanteResponse,
    CheckoutRequest, CheckoutResponse,
    VentaPOSRequest, VentaPOSResponse,
    EmitirComprobanteRequest,
)
from app.services import seguridad_service, ventas_service

router = APIRouter()

# Carpeta local para imágenes de recetas subidas (CUS104). Servida como
# estática desde `app.main` en `/uploads`; ver `.gitignore` (no se versiona
# contenido subido por usuarios).
CARPETA_RECETAS = os.path.join("uploads", "recetas")
EXTENSIONES_IMAGEN_PERMITIDAS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}

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
def listar_pedidos(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consulta = db.query(Pedido)
    if usuario.rol == "Cliente":
        # RS0028 — un Cliente solo ve su propio historial de pedidos.
        consulta = consulta.filter(Pedido.codigoCliente == usuario.codigoCliente)
    return consulta.all()


@router.get(
    "/pedidos/{numero}", response_model=PedidoResponse, tags=["Pedidos"],
    dependencies=[Depends(require_role(*CLIENTE_Y_STAFF, "Encargado de Almacén"))],
)
def obtener_pedido(
    numero: int,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pedido = db.query(Pedido).filter(Pedido.numeroPedido == numero).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    # RS0028 — un Cliente solo puede consultar sus propios pedidos, nunca
    # los de otro (el número de pedido es correlativo y adivinable).
    if usuario.rol == "Cliente" and pedido.codigoCliente != usuario.codigoCliente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.detalle = db.query(DetallePedido).filter(DetallePedido.numeroPedido == numero).all()
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


# ── Checkout (CUS105 / RS5304, RS5307, RS5308, RN1101) ──────────────────────
@router.post(
    "/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED,
    tags=["Checkout"], dependencies=[Depends(require_role("Cliente"))],
)
def checkout(
    data: CheckoutRequest,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CUS105 — Pago Electrónico. Arma el pedido a partir de los ítems del
    carrito (persistido solo en el frontend), valida stock y receta médica
    (RN1101), calcula IGV, simula la pasarela de pago y emite el
    comprobante."""
    if not usuario.codigoCliente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta cuenta no tiene un perfil de Cliente asociado.",
        )
    cliente = db.query(Cliente).filter(Cliente.codigoCliente == usuario.codigoCliente).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")

    pedido, pago, comprobante = ventas_service.crear_pedido_desde_carrito(
        db, usuario=usuario, cliente=cliente, data=data
    )
    return CheckoutResponse(pedido=pedido, pago=pago, comprobante=comprobante)


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
def listar_recetas(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consulta = db.query(RecetaMedica)
    if usuario.rol == "Cliente":
        # RS0028 — el Cliente solo ve sus propias recetas, nunca la bandeja
        # clínica completa de otros pacientes.
        consulta = consulta.filter(RecetaMedica.codigoCliente == usuario.codigoCliente)
    return consulta.all()


@router.get(
    "/recetas-medicas/{numero}", response_model=RecetaResponse, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*RECETA_LECTURA))],
)
def obtener_receta(
    numero: int,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    if usuario.rol == "Cliente" and receta.codigoCliente != usuario.codigoCliente:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    return receta


@router.post(
    "/recetas-medicas", response_model=RecetaResponse, status_code=status.HTTP_201_CREATED,
    tags=["Recetas Medicas"], dependencies=[Depends(require_role("Cliente", *VENTAS_STAFF))],
)
def crear_receta(
    data: RecetaCreate,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CUS104 — el Cliente sube la receta ANTES del checkout (todavía sin
    pedido asociado). `estado`, `numeroPedido` y `codigoCliente` no son
    controlables desde este endpoint: toda receta nueva nace "Pendiente" y
    sin vincular, y queda asociada al Cliente autenticado (RS0028) — solo
    `PUT /recetas-medicas/{numero}/validar` (Q.F.) puede aprobarla/rechazarla,
    y solo el checkout la vincula a un pedido (RN1101)."""
    codigo_cliente = usuario.codigoCliente if usuario.rol == "Cliente" else data.codigoCliente
    receta = RecetaMedica(
        **data.model_dump(exclude={"estado", "numeroPedido", "codigoCliente"}),
        estado="Pendiente",
        numeroPedido=None,
        codigoCliente=codigo_cliente,
    )
    db.add(receta)
    db.commit()
    db.refresh(receta)
    return receta


@router.put(
    "/recetas-medicas/{numero}/validar", response_model=RecetaResponse, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role(*FARMACEUTICO))],
)
def validar_receta(
    numero: int,
    data: ValidarRecetaRequest,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CUS104 — el Químico Farmacéutico aprueba o rechaza la receta subida
    por el Cliente, tras verificar fecha, firma y coherencia con el
    medicamento."""
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    if receta.estado != "Pendiente":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La receta #{numero} ya fue evaluada (estado actual: {receta.estado}).",
        )
    receta.estado = data.estado
    db.commit()
    db.refresh(receta)

    seguridad_service.registrar_auditoria(
        db,
        correo=usuario.correoElectronico,
        accion="VALIDAR_RECETA",
        resultado="Exitoso",
        codigo_usuario=usuario.codigoUsuario,
        entidad="RecetaMedica",
        entidad_id=str(numero),
        detalle=f"Estado: {data.estado}",
    )
    return receta


@router.post(
    "/recetas-medicas/{numero}/imagen", response_model=RecetaResponse, tags=["Recetas Medicas"],
    dependencies=[Depends(require_role("Cliente", *VENTAS_STAFF))],
)
async def subir_imagen_receta(
    numero: int,
    archivo: UploadFile = File(...),
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CUS104 — el Cliente adjunta la imagen digital de su receta médica."""
    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")
    if usuario.rol == "Cliente" and receta.codigoCliente != usuario.codigoCliente:
        raise HTTPException(status_code=404, detail="Receta médica no encontrada")

    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_IMAGEN_PERMITIDAS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Formato no admitido. Usa: {', '.join(sorted(EXTENSIONES_IMAGEN_PERMITIDAS))}.",
        )

    os.makedirs(CARPETA_RECETAS, exist_ok=True)
    nombre_archivo = f"receta-{numero}-{uuid.uuid4().hex[:8]}{extension}"
    ruta_disco = os.path.join(CARPETA_RECETAS, nombre_archivo)
    contenido = await archivo.read()
    with open(ruta_disco, "wb") as destino:
        destino.write(contenido)

    receta.imagenUrl = f"/uploads/recetas/{nombre_archivo}"
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


# ── POS (CUS202 / RS5404, RN1101) ───────────────────────────────────────────
@router.post(
    "/pos/venta", response_model=VentaPOSResponse, status_code=status.HTTP_201_CREATED,
    tags=["POS"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def registrar_venta_pos(
    data: VentaPOSRequest,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CUS202 — Registrar venta POS. Cobra y descuenta stock; la emisión del
    comprobante es un paso separado (`POST /comprobantes/emitir`, CUS203)."""
    pedido, pago = ventas_service.crear_venta_pos(db, data=data, registrado_por=usuario)
    return VentaPOSResponse(pedido=pedido, pago=pago)


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
    dependencies=[Depends(require_role("Cliente", *VENTAS_STAFF))],
)
def obtener_comprobante(
    numero: str,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comprobante = db.query(Comprobante).filter(Comprobante.numeroComprobante == numero).first()
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    if usuario.rol == "Cliente":
        # RS0028 — el Cliente solo ve el comprobante de su propia compra
        # (la serie/correlativo es correlativa y adivinable).
        pago = db.query(Pago).filter(Pago.codigoPago == comprobante.codigoPago).first()
        pedido = db.query(Pedido).filter(Pedido.numeroPedido == pago.numeroPedido).first() if pago else None
        if not pedido or pedido.codigoCliente != usuario.codigoCliente:
            raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return comprobante


@router.post(
    "/comprobantes/emitir", response_model=ComprobanteResponse, status_code=status.HTTP_201_CREATED,
    tags=["Comprobantes"], dependencies=[Depends(require_role(*VENTAS_STAFF))],
)
def emitir_comprobante_endpoint(data: EmitirComprobanteRequest, db: Session = Depends(get_db)):
    """CUS203 — Emitir comprobante. Paso explícito del Técnico de Farmacia
    tras registrar una venta POS (`POST /pos/venta`): asigna serie y
    correlativo y deja el comprobante "Pendiente" ante SUNAT (Fase 6)."""
    return ventas_service.emitir_comprobante_para_pago(db, data=data)


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
