import { Routes } from '@angular/router';

export const routes: Routes = [
  // Hub raíz
  { path: '', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },

  // ── Tienda Web (Cliente) ──
  {
    path: 'tienda',
    loadComponent: () => import('./layouts/tienda-layout').then(m => m.TiendaLayout),
    children: [
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
      { path: 'catalogo', loadComponent: () => import('./features/tienda/catalogo').then(m => m.Catalogo) },
      { path: 'producto/:id', loadComponent: () => import('./features/tienda/ficha-producto').then(m => m.FichaProducto) },
      { path: 'carrito', loadComponent: () => import('./features/tienda/carrito').then(m => m.Carrito) },
      { path: 'checkout', loadComponent: () => import('./features/tienda/checkout').then(m => m.Checkout) },
      { path: 'confirmacion', loadComponent: () => import('./features/tienda/confirmacion').then(m => m.Confirmacion) },
      { path: 'seguimiento', loadComponent: () => import('./features/tienda/seguimiento').then(m => m.Seguimiento) },
      { path: 'mis-compras', loadComponent: () => import('./features/tienda/mis-compras').then(m => m.MisCompras) },
    ],
  },

  // ── Intranet Administrativa (empleados) ──
  {
    path: '',
    loadComponent: () => import('./layouts/intranet-layout').then(m => m.IntranetLayout),
    children: [
      // Proceso 1 — POS
      { path: 'pos/venta', loadComponent: () => import('./features/pos/pos-venta').then(m => m.PosVenta) },
      { path: 'pos/comprobante', loadComponent: () => import('./features/pos/emision-comprobante').then(m => m.EmisionComprobante) },
      // Proceso 2 — Almacén
      { path: 'almacen/inventario', loadComponent: () => import('./features/almacen/inventario').then(m => m.Inventario) },
      { path: 'almacen/recepcion', loadComponent: () => import('./features/almacen/recepcion').then(m => m.Recepcion) },
      { path: 'almacen/lotes', loadComponent: () => import('./features/almacen/lotes').then(m => m.Lotes) },
      { path: 'almacen/fefo', loadComponent: () => import('./features/almacen/fefo').then(m => m.Fefo) },
      { path: 'almacen/proveedores', loadComponent: () => import('./features/almacen/proveedores').then(m => m.Proveedores) },
      // Proceso 3 — Distribución
      { path: 'distribucion/asignacion', loadComponent: () => import('./features/distribucion/asignacion').then(m => m.Asignacion) },
      { path: 'distribucion/incidencias', loadComponent: () => import('./features/distribucion/incidencias').then(m => m.Incidencias) },
      // Proceso 4 — Atención
      { path: 'atencion/recetas', loadComponent: () => import('./features/atencion/recetas').then(m => m.Recetas) },
      { path: 'atencion/reclamos', loadComponent: () => import('./features/atencion/reclamos').then(m => m.Reclamos) },
      { path: 'atencion/fidelizacion', loadComponent: () => import('./features/atencion/fidelizacion').then(m => m.Fidelizacion) },
      // Proceso 5 — Administración
      { path: 'admin/caja', loadComponent: () => import('./features/admin/caja').then(m => m.Caja) },
      { path: 'admin/reportes', loadComponent: () => import('./features/admin/reportes').then(m => m.Reportes) },
      { path: 'admin/financiero', loadComponent: () => import('./features/admin/financiero').then(m => m.Financiero) },
      { path: 'admin/caja-chica', loadComponent: () => import('./features/admin/caja-chica').then(m => m.CajaChica) },
    ],
  },

  // ── App Repartidor (móvil) ──
  {
    path: 'repartidor',
    loadComponent: () => import('./layouts/repartidor-layout').then(m => m.RepartidorLayout),
    children: [
      { path: '', redirectTo: 'entregas', pathMatch: 'full' },
      { path: 'entregas', loadComponent: () => import('./features/repartidor/entregas-repartidor').then(m => m.EntregasRepartidor) },
    ],
  },

  { path: '**', redirectTo: '' },
];
