import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
  <div class="hub">
    <header class="hub-top">
      <div class="brand">
        <div class="logo">✚</div>
        <div>
          <div class="bn">Botica Central</div>
          <div class="bs">Sistema Integral de Gestión · Huacho, Huaura</div>
        </div>
      </div>
      <div class="hub-top-r">
        <span class="badge badge-green"><span class="dot" style="background:#16a34a"></span> Atención 24/7</span>
        <a routerLink="/login" class="login-btn">🔒 Iniciar sesión</a>
      </div>
    </header>

    <div class="hero">
      <h1>Plataforma unificada de comercio y gestión farmacéutica</h1>
      <p>E-Commerce, punto de venta, inventario con trazabilidad de lotes, distribución y administración — en un solo lugar.</p>
    </div>

    <section class="areas">
      <a routerLink="/tienda/catalogo" class="area area-green">
        <div class="ic">🛒</div>
        <h2>Tienda Web</h2>
        <p>Catálogo, carrito, checkout y seguimiento de pedidos para clientes.</p>
        <span class="go">Entrar como Cliente →</span>
      </a>

      <a routerLink="/admin/reportes" class="area area-blue">
        <div class="ic">🏥</div>
        <h2>Intranet Administrativa</h2>
        <p>POS, almacén, distribución, validación de recetas y reportes para el personal.</p>
        <span class="go">Entrar como Personal →</span>
      </a>

      <a routerLink="/repartidor/entregas" class="area area-teal">
        <div class="ic">🛵</div>
        <h2>App Repartidor</h2>
        <p>Vista móvil para confirmar entregas y registrar incidencias en ruta.</p>
        <span class="go">Entrar como Repartidor →</span>
      </a>
    </section>

    <section class="accesos">
      <h3>Accesos rápidos a las pantallas</h3>
      <div class="cols">
        <div>
          <h4>① Comercializar productos</h4>
          <a routerLink="/tienda/catalogo">Catálogo</a>
          <a routerLink="/tienda/carrito">Carrito</a>
          <a routerLink="/tienda/checkout">Checkout / Pago</a>
          <a routerLink="/pos/venta">POS — Venta presencial</a>
          <a routerLink="/pos/comprobante">Emisión de comprobante</a>
        </div>
        <div>
          <h4>② Abastecer e inventario</h4>
          <a routerLink="/almacen/inventario">Consulta de inventario</a>
          <a routerLink="/almacen/recepcion">Recepción de mercadería</a>
          <a routerLink="/almacen/lotes">Lotes y vencimientos</a>
          <a routerLink="/almacen/fefo">Alertas FEFO</a>
          <a routerLink="/almacen/proveedores">Proveedores y OC</a>
        </div>
        <div>
          <h4>③ Distribuir y entregar</h4>
          <a routerLink="/distribucion/asignacion">Asignación de ruta</a>
          <a routerLink="/repartidor/entregas">Repartidor (móvil)</a>
          <a routerLink="/distribucion/incidencias">Incidencias</a>
          <a routerLink="/tienda/seguimiento">Seguimiento (cliente)</a>
        </div>
        <div>
          <h4>④ Atender y fidelizar</h4>
          <a routerLink="/atencion/recetas">Validación de recetas</a>
          <a routerLink="/atencion/reclamos">Reclamos y atención</a>
          <a routerLink="/atencion/fidelizacion">Fidelización / cupones</a>
          <a routerLink="/tienda/mis-compras">Historial de compras</a>
        </div>
        <div>
          <h4>⑤ Administración y finanzas</h4>
          <a routerLink="/admin/caja">Arqueo de caja</a>
          <a routerLink="/admin/reportes">Reportes gerenciales</a>
          <a routerLink="/admin/financiero">Reporte financiero</a>
          <a routerLink="/admin/caja-chica">Vale de caja chica</a>
        </div>
      </div>
    </section>
  </div>
  `,
  styles: [`
    .hub { min-height:100vh; background:linear-gradient(160deg,#0369a1 0%,#0d9488 55%,#15803d 100%); padding:2rem 1.5rem 3rem; }
    .hub-top { max-width:1100px; margin:0 auto 2rem; display:flex; justify-content:space-between; align-items:center; }
    .brand { display:flex; gap:.85rem; align-items:center; color:#fff; }
    .logo { width:48px; height:48px; border-radius:12px; background:#fff; color:#15803d; font-size:1.7rem; display:grid; place-items:center; font-weight:900; }
    .bn { font-size:1.3rem; font-weight:800; }
    .bs { font-size:.8rem; opacity:.85; }
    .hub-top-r { display:flex; align-items:center; gap:1rem; }
    .login-btn { background:#fff; color:#15803d; font-weight:700; padding:.5rem 1.1rem; border-radius:9px; font-size:.9rem; box-shadow:0 4px 12px rgba(0,0,0,.15); }
    .login-btn:hover { background:#f0fdf4; }
    .hero { max-width:780px; margin:0 auto 2.5rem; text-align:center; color:#fff; }
    .hero h1 { font-size:2rem; line-height:1.2; }
    .hero p { opacity:.9; font-size:1.05rem; }
    .areas { max-width:1100px; margin:0 auto 2.5rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.25rem; }
    .area { background:#fff; border-radius:16px; padding:1.75rem; box-shadow:0 10px 30px rgba(0,0,0,.18); transition:.2s; border-top:5px solid; display:block; }
    .area:hover { transform:translateY(-5px); }
    .area-green { border-color:#16a34a; }
    .area-blue { border-color:#0284c7; }
    .area-teal { border-color:#0d9488; }
    .area .ic { font-size:2.4rem; }
    .area h2 { margin:.6rem 0 .3rem; font-size:1.3rem; }
    .area p { color:#64748b; font-size:.9rem; min-height:40px; }
    .area .go { font-weight:700; color:#15803d; font-size:.9rem; }
    .area-blue .go { color:#0369a1; } .area-teal .go { color:#0d9488; }
    .accesos { max-width:1100px; margin:0 auto; background:rgba(255,255,255,.95); border-radius:16px; padding:1.5rem 1.75rem; }
    .accesos h3 { margin-bottom:1rem; color:#0f172a; }
    .cols { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:1.25rem; }
    .cols h4 { font-size:.85rem; color:#0369a1; text-transform:uppercase; letter-spacing:.03em; margin-bottom:.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:.35rem; }
    .cols a { display:block; padding:.3rem 0; color:#334155; font-size:.88rem; }
    .cols a:hover { color:#16a34a; padding-left:.25rem; }
  `],
})
export class Inicio {}
