import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DataService } from '../core/data.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-tienda-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="t-shell">
    <header class="t-nav">
      <div class="t-nav-in container">
        <a routerLink="/tienda/catalogo" class="t-brand">
          <span class="logo">✚</span>
          <span><b>Botica Central</b><small>Tu farmacia 24/7 en Huacho</small></span>
        </a>
        <div class="t-search">
          <span>🔍</span>
          <input class="inp" placeholder="Buscar medicamentos, marcas, dispositivos…" />
        </div>
        <nav class="t-links">
          <a routerLink="/tienda/catalogo" routerLinkActive="on">Catálogo</a>
          <a routerLink="/tienda/mis-compras" routerLinkActive="on">Mis compras</a>
          <a routerLink="/tienda/seguimiento" routerLinkActive="on">Seguimiento</a>
          <a routerLink="/tienda/carrito" class="t-cart" routerLinkActive="on">
            🛒 <span class="badge badge-green">{{ data.cantidadCarrito() }}</span>
          </a>
          @if (usuario(); as u) {
            <div class="t-acc"><div class="t-ava">{{ u.iniciales }}</div><span class="t-name">{{ u.nombre }}</span><button class="t-out" (click)="logout()">Salir</button></div>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm">Iniciar sesión</a>
          }
          <a routerLink="/" class="t-exit" title="Volver al inicio">⌂</a>
        </nav>
      </div>
    </header>
    <main class="t-main"><router-outlet /></main>
    <footer class="t-foot">
      <div class="container">Botica Central · Av. Grau 521, Huacho — Huaura · RUC 20512345678 · Atención 24/7 · Comprobantes electrónicos SUNAT</div>
    </footer>
  </div>
  `,
  styles: [`
    .t-shell { min-height:100vh; display:flex; flex-direction:column; background:#f1f5f9; }
    .t-nav { background:#fff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; z-index:20; box-shadow:0 1px 3px rgba(15,23,42,.06); }
    .t-nav-in { display:flex; align-items:center; gap:1.5rem; padding:.75rem 1.25rem; }
    .t-brand { display:flex; align-items:center; gap:.6rem; }
    .t-brand .logo { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#16a34a,#0d9488); color:#fff; font-weight:900; font-size:1.4rem; display:grid; place-items:center; }
    .t-brand b { display:block; font-size:1.05rem; color:#15803d; }
    .t-brand small { display:block; font-size:.7rem; color:#94a3b8; }
    .t-search { flex:1; max-width:520px; display:flex; align-items:center; gap:.5rem; background:#f1f5f9; border-radius:999px; padding:.15rem .9rem; }
    .t-search input { border:none; background:transparent; box-shadow:none; }
    .t-search input:focus { box-shadow:none; }
    .t-links { display:flex; align-items:center; gap:1.25rem; margin-left:auto; }
    .t-links a { font-size:.9rem; font-weight:600; color:#334155; }
    .t-links a.on, .t-links a:hover { color:#16a34a; }
    .t-cart { display:flex; align-items:center; gap:.35rem; }
    .t-acc { display:flex; align-items:center; gap:.5rem; }
    .t-ava { width:32px; height:32px; border-radius:50%; background:#16a34a; color:#fff; display:grid; place-items:center; font-weight:700; font-size:.72rem; }
    .t-name { font-size:.82rem; font-weight:600; }
    .t-out { border:1px solid #e2e8f0; background:#fff; border-radius:7px; padding:.25rem .6rem; font-size:.78rem; cursor:pointer; color:#dc2626; font-weight:600; }
    .t-exit { font-size:1.3rem; }
    .t-main { flex:1; }
    .t-foot { background:#0f172a; color:#94a3b8; font-size:.8rem; padding:1.25rem 0; margin-top:2rem; }
    @media (max-width:760px){ .t-search{ display:none; } .t-brand small{ display:none; } }
  `],
})
export class TiendaLayout {
  data = inject(DataService);
  private auth = inject(AuthService);
  private router = inject(Router);
  usuario = this.auth.usuarioActual;
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
