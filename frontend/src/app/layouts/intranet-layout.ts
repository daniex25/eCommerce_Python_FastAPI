import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-intranet-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="i-shell">
    <aside class="i-side">
      <a routerLink="/" class="i-brand">
        <span class="logo"><i class="fa-solid fa-mortar-pestle"></i></span>
        <span><b>Botica Central</b><small>Intranet</small></span>
      </a>
      <nav class="i-nav">
        <div class="grp">Comercializar</div>
        <a routerLink="/pos/venta" routerLinkActive="on"><i class="fa-solid fa-cash-register"></i> POS — Venta</a>
        <a routerLink="/pos/comprobante" routerLinkActive="on"><i class="fa-solid fa-file-invoice"></i> Comprobantes</a>

        <div class="grp">Almacén</div>
        <a routerLink="/almacen/inventario" routerLinkActive="on"><i class="fa-solid fa-boxes-stacked"></i> Inventario</a>
        <a routerLink="/almacen/recepcion" routerLinkActive="on"><i class="fa-solid fa-truck-ramp-box"></i> Recepción</a>
        <a routerLink="/almacen/lotes" routerLinkActive="on"><i class="fa-solid fa-tags"></i> Lotes</a>
        <a routerLink="/almacen/fefo" routerLinkActive="on"><i class="fa-solid fa-triangle-exclamation"></i> Alertas FEFO</a>
        <a routerLink="/almacen/proveedores" routerLinkActive="on"><i class="fa-solid fa-truck"></i> Proveedores / OC</a>

        <div class="grp">Distribución</div>
        <a routerLink="/distribucion/asignacion" routerLinkActive="on"><i class="fa-solid fa-route"></i> Asignar rutas</a>
        <a routerLink="/distribucion/incidencias" routerLinkActive="on"><i class="fa-solid fa-circle-exclamation"></i> Incidencias</a>

        <div class="grp">Atención al cliente</div>
        <a routerLink="/atencion/recetas" routerLinkActive="on"><i class="fa-solid fa-file-medical"></i> Validar recetas</a>
        <a routerLink="/atencion/reclamos" routerLinkActive="on"><i class="fa-solid fa-envelope-open-text"></i> Reclamos</a>
        <a routerLink="/atencion/fidelizacion" routerLinkActive="on"><i class="fa-solid fa-gift"></i> Fidelización</a>

        <div class="grp">Administración</div>
        <a routerLink="/admin/caja" routerLinkActive="on"><i class="fa-solid fa-sack-dollar"></i> Arqueo de caja</a>
        <a routerLink="/admin/reportes" routerLinkActive="on"><i class="fa-solid fa-chart-column"></i> Reportes</a>
        <a routerLink="/admin/financiero" routerLinkActive="on"><i class="fa-solid fa-chart-line"></i> Financiero</a>
        <a routerLink="/admin/caja-chica" routerLinkActive="on"><i class="fa-solid fa-receipt"></i> Caja chica</a>
      </nav>
    </aside>

    <div class="i-body">
      <header class="i-top">
        <div class="i-top-l">Sistema de Gestión — Botica Central</div>
        <div class="i-user">
          <span class="badge badge-blue">{{ usuario()?.rol || 'Químico Farmacéutico' }}</span>
          <div class="ava">{{ usuario()?.iniciales || 'AS' }}</div>
          <div class="who"><b>{{ usuario()?.nombre || 'Q.F. Andrea Salinas' }}</b><small>Sede Huacho · Turno mañana</small></div>
          <button class="salir" (click)="logout()" title="Cerrar sesión"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      </header>
      <main class="i-main"><router-outlet /></main>
    </div>
  </div>
  `,
  styles: [`
    .i-shell { display:flex; min-height:100vh; background:var(--bg-galaxy-gradient); }
    .i-side {
      width:250px; flex-shrink:0; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto;
      background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border-right:1px solid var(--glass-border);
    }
    .i-brand { display:flex; align-items:center; gap:.6rem; padding:1.1rem 1.1rem; border-bottom:1px solid var(--glass-border); }
    .i-brand .logo { width:38px; height:38px; border-radius:10px; background:var(--accent-gradient); color:#fff; font-size:1.05rem; display:grid; place-items:center; box-shadow:var(--glow-blue-sm); }
    .i-brand b { display:block; color:var(--text-primary); font-size:.98rem; }
    .i-brand small { color:var(--text-secondary); font-size:.72rem; }
    .i-nav { padding:.5rem .6rem 1.5rem; }
    .grp { font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:var(--text-secondary); padding:.9rem .6rem .35rem; font-weight:700; }
    .i-nav a { display:flex; align-items:center; gap:.65rem; padding:.55rem .65rem; border-radius:var(--radio-sm); font-size:.86rem; color:var(--text-secondary); margin-bottom:1px; transition:.15s; }
    .i-nav a i { width:18px; text-align:center; color:var(--accent-blue); }
    .i-nav a:hover { background:var(--glass-bg-strong); color:var(--text-primary); }
    .i-nav a.on { background:var(--accent-gradient); color:#fff; font-weight:600; box-shadow:var(--glow-blue-sm); }
    .i-nav a.on i { color:#fff; }
    .i-body { flex:1; display:flex; flex-direction:column; min-width:0; }
    .i-top {
      background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border-bottom:1px solid var(--glass-border); padding:.7rem 1.5rem; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10;
    }
    .i-top-l { font-weight:600; color:var(--text-primary); font-size:.9rem; }
    .i-user { display:flex; align-items:center; gap:.7rem; }
    .ava { width:36px; height:36px; border-radius:50%; background:var(--accent-gradient); color:#fff; display:grid; place-items:center; font-weight:700; font-size:.8rem; }
    .who b { display:block; font-size:.82rem; color:var(--text-primary); }
    .who small { color:var(--text-secondary); font-size:.72rem; }
    .salir { border:1px solid var(--glass-border-strong); background:var(--glass-bg); width:34px; height:34px; border-radius:var(--radio-sm); cursor:pointer; font-size:.95rem; color:var(--danger); }
    .salir:hover { background:var(--danger-bg); border-color:var(--danger); }
    .i-main { flex:1; }
    @media (max-width:880px){ .i-side{ width:64px; } .i-brand b,.i-brand small,.grp,.i-nav a span+*{ display:none; } .i-nav a{ justify-content:center; } .who{ display:none; } }
  `],
})
export class IntranetLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  usuario = this.auth.usuarioActual;
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
