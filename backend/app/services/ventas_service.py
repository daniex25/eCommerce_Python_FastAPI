"""Lógica de negocio del dominio de ventas (E-commerce y POS).

Implementa el "Ciclo 0" del documento de ingeniería (Fase 2 del plan de
corrección): armado de pedido desde el carrito con descuento de stock por
lote (FEFO), validación de receta médica aprobada para productos "Bajo
Receta" (RN1101), cálculo de IGV, venta de mostrador y emisión de
comprobante.

Desviación documentada: no existe todavía integración real con una
Pasarela de Pago (Culqi/Niubiz/Yape API) ni con SUNAT — ambas quedan para
la Fase 6 del plan. Mientras tanto, el pago se registra como "Aprobado" de
inmediato (simulando una pasarela que siempre aprueba) y el comprobante
queda con `estadoSunat = "Pendiente"`.
"""
from datetime import date
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.modelos_almacen import Lote, Producto
from app.models.modelos_seguridad import Usuario
from app.models.modelos_ventas import Cliente, Comprobante, DetallePedido, Pago, Pedido, RecetaMedica
from app.schemas.schemas_ventas import CheckoutRequest, EmitirComprobanteRequest, VentaPOSRequest
from app.services import seguridad_service

IGV_RATE = 0.18
COSTO_ENVIO_ESTANDAR = 8.00
LOTES_VENDIBLES = ("Vigente", "Por Vencer")


def _redondear(monto: float) -> float:
    return round(monto, 2)


def _resolver_producto(db: Session, codigo_producto: int) -> Producto:
    producto = db.query(Producto).filter(Producto.codigoProducto == codigo_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto #{codigo_producto} no existe.",
        )
    return producto


def _validar_stock(producto: Producto, cantidad: int) -> None:
    if producto.stockDisponible is None or producto.stockDisponible < cantidad:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stock insuficiente para '{producto.nombreProducto}'. "
            f"Disponible: {producto.stockDisponible or 0}.",
        )


def _descontar_stock_fefo(db: Session, producto: Producto, cantidad: int) -> None:
    """RS5404 — descuenta stock del producto y, si existen lotes registrados,
    aplica FEFO (primero el lote con `fechaVencimiento` más próxima). Si el
    producto todavía no tiene lotes (pendiente de la Fase 3 — Recepción de
    mercadería), el descuento queda solo a nivel de `Producto.stockDisponible`.
    """
    producto.stockDisponible -= cantidad
    restante = cantidad
    lotes = (
        db.query(Lote)
        .filter(
            Lote.codigoProducto == producto.codigoProducto,
            Lote.stockDisponible > 0,
            Lote.estado.in_(LOTES_VENDIBLES),
        )
        .order_by(Lote.fechaVencimiento.asc())
        .all()
    )
    for lote in lotes:
        if restante <= 0:
            break
        tomar = min(lote.stockDisponible, restante)
        lote.stockDisponible -= tomar
        restante -= tomar


def _resolver_receta_aprobada(
    db: Session, producto: Producto, numero_receta: Optional[int], codigo_cliente: int
) -> Optional[RecetaMedica]:
    """RN1101 — los productos "Bajo Receta" exigen una `RecetaMedica` en
    estado "Aprobada", asociada a ese producto y a ESE cliente, y aún no
    consumida por otro pedido (CUS105, flujo alternativo 6.2)."""
    if producto.condicionVenta != "Bajo Receta":
        return None

    if not numero_receta:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"'{producto.nombreProducto}' es de venta bajo receta médica. "
            "Debe contar con una receta validada para continuar.",
        )

    receta = db.query(RecetaMedica).filter(RecetaMedica.numeroReceta == numero_receta).first()
    if not receta or receta.codigoProducto != producto.codigoProducto or receta.codigoCliente != codigo_cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La receta #{numero_receta} no corresponde a '{producto.nombreProducto}'.",
        )
    if receta.estado != "Aprobada":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Debe contar con una receta validada para continuar.",
        )
    if receta.numeroPedido is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La receta #{numero_receta} ya fue utilizada en otro pedido.",
        )
    return receta


def _siguiente_correlativo(db: Session, serie: str) -> int:
    maximo = db.query(func.max(Comprobante.correlativo)).filter(Comprobante.serie == serie).scalar()
    return (maximo or 0) + 1


def emitir_comprobante(
    db: Session,
    *,
    pago: Pago,
    tipo_comprobante: str,
    documento_cliente: Optional[str],
    nombre_cliente: Optional[str],
    monto_comprobante: float,
) -> Comprobante:
    """CUS203 / RS5308 — asigna serie y correlativo internos. No hace commit;
    el llamador es responsable de confirmarlo junto con el resto de la
    transacción."""
    serie = "F001" if tipo_comprobante == "Factura" else "B001"
    correlativo = _siguiente_correlativo(db, serie)
    base_imponible = _redondear(monto_comprobante / (1 + IGV_RATE))
    igv = _redondear(monto_comprobante - base_imponible)

    comprobante = Comprobante(
        numeroComprobante=f"{serie}-{correlativo:08d}",
        codigoPago=pago.codigoPago,
        tipoComprobante=tipo_comprobante,
        fechaEmision=date.today(),
        subtotal=base_imponible,
        igv=igv,
        total=monto_comprobante,
        documentoCliente=documento_cliente,
        nombreCliente=nombre_cliente,
        serie=serie,
        correlativo=correlativo,
        estadoSunat="Pendiente",
    )
    db.add(comprobante)
    db.flush()
    return comprobante


def crear_pedido_desde_carrito(
    db: Session, *, usuario: Usuario, cliente: Cliente, data: CheckoutRequest
) -> tuple[Pedido, Pago, Comprobante]:
    """CUS105 — Pago Electrónico. Arma el pedido a partir del carrito (que
    vive solo en el frontend, ver sección 6.7 del plan de corrección) en una
    única transacción: valida stock y receta médica (RN1101), calcula IGV,
    simula la aprobación de la pasarela de pago y descuenta el inventario
    por lote (FEFO). Emite el comprobante de una vez (RS5308) porque el
    Cliente lo necesita de inmediato en la pantalla de confirmación.
    """
    items_resueltos = []
    subtotal_productos = 0.0
    for item in data.items:
        producto = _resolver_producto(db, item.codigoProducto)
        _validar_stock(producto, item.cantidad)
        receta = _resolver_receta_aprobada(db, producto, item.numeroReceta, cliente.codigoCliente)
        subtotal_producto = float(producto.precioVenta) * item.cantidad
        subtotal_productos += subtotal_producto
        items_resueltos.append((producto, item.cantidad, subtotal_producto, receta))

    subtotal_productos = _redondear(subtotal_productos)
    monto_total = _redondear(subtotal_productos + COSTO_ENVIO_ESTANDAR)

    pedido = Pedido(
        codigoCliente=cliente.codigoCliente,
        fechaPedido=date.today(),
        estadoPedido="Pagado",
        montoTotal=monto_total,
        direccionEntrega=data.direccionEntrega,
        distrito=data.distrito,
    )
    db.add(pedido)
    db.flush()

    detalles = []
    for producto, cantidad, subtotal_producto, receta in items_resueltos:
        detalle = DetallePedido(
            numeroPedido=pedido.numeroPedido,
            codigoProducto=producto.codigoProducto,
            nombreProducto=producto.nombreProducto,
            cantidad=cantidad,
            precioUnitario=producto.precioVenta,
            subtotal=_redondear(subtotal_producto),
        )
        db.add(detalle)
        detalles.append(detalle)
        _descontar_stock_fefo(db, producto, cantidad)
        if receta:
            receta.numeroPedido = pedido.numeroPedido

    # RS5307 — sin pasarela real todavía (Fase 6): se simula la aprobación
    # inmediata, equivalente a los pasos 6-8 del flujo básico de CUS105.
    pago = Pago(
        numeroPedido=pedido.numeroPedido,
        fechaPago=date.today(),
        monto=monto_total,
        metodoPago=data.metodoPago,
        estadoPago="Aprobado",
    )
    db.add(pago)
    db.flush()

    comprobante = emitir_comprobante(
        db,
        pago=pago,
        tipo_comprobante=data.tipoComprobante,
        documento_cliente=data.documentoCliente or cliente.dni,
        nombre_cliente=data.nombreCliente or f"{cliente.nombres} {cliente.apellidos}".strip(),
        monto_comprobante=subtotal_productos,
    )

    db.commit()
    db.refresh(pedido)
    db.refresh(pago)
    db.refresh(comprobante)
    for detalle in detalles:
        db.refresh(detalle)
    pedido.detalle = detalles

    seguridad_service.registrar_auditoria(
        db,
        correo=usuario.correoElectronico,
        accion="CHECKOUT",
        resultado="Exitoso",
        codigo_usuario=usuario.codigoUsuario,
        entidad="Pedido",
        entidad_id=str(pedido.numeroPedido),
        detalle=f"Total S/ {monto_total:.2f} · {data.metodoPago}",
    )

    return pedido, pago, comprobante


def crear_venta_pos(db: Session, *, data: VentaPOSRequest, registrado_por: Usuario) -> tuple[Pedido, Pago]:
    """CUS202 — Registrar venta POS. La validación de turno de caja abierto
    (RN1401) queda pendiente de la Fase 5 (modelo `TurnoCaja` aún no
    existe); el resto de las reglas (stock en tiempo real, RN1101) sí se
    aplican. No emite comprobante: esa es una acción explícita y separada
    del Técnico de Farmacia (CUS203, `POST /comprobantes/emitir`).
    """
    items_resueltos = []
    subtotal_productos = 0.0
    for item in data.items:
        producto = _resolver_producto(db, item.codigoProducto)
        _validar_stock(producto, item.cantidad)
        if producto.condicionVenta == "Bajo Receta" and not item.receta:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"'{producto.nombreProducto}' es de venta bajo receta médica. "
                "Registre los datos de la receta física antes de continuar.",
            )
        subtotal_producto = float(producto.precioVenta) * item.cantidad
        subtotal_productos += subtotal_producto
        items_resueltos.append((producto, item.cantidad, subtotal_producto, item.receta))

    subtotal_productos = _redondear(subtotal_productos)

    pedido = Pedido(
        codigoCliente=None,
        fechaPedido=date.today(),
        estadoPedido="Pagado",
        montoTotal=subtotal_productos,
        direccionEntrega=None,
        distrito=None,
    )
    db.add(pedido)
    db.flush()

    detalles = []
    for producto, cantidad, subtotal_producto, receta_inline in items_resueltos:
        detalle = DetallePedido(
            numeroPedido=pedido.numeroPedido,
            codigoProducto=producto.codigoProducto,
            nombreProducto=producto.nombreProducto,
            cantidad=cantidad,
            precioUnitario=producto.precioVenta,
            subtotal=_redondear(subtotal_producto),
        )
        db.add(detalle)
        detalles.append(detalle)
        _descontar_stock_fefo(db, producto, cantidad)
        if receta_inline:
            # RN1101, alt. 6.1 — el Técnico registra y retiene la receta
            # física; queda "Aprobada" de inmediato porque el producto y la
            # receta se verifican juntos en el mostrador (a diferencia de
            # CUS104, que sí requiere revisión asíncrona del Q.F. porque el
            # canal e-commerce no tiene presencia física).
            db.add(
                RecetaMedica(
                    numeroPedido=pedido.numeroPedido,
                    codigoProducto=producto.codigoProducto,
                    nombrePaciente=receta_inline.nombrePaciente,
                    medicoTratante=receta_inline.medicoTratante,
                    cmpMedico=receta_inline.cmpMedico,
                    fechaEmision=receta_inline.fechaEmision or date.today(),
                    estado="Aprobada",
                )
            )

    pago = Pago(
        numeroPedido=pedido.numeroPedido,
        fechaPago=date.today(),
        monto=subtotal_productos,
        metodoPago=data.metodoPago,
        estadoPago="Aprobado",
    )
    db.add(pago)
    db.commit()
    db.refresh(pedido)
    db.refresh(pago)
    for detalle in detalles:
        db.refresh(detalle)
    pedido.detalle = detalles

    seguridad_service.registrar_auditoria(
        db,
        correo=registrado_por.correoElectronico,
        accion="VENTA_POS",
        resultado="Exitoso",
        codigo_usuario=registrado_por.codigoUsuario,
        entidad="Pedido",
        entidad_id=str(pedido.numeroPedido),
        detalle=f"Total S/ {subtotal_productos:.2f} · {data.metodoPago}",
    )

    return pedido, pago


def emitir_comprobante_para_pago(db: Session, *, data: EmitirComprobanteRequest) -> Comprobante:
    """CUS203 — Emitir comprobante. Usado por el flujo de POS, donde la
    emisión es una acción explícita y separada del cobro (`POST
    /pos/venta`)."""
    pago = db.query(Pago).filter(Pago.codigoPago == data.codigoPago).first()
    if not pago:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"El pago #{data.codigoPago} no existe.")

    ya_emitido = db.query(Comprobante).filter(Comprobante.codigoPago == pago.codigoPago).first()
    if ya_emitido:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El pago #{data.codigoPago} ya tiene el comprobante {ya_emitido.numeroComprobante}.",
        )

    comprobante = emitir_comprobante(
        db,
        pago=pago,
        tipo_comprobante=data.tipoComprobante,
        documento_cliente=data.documentoCliente,
        nombre_cliente=data.nombreCliente,
        monto_comprobante=float(pago.monto),
    )
    db.commit()
    db.refresh(comprobante)
    return comprobante
