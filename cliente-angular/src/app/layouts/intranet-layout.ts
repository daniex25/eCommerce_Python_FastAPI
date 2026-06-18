import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-intranet-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="i-shell">
    <aside class="i-side">
      <a routerLink="/" class="i-brand">
        <span class="logo">✚</span>
        <span><b>Botica Central</b><small>Intranet</small></span>
      </a>
      <nav class="i-nav">
        <div class="grp">Comercializar</div>
        <a routerLink="/pos/venta" routerLinkActive="on"><span>🧾</span> POS — Venta</a>
        <a routerLink="/pos/comprobante" routerLinkActive="on"><span>📑</span> Comprobantes</a>

        <div class="grp">Almacén</div>
        <a routerLink="/almacen/inventario" routerLinkActive="on"><span>📦</span> Inventario</a>
        <a routerLink="/almacen/recepcion" routerLinkActive="on"><span>📥</span> Recepción</a>
        <a routerLink="/almacen/lotes" routerLinkActive="on"><span>🏷️</span> Lotes</a>
        <a routerLink="/almacen/fefo" routerLinkActive="on"><span>⏰</span> Alertas FEFO</a>
        <a routerLink="/almacen/proveedores" routerLinkActive="on"><span>🚚</span> Proveedores / OC</a>

        <div class="grp">Distribución</div>
        <a routerLink="/distribucion/asignacion" routerLinkActive="on"><span>🗺️</span> Asignar rutas</a>
        <a routerLink="/distribucion/incidencias" routerLinkActive="on"><span>⚠️</span> Incidencias</a>

        <div class="grp">Atención al cliente</div>
        <a routerLink="/atencion/recetas" routerLinkActive="on"><span>💊</span> Validar recetas</a>
        <a routerLink="/atencion/reclamos" routerLinkActive="on"><span>📨</span> Reclamos</a>
        <a routerLink="/atencion/fidelizacion" routerLinkActive="on"><span>🎁</span> Fidelización</a>

        <div class="grp">Administración</div>
        <a routerLink="/admin/caja" routerLinkActive="on"><span>💵</span> Arqueo de caja</a>
        <a routerLink="/admin/reportes" routerLinkActive="on"><span>📊</span> Reportes</a>
        <a routerLink="/admin/financiero" routerLinkActive="on"><span>📈</span> Financiero</a>
        <a routerLink="/admin/caja-chica" routerLinkActive="on"><span>🧾</span> Caja chica</a>
      </nav>
    </aside>

    <div class="i-body">
      <header class="i-top">
        <div class="i-top-l">Sistema de Gestión — Botica Central</div>
        <div class="i-user">
          <span class="badge badge-blue">Químico Farmacéutico</span>
          <div class="ava">QF</div>
          <div class="who"><b>Q.F. Andrea Salinas</b><small>Sede Huacho · Turno mañana</small></div>
        </div>
      </header>
      <main class="i-main"><router-outlet /></main>
    </div>
  </div>
  `,
  styles: [`
    .i-shell { display:flex; min-height:100vh; }
    .i-side { width:240px; background:#0f172a; color:#cbd5e1; flex-shrink:0; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto; }
    .i-brand { display:flex; align-items:center; gap:.6rem; padding:1.1rem 1.1rem; border-bottom:1px solid #1e293b; }
    .i-brand .logo { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,#16a34a,#0d9488); color:#fff; font-weight:900; display:grid; place-items:center; }
    .i-brand b { display:block; color:#fff; font-size:.98rem; }
    .i-brand small { color:#64748b; font-size:.72rem; }
    .i-nav { padding:.5rem .6rem 1.5rem; }
    .grp { font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:#475569; padding:.9rem .6rem .35rem; font-weight:700; }
    .i-nav a { display:flex; align-items:center; gap:.6rem; padding:.5rem .65rem; border-radius:8px; font-size:.86rem; color:#cbd5e1; margin-bottom:1px; }
    .i-nav a span { width:18px; text-align:center; }
    .i-nav a:hover { background:#1e293b; color:#fff; }
    .i-nav a.on { background:#16a34a; color:#fff; font-weight:600; }
    .i-body { flex:1; display:flex; flex-direction:column; min-width:0; }
    .i-top { background:#fff; border-bottom:1px solid #e2e8f0; padding:.7rem 1.5rem; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10; }
    .i-top-l { font-weight:600; color:#334155; font-size:.9rem; }
    .i-user { display:flex; align-items:center; gap:.7rem; }
    .ava { width:36px; height:36px; border-radius:50%; background:#0284c7; color:#fff; display:grid; place-items:center; font-weight:700; font-size:.8rem; }
    .who b { display:block; font-size:.82rem; }
    .who small { color:#94a3b8; font-size:.72rem; }
    .i-main { flex:1; background:#f1f5f9; }
    @media (max-width:880px){ .i-side{ width:64px; } .i-brand b,.i-brand small,.grp,.i-nav a span+*{ display:none; } .i-nav a{ justify-content:center; } .who{ display:none; } }
  `],
})
export class IntranetLayout {}
