# Botica Central — Frontend Angular

Interfaz (vistas) del sistema integral de e-commerce y gestión para **Botica Central** (Huacho, Huaura — Perú). Cubre los **5 procesos de negocio** en 3 áreas: **Tienda Web (Cliente)**, **Intranet Administrativa (empleados)** y **App Repartidor (móvil)**.

- **Framework:** Angular 20 (standalone components + signals)
- **Estilos:** SCSS, tema farmacéutico (verdes/azules), responsive (desktop/tablet/móvil)
- **Datos:** mock-first con seed peruano realista (S/, IGV 18%, DNI/RUC, Yape/Plin/PagoEfectivo, SUNAT). Listo para conectar al backend FastAPI con un flag.

## Cómo levantarlo

```bash
cd cliente-angular
npm install        # solo la primera vez
npm start          # → http://localhost:4200
```

> Requiere **Node ≥ 22.12**. (Angular CLI 22 exige Node ≥ 22.22; este proyecto usa Angular 20, compatible con Node 22.16+.)

## Conectar al backend real (opcional)

Por defecto las vistas usan datos mock para que siempre se vean completas. Para consumir el API FastAPI:

1. Levanta el backend (`python run.py`, en `http://127.0.0.1:8000`).
2. En [src/environments/environment.ts](src/environments/environment.ts) pon `useMockData: false`.

El CORS del backend ya está abierto (`allow_origins=["*"]`).

## Mapa de pantallas (rutas para capturar)

Hub raíz: **`/`** — desde aquí se accede a las 3 áreas y a cada pantalla.

### Proceso 1 — Comercializar productos
| Pantalla | Ruta |
|---|---|
| Catálogo (tienda) | `/tienda/catalogo` |
| Ficha de producto | `/tienda/producto/1` |
| Carrito | `/tienda/carrito` |
| Checkout / Pago | `/tienda/checkout` |
| Confirmación de pedido | `/tienda/confirmacion` |
| POS — Venta presencial | `/pos/venta` |
| Emisión de comprobante | `/pos/comprobante` |

### Proceso 2 — Abastecer y controlar inventario
| Pantalla | Ruta |
|---|---|
| Consulta de inventario | `/almacen/inventario` |
| Recepción de mercadería | `/almacen/recepcion` |
| Lotes y vencimientos | `/almacen/lotes` |
| Alertas de caducidad (FEFO) | `/almacen/fefo` |
| Proveedores y órdenes de compra | `/almacen/proveedores` |

### Proceso 3 — Distribuir y entregar
| Pantalla | Ruta |
|---|---|
| Asignación de ruta | `/distribucion/asignacion` |
| App Repartidor (móvil) | `/repartidor/entregas` |
| Incidencias de entrega | `/distribucion/incidencias` |
| Seguimiento de pedido (cliente) | `/tienda/seguimiento` |

### Proceso 4 — Atender y fidelizar
| Pantalla | Ruta |
|---|---|
| Validación de recetas (Q.F.) | `/atencion/recetas` |
| Reclamos y atención | `/atencion/reclamos` |
| Fidelización / cupones | `/atencion/fidelizacion` |
| Historial de compras (cliente) | `/tienda/mis-compras` |

### Proceso 5 — Administración y finanzas
| Pantalla | Ruta |
|---|---|
| Arqueo de caja (cierre de turno) | `/admin/caja` |
| Reportes gerenciales (dashboard) | `/admin/reportes` |
| Reporte financiero | `/admin/financiero` |
| Vale de caja chica | `/admin/caja-chica` |

## Estructura

```
src/app/
├─ core/         models.ts, data.service.ts (seed + carrito reactivo)
├─ layouts/      tienda · intranet · repartidor
└─ features/     tienda, pos, almacen, distribucion, repartidor, atencion, admin
```

Ver `REPORTE-BACKEND.md` (en la raíz del repo) para el detalle de endpoints existentes y faltantes.
