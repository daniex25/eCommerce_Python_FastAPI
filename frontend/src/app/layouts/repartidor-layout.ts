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
        <div class="r-status"><span>9:41</span><span><i class="fa-solid fa-signal"></i> <i class="fa-solid fa-battery-full"></i></span></div>
        <div class="r-head">
          <a routerLink="/" class="r-back"><i class="fa-solid fa-chevron-left"></i></a>
          <div>
            <b>App Repartidor</b>
            <small>{{ usuario()?.nombre || 'Pedro Castillo' }} · Moto ABC-123</small>
          </div>
          <span class="badge badge-green">En línea</span>
        </div>
      </div>
      <div class="r-content"><router-outlet /></div>
      <nav class="r-tab">
        <a class="on"><i class="fa-solid fa-motorcycle"></i><span>Entregas</span></a>
        <a><i class="fa-solid fa-map-location-dot"></i><span>Mapa</span></a>
        <a><i class="fa-solid fa-clipboard-list"></i><span>Historial</span></a>
        <a (click)="logout()" style="cursor:pointer"><i class="fa-solid fa-right-from-bracket"></i><span>Salir</span></a>
      </nav>
    </div>
  </div>
  `,
  styles: [`
    .r-bg { min-height:100vh; background:var(--bg-galaxy-gradient); display:grid; place-items:center; padding:1.5rem; }
    .phone {
      width:390px; max-width:100%; height:780px; border-radius:32px; overflow:hidden; display:flex; flex-direction:column;
      background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border-strong); box-shadow:var(--shadow-glass-lg);
    }
    .r-top { background:var(--accent-gradient); color:#fff; }
    .r-status { display:flex; justify-content:space-between; padding:.4rem 1.1rem .1rem; font-size:.72rem; opacity:.9; }
    .r-head { display:flex; align-items:center; gap:.6rem; padding:.5rem 1rem 1rem; }
    .r-back { font-size:1.3rem; line-height:1; color:#fff; }
    .r-head b { display:block; font-size:1rem; }
    .r-head small { font-size:.72rem; opacity:.85; }
    .r-head .badge { margin-left:auto; }
    .r-content { flex:1; overflow-y:auto; padding:1rem; }
    .r-tab { display:flex; background:var(--glass-bg-strong); border-top:1px solid var(--glass-border); }
    .r-tab a { flex:1; text-align:center; padding:.6rem 0 .8rem; font-size:1.15rem; color:var(--text-secondary); cursor:pointer; }
    .r-tab a span { display:block; font-size:.65rem; margin-top:.15rem; }
    .r-tab a.on { color:var(--accent-blue); }
    @media (max-width:480px){ .r-bg{ padding:0; } .phone{ width:100%; height:100vh; border-radius:0; border:none; } }
  `],
})
export class RepartidorLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  usuario = this.auth.usuarioActual;
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
