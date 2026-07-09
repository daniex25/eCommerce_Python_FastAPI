import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-repartidor-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
  <div class="r-bg">
    <div class="phone">
      <div class="r-top">
        <div class="r-status"><span>9:41</span><span>📶 🔋</span></div>
        <div class="r-head">
          <a routerLink="/" class="r-back">‹</a>
          <div>
            <b>App Repartidor</b>
            <small>{{ usuario()?.nombre || 'Pedro Castillo' }} · Moto ABC-123</small>
          </div>
          <span class="badge badge-green">En línea</span>
        </div>
      </div>
      <div class="r-content"><router-outlet /></div>
      <nav class="r-tab">
        <a class="on">🛵<span>Entregas</span></a>
        <a>🗺️<span>Mapa</span></a>
        <a>📋<span>Historial</span></a>
        <a (click)="logout()" style="cursor:pointer">⏻<span>Salir</span></a>
      </nav>
    </div>
  </div>
  `,
  styles: [`
    .r-bg { min-height:100vh; background:linear-gradient(160deg,#0d9488,#0369a1); display:grid; place-items:center; padding:1.5rem; }
    .phone { width:390px; max-width:100%; height:780px; background:#f1f5f9; border-radius:32px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,.35); display:flex; flex-direction:column; border:8px solid #0f172a; }
    .r-top { background:#15803d; color:#fff; }
    .r-status { display:flex; justify-content:space-between; padding:.4rem 1.1rem .1rem; font-size:.72rem; opacity:.9; }
    .r-head { display:flex; align-items:center; gap:.6rem; padding:.5rem 1rem 1rem; }
    .r-back { font-size:1.6rem; line-height:1; }
    .r-head b { display:block; font-size:1rem; }
    .r-head small { font-size:.72rem; opacity:.85; }
    .r-head .badge { margin-left:auto; }
    .r-content { flex:1; overflow-y:auto; padding:1rem; }
    .r-tab { display:flex; background:#fff; border-top:1px solid #e2e8f0; }
    .r-tab a { flex:1; text-align:center; padding:.6rem 0 .8rem; font-size:1.3rem; color:#94a3b8; }
    .r-tab a span { display:block; font-size:.65rem; margin-top:.1rem; }
    .r-tab a.on { color:#16a34a; }
    @media (max-width:480px){ .r-bg{ padding:0; } .phone{ width:100%; height:100vh; border-radius:0; border:none; } }
  `],
})
export class RepartidorLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  usuario = this.auth.usuarioActual;
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
