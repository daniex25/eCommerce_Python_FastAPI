# Reporte de integración Frontend ↔ Backend

Análisis del backend FastAPI existente frente a lo que necesitan las vistas Angular.
Estrategia actual: **mock-first** (cada vista trae datos semilla y queda lista para apuntar al API con el flag `useMockData`).

---

## 1. Endpoints que SÍ existen (CRUD completo: GET, GET/{id}, POST, PUT, DELETE)

Base URL: `http://127.0.0.1:8000`

| Router | Recurso | Lo usa la vista… |
|---|---|---|
| Almacén | `/categorias` | Filtros de catálogo, inventario |
| Almacén | `/laboratorios` | Filtros de catálogo |
| Almacén | `/productos` | Catálogo, ficha, POS, inventario |
| Almacén | `/lotes` | Lotes, FEFO, recepción |
| Ventas | `/clientes` | Checkout, historial, reclamos |
| Ventas | `/carritos` | Carrito |
| Ventas | `/pedidos` | Confirmación, seguimiento, asignación, historial |
| Ventas | `/detalle-pedidos` | Detalle de pedido / POS |
| Ventas | `/recetas-medicas` | Validación de recetas |
| Ventas | `/repartidores` | Asignación de ruta, app repartidor |
| Ventas | `/entregas` | Asignación, app repartidor, seguimiento |
| Ventas | `/pagos` | Checkout, arqueo de caja |
| Ventas | `/comprobantes` | Emisión de comprobante |
| Compras | `/proveedores` | Proveedores |
| Compras | `/ordenes-compra` | Recepción, proveedores |
| Compras | `/detalle-ordenes-compra` | Recepción |

> Estos 16 recursos cubren el **almacenamiento** de casi todas las entidades. El frontend ya está modelado con los **mismos nombres de campo** (`codigoProducto`, `nombreProducto`, `precioVenta`, `condicionVenta`, etc.) para que el mapeo sea directo.

---

## 2. Endpoints que FALTAN (necesarios para que las vistas funcionen "de verdad")

### Catálogo / búsqueda (Proceso 1)
| Método | Ruta sugerida | Payload / query | Para qué |
|---|---|---|---|
| GET | `/productos?search=&categoria=&laboratorio=&precioMax=&soloDisponibles=` | query params | Filtros y búsqueda del catálogo (hoy `/productos` devuelve todo sin filtrar) |
| GET | `/productos/{id}/lotes` | — | Stock por lote en la ficha (FEFO en venta) |

### Checkout y pago (Proceso 1)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| POST | `/checkout` | `{ codigoCliente, items:[{codigoProducto,cantidad}], direccionEntrega, metodoPago, tipoComprobante, documento }` | Crear pedido + detalle + pago en una transacción |
| POST | `/pagos/{id}/confirmar` | `{ metodoPago, referencia }` | Confirmar Yape/Plin/PagoEfectivo/Tarjeta |
| POST | `/comprobantes/emitir` | `{ codigoPago, tipo, documento, serie }` | Generar serie+correlativo y **enviar a SUNAT** (estado: Aceptado) |

> El modelo `Comprobante` no guarda **documento del cliente**, **serie/correlativo separados** ni **estado SUNAT**. Hoy `numeroComprobante` es un string libre.

### POS (Proceso 1)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| GET | `/productos?barcode=` | query | Escaneo por código de barras |
| POST | `/pos/venta` | `{ caja, items, metodoPago, tipoComprobante, documento }` | Registrar venta presencial (descuenta stock + emite comprobante) |

### Inventario y FEFO (Proceso 2)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| GET | `/inventario/bajo-stock` | — | Productos bajo el mínimo. **Falta campo `stockMinimo`** en `Producto` |
| GET | `/lotes/por-vencer?dias=90` | query | Panel FEFO (alerta roja) |
| POST | `/lotes/{id}/cuarentena` | `{ motivo }` | Enviar lote a cuarentena |
| POST | `/recepciones` | `{ numeroOrden, items:[{codigoProducto,cantidadRecibida,numeroLote,fechaVencimiento}] }` | Recepción de mercadería con lote+vencimiento (descuenta de la OC, crea lotes, suma stock) |

> El modelo `Producto` **no tiene `stockMinimo`** ni **`imagen`/URL**, ni `presentacion`. `DetalleOrdenCompra` no tiene `cantidadRecibida`.

### Distribución (Proceso 3)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| GET | `/pedidos?estado=Pagado,Preparado` | query | Pedidos por despachar |
| POST | `/entregas/asignar` | `{ asignaciones:[{numeroPedido, codigoRepartidor}] }` | Asignar ruta y notificar |
| PUT | `/entregas/{id}/estado` | `{ estado:'Entregado'|'Incidencia', observacion }` | App repartidor marca entrega/incidencia |
| POST | `/incidencias` | `{ numeroPedido, tipo, detalle, codigoRepartidor }` | Registrar incidencia |

> `Pedido.estadoPedido` y `Entrega.estadoEntrega` son strings libres; conviene fijar el catálogo de estados. **Falta `distrito`** en `Pedido`/`Entrega`. `Repartidor` no tiene `vehiculo`.

### Atención y fidelización (Proceso 4)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| PUT | `/recetas-medicas/{n}/validar` | `{ estado:'Aprobada'|'Rechazada', observacion, codigoQF }` | Aprobar/rechazar receta |
| GET/POST | `/reclamos` | `{ codigoCliente, tipo, asunto, canal }` | Libro de Reclamaciones (**no existe el recurso**) |
| GET/POST | `/cupones` | `{ codigoCliente, descuento, motivo, vencimiento }` | Fidelización (**no existe el recurso**) |
| GET | `/clientes/{id}/pedidos` | — | Historial de compras del cliente |

> Las recetas no guardan **imagen** (URL del archivo subido) ni **CMP** del médico. No hay endpoint de subida de archivos (`POST /recetas-medicas/{n}/imagen`).

### Administración y finanzas (Proceso 5)
| Método | Ruta sugerida | Payload | Para qué |
|---|---|---|---|
| GET/POST | `/caja/turnos` | `{ caja, fondoInicial }` / cierre `{ efectivoContado }` | Apertura/cierre de turno y arqueo |
| GET/POST | `/caja/movimientos` | `{ tipo:'Egreso', concepto, monto }` | Vale de caja chica |
| GET | `/reportes/ventas?desde=&hasta=&canal=` | query | Dashboard de ventas omnicanal |
| GET | `/reportes/top-productos` | query | Productos más vendidos |
| GET | `/reportes/financiero` | query | Estado de resultados / IGV |
| GET | `/reportes/export?formato=pdf|excel` | query | Exportación |

> **No existe ningún modelo de Caja/Turno/Movimiento** ni endpoints de **reportes agregados**. Todo el Proceso 5 está hoy 100% mock.

### Transversal
| Método | Ruta sugerida | Para qué |
|---|---|---|
| POST | `/auth/login` + roles | No hay autenticación ni modelo de **Usuario/Rol** (Cliente, Téc. Farmacia, Q.F., Admin, Almacén, Repartidor, Admin Sistema) |

---

## 3. Inconsistencias detectadas

1. **Base de datos: el documento dice MariaDB, pero el código usa PostgreSQL.**
   `app/core/config.py` → `postgresql://...:5432`. Hay que decidir cuál es la oficial (el frontend es indiferente; afecta solo al backend).
2. **`app/db/database.py` raíz (fuera de `app/`) está roto** — `core/config.py` raíz tiene sintaxis inválida (`db_username: postgres` sin tipo) y `db/database.py` raíz referencia `settings` sin importarlo. La versión válida es la de `app/`. Conviene **eliminar las carpetas duplicadas `core/` y `db/` de la raíz**.
3. **Base de datos vacía**: no hay datos semilla, así que aunque se conecte el API las pantallas saldrían vacías. Recomendado: script de `seed` (se puede derivar del `DataService` del frontend).
4. **`Producto` sin `stockMinimo`, `imagen`, `presentacion`** → necesarios para inventario y catálogo.
5. **`Comprobante` sin documento de cliente, serie/correlativo ni estado SUNAT.**
6. **Estados como texto libre** (pedido, entrega, lote, pago) → conviene enum/catálogo.
7. **Faltan entidades**: Usuario/Rol, Reclamo, Cupón, Turno de Caja, Movimiento de Caja, Incidencia de entrega.
8. **El stock vive en dos lugares** (`Producto.stockDisponible` y `Lote.stockDisponible`) sin lógica que los mantenga sincronizados (la venta/recepción debería actualizar ambos respetando FEFO).

---

## 4. Resumen

- **Cubierto por el backend actual (almacenamiento):** ~16 recursos CRUD → productos, clientes, pedidos, lotes, recetas, repartidores, entregas, pagos, comprobantes, proveedores, órdenes.
- **Falta lógica de negocio / endpoints compuestos:** checkout transaccional, emisión SUNAT, recepción con lotes, asignación de rutas, validación de recetas, y **todo el Proceso 5** (caja y reportes).
- **Falta por completo:** autenticación/roles, reclamos, cupones, caja/turnos, reportes agregados, subida de imágenes (recetas/productos).

Mientras tanto, las **25 pantallas están completas y navegables con datos mock**, listas para captura y documentación.
