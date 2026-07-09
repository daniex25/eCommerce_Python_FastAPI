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
          <span class="logo"><i class="fa-solid fa-mortar-pestle"></i></span>
          <span><b>Botica Central</b><small>Tu farmacia 24/7 en Huacho</small></span>
        </a>
        <div class="t-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input class="inp" placeholder="Buscar medicamentos, marcas, dispositivos…" />
        </div>
        <nav class="t-links">
          <a routerLink="/tienda/catalogo" routerLinkActive="on">Catálogo</a>
          <a routerLink="/tienda/mis-compras" routerLinkActive="on">Mis compras</a>
          <a routerLink="/tienda/seguimiento" routerLinkActive="on">Seguimiento</a>
          <a routerLink="/tienda/carrito" class="t-cart" routerLinkActive="on">
            <i class="fa-solid fa-cart-shopping"></i> <span class="badge badge-green">{{ data.cantidadCarrito() }}</span>
          </a>
          @if (usuario(); as u) {
            <div class="t-acc"><div class="t-ava">{{ u.iniciales }}</div><span class="t-name">{{ u.nombre }}</span><button class="t-out" (click)="logout()">Salir</button></div>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm">Iniciar sesión</a>
          }
          <a routerLink="/" class="t-exit" title="Volver al inicio"><i class="fa-solid fa-house"></i></a>
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
    .t-shell { min-height:100vh; display:flex; flex-direction:column; background:var(--bg-galaxy-gradient); position:relative; overflow-x:hidden; }
    .t-shell::before {
      content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image:
        radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,.55), transparent),
        radial-gradient(1.5px 1.5px at 140px 90px, rgba(255,255,255,.4), transparent),
        radial-gradient(1px 1px at 300px 150px, rgba(255,255,255,.5), transparent),
        radial-gradient(1.5px 1.5px at 420px 60px, rgba(255,255,255,.35), transparent),
        radial-gradient(1px 1px at 90px 220px, rgba(255,255,255,.45), transparent),
        radial-gradient(1.5px 1.5px at 520px 260px, rgba(255,255,255,.4), transparent);
      background-repeat: repeat; background-size: 560px 320px;
      opacity:.6;
    }
    .t-nav, .t-main, .t-foot { position:relative; z-index:1; }
    .t-nav {
      background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border-bottom:1px solid var(--glass-border); position:sticky; top:0; z-index:20; box-shadow:var(--shadow-glass);
    }
    .t-nav-in { display:flex; align-items:center; gap:1.5rem; padding:.75rem 1.25rem; }
    .t-brand { display:flex; align-items:center; gap:.6rem; }
    .t-brand .logo { width:42px; height:42px; border-radius:11px; background:var(--accent-gradient); color:#fff; font-size:1.3rem; display:grid; place-items:center; box-shadow:var(--glow-blue-sm); }
    .t-brand b { display:block; font-size:1.05rem; color:var(--text-primary); }
    .t-brand small { display:block; font-size:.7rem; color:var(--text-secondary); }
    .t-search { flex:1; max-width:520px; display:flex; align-items:center; gap:.5rem; background:rgba(255,255,255,.05); border:1px solid var(--glass-border); border-radius:999px; padding:.15rem .9rem; color:var(--text-secondary); }
    .t-search input { border:none; background:transparent; box-shadow:none; }
    .t-search input:focus { box-shadow:none; }
    .t-links { display:flex; align-items:center; gap:1.25rem; margin-left:auto; }
    .t-links a { font-size:.9rem; font-weight:600; color:var(--text-secondary); }
    .t-links a.on, .t-links a:hover { color:var(--text-primary); }
    .t-cart { display:flex; align-items:center; gap:.35rem; }
    .t-acc { display:flex; align-items:center; gap:.5rem; }
    .t-ava { width:32px; height:32px; border-radius:50%; background:var(--accent-gradient); color:#fff; display:grid; place-items:center; font-weight:700; font-size:.72rem; }
    .t-name { font-size:.82rem; font-weight:600; color:var(--text-primary); }
    .t-out { border:1px solid var(--glass-border-strong); background:var(--glass-bg); border-radius:7px; padding:.25rem .6rem; font-size:.78rem; cursor:pointer; color:var(--danger); font-weight:600; }
    .t-exit { font-size:1.1rem; color:var(--text-secondary); }
    .t-main { flex:1; }
    .t-foot { background:rgba(2,6,23,.55); color:var(--text-secondary); font-size:.8rem; padding:1.25rem 0; margin-top:2rem; border-top:1px solid var(--glass-border); }
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
