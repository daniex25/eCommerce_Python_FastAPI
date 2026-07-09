import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
  <div class="hub">
    <header class="hub-top">
      <div class="brand">
        <div class="logo"><i class="fa-solid fa-mortar-pestle"></i></div>
        <div>
          <div class="bn">Botica Central</div>
          <div class="bs">Sistema Integral de Gestión · Huacho, Huaura</div>
        </div>
      </div>
      <div class="hub-top-r">
        <span class="badge badge-green"><span class="dot" style="background:var(--ok)"></span> Atención 24/7</span>
        <a routerLink="/login" class="login-btn"><i class="fa-solid fa-lock"></i> Iniciar sesión</a>
      </div>
    </header>

    <div class="hero">
      <h1>Plataforma unificada de comercio y gestión farmacéutica</h1>
      <p>E-Commerce, punto de venta, inventario con trazabilidad de lotes, distribución y administración — en un solo lugar.</p>
    </div>

    <section class="areas">
      <a routerLink="/tienda/catalogo" class="area area-green">
        <div class="ic"><i class="fa-solid fa-cart-shopping"></i></div>
        <h2>Tienda Web</h2>
        <p>Catálogo, carrito, checkout y seguimiento de pedidos para clientes.</p>
        <span class="go">Entrar como Cliente →</span>
      </a>

      <a routerLink="/admin/reportes" class="area area-blue">
        <div class="ic"><i class="fa-solid fa-hospital"></i></div>
        <h2>Intranet Administrativa</h2>
        <p>POS, almacén, distribución, validación de recetas y reportes para el personal.</p>
        <span class="go">Entrar como Personal →</span>
      </a>

      <a routerLink="/repartidor/entregas" class="area area-teal">
        <div class="ic"><i class="fa-solid fa-motorcycle"></i></div>
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
    .hub { min-height:100vh; background:var(--bg-galaxy-gradient); padding:2rem 1.5rem 3rem; }
    .hub-top { max-width:1100px; margin:0 auto 2rem; display:flex; justify-content:space-between; align-items:center; }
    .brand { display:flex; gap:.85rem; align-items:center; color:var(--text-primary); }
    .logo { width:48px; height:48px; border-radius:12px; background:var(--accent-gradient); color:#fff; font-size:1.5rem; display:grid; place-items:center; box-shadow:var(--glow-blue-sm); }
    .bn { font-size:1.3rem; font-weight:800; }
    .bs { font-size:.8rem; color:var(--text-secondary); }
    .hub-top-r { display:flex; align-items:center; gap:1rem; }
    .login-btn { background:var(--accent-gradient); color:#fff; font-weight:700; padding:.5rem 1.1rem; border-radius:9px; font-size:.9rem; box-shadow:var(--glow-blue-sm); display:inline-flex; align-items:center; gap:.4rem; }
    .login-btn:hover { box-shadow:var(--glow-blue); }
    .hero { max-width:780px; margin:0 auto 2.5rem; text-align:center; color:var(--text-primary); }
    .hero h1 { font-size:2rem; line-height:1.2; }
    .hero p { color:var(--text-secondary); font-size:1.05rem; }
    .areas { max-width:1100px; margin:0 auto 2.5rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.25rem; }
    .area {
      background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border); border-radius:16px; padding:1.75rem; box-shadow:var(--shadow-glass);
      transition:.2s; border-top:3px solid; display:block;
    }
    .area:hover { transform:translateY(-5px); box-shadow:var(--shadow-glass-lg); }
    .area-green { border-top-color:var(--ok); }
    .area-blue { border-top-color:var(--accent-blue); }
    .area-teal { border-top-color:var(--accent-violet); }
    .area .ic { font-size:2rem; color:var(--accent-blue); }
    .area h2 { margin:.6rem 0 .3rem; font-size:1.3rem; color:var(--text-primary); }
    .area p { color:var(--text-secondary); font-size:.9rem; min-height:40px; }
    .area .go { font-weight:700; color:var(--accent-blue); font-size:.9rem; }
    .accesos {
      max-width:1100px; margin:0 auto; background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border); border-radius:16px; padding:1.5rem 1.75rem;
    }
    .accesos h3 { margin-bottom:1rem; color:var(--text-primary); }
    .cols { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:1.25rem; }
    .cols h4 { font-size:.85rem; color:var(--accent-blue); text-transform:uppercase; letter-spacing:.03em; margin-bottom:.5rem; border-bottom:1px solid var(--glass-border); padding-bottom:.35rem; }
    .cols a { display:block; padding:.3rem 0; color:var(--text-secondary); font-size:.88rem; }
    .cols a:hover { color:var(--text-primary); padding-left:.25rem; }
  `],
})
export class Inicio {}
