import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth">
    <!-- Panel de marca -->
    <div class="brand-side">
      <a routerLink="/" class="b-logo"><span class="logo"><i class="fa-solid fa-mortar-pestle"></i></span><span>Botica Central</span></a>
      <div class="b-mid">
        <h1>Bienvenido al Sistema Integral</h1>
        <p>Gestión farmacéutica, e-commerce, inventario y distribución — en una sola plataforma segura.</p>
        <ul class="b-feats">
          <li><i class="fa-solid fa-lock"></i> Acceso con credenciales únicas por rol</li>
          <li><i class="fa-solid fa-hospital"></i> Tienda web, intranet y app de reparto</li>
          <li><i class="fa-solid fa-file-invoice"></i> Comprobantes electrónicos SUNAT</li>
        </ul>
      </div>
      <div class="b-foot">Huacho · Huaura — Atención 24/7</div>
    </div>

    <!-- Formulario -->
    <div class="form-side">
      <div class="form-card">
        <div class="fc-head">
          <h2>Iniciar sesión</h2>
          <p class="muted">Ingresa tus credenciales para acceder al sistema.</p>
        </div>

        @if (mensaje) {
          <div class="notice notice-red">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>{{ mensaje }}</div>
          </div>
        }

        <form (ngSubmit)="ingresar()" #f="ngForm" novalidate>
          <div class="field">
            <label>Correo electrónico</label>
            <input class="inp" [class.invalid]="correoErr()" name="correo" [(ngModel)]="correo" placeholder="usuario@correo.com" autocomplete="username" />
            @if (correoErr()) { <span class="err">Ingresa un correo electrónico válido.</span> }
          </div>

          <div class="field">
            <label>Contraseña</label>
            <div class="pass">
              <input class="inp" [type]="ver ? 'text' : 'password'" [class.invalid]="passErr()" name="pass" [(ngModel)]="password" placeholder="••••••••" autocomplete="current-password" />
              <button type="button" class="eye" (click)="ver = !ver" tabindex="-1"><i class="fa-solid" [class.fa-eye-slash]="ver" [class.fa-eye]="!ver"></i></button>
            </div>
            @if (passErr()) { <span class="err">La contraseña es obligatoria.</span> }
          </div>

          <div class="flex between">
            <label class="rec"><input type="checkbox" name="rec" [(ngModel)]="recordar" /> Recordarme</label>
            <a routerLink="/recuperar" class="link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg mt" [disabled]="cargando">
            {{ cargando ? 'Ingresando…' : 'Ingresar →' }}
          </button>
        </form>

        <div class="demo">
          <div class="demo-t">Accesos de demostración <span class="muted small">(contraseña: <b>123456</b>)</span></div>
          <div class="demo-chips">
            <button class="chip" (click)="quick('cliente@correo.com')"><i class="fa-solid fa-cart-shopping"></i> Cliente</button>
            <button class="chip" (click)="quick('tecnico@boticacentral.pe')"><i class="fa-solid fa-file-invoice"></i> Téc. Farmacia</button>
            <button class="chip" (click)="quick('quimico@boticacentral.pe')"><i class="fa-solid fa-pills"></i> Q. Farmacéutico</button>
            <button class="chip" (click)="quick('almacen@boticacentral.pe')"><i class="fa-solid fa-boxes-stacked"></i> Almacén</button>
            <button class="chip" (click)="quick('admin@boticacentral.pe')"><i class="fa-solid fa-chart-column"></i> Administrador</button>
            <button class="chip" (click)="quick('repartidor@boticacentral.pe')"><i class="fa-solid fa-motorcycle"></i> Repartidor</button>
            <button class="chip warn" (click)="quick('cesado@boticacentral.pe')"><i class="fa-solid fa-ban"></i> Cuenta inactiva</button>
          </div>
        </div>

        <div class="reg muted small">¿Eres cliente nuevo? <a routerLink="/registro" class="link">Crea tu cuenta</a></div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth { min-height:100vh; display:grid; grid-template-columns:1.05fr 1fr; background:var(--bg-galaxy-gradient); }
    .brand-side { color:var(--text-primary); padding:2.5rem; display:flex; flex-direction:column; justify-content:space-between; }
    .b-logo { display:flex; align-items:center; gap:.6rem; font-weight:800; font-size:1.25rem; color:var(--text-primary); }
    .b-logo .logo { width:42px; height:42px; border-radius:11px; background:var(--accent-gradient); color:#fff; display:grid; place-items:center; font-size:1.3rem; box-shadow:var(--glow-blue-sm); }
    .b-mid h1 { font-size:2rem; line-height:1.15; margin-bottom:.75rem; }
    .b-mid p { color:var(--text-secondary); font-size:1.05rem; max-width:420px; }
    .b-feats { list-style:none; padding:0; margin:1.75rem 0 0; display:flex; flex-direction:column; gap:.7rem; }
    .b-feats li { background:var(--glass-bg); border:1px solid var(--glass-border); padding:.6rem .9rem; border-radius:9px; font-size:.92rem; display:flex; align-items:center; gap:.6rem; }
    .b-feats li i { color:var(--accent-blue); }
    .b-foot { color:var(--text-secondary); font-size:.85rem; }

    .form-side { display:grid; place-items:center; padding:2rem; }
    .form-card {
      width:100%; max-width:420px; background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border); border-radius:16px; box-shadow:var(--shadow-glass-lg); padding:2rem;
    }
    .fc-head h2 { font-size:1.5rem; color:var(--text-primary); }
    .fc-head { margin-bottom:1.25rem; }
    .pass { position:relative; }
    .pass .eye { position:absolute; right:.5rem; top:50%; transform:translateY(-50%); border:none; background:none; cursor:pointer; font-size:1rem; color:var(--text-secondary); }
    .rec { font-size:.85rem; color:var(--text-secondary); display:flex; align-items:center; gap:.4rem; }
    .link { color:var(--accent-blue); font-weight:600; font-size:.85rem; cursor:pointer; }
    .link:hover { text-decoration:underline; }
    .demo { margin-top:1.5rem; border-top:1px dashed var(--glass-border); padding-top:1rem; }
    .demo-t { font-size:.82rem; font-weight:600; color:var(--text-secondary); margin-bottom:.6rem; }
    .demo-chips { display:flex; flex-wrap:wrap; gap:.4rem; }
    .chip { border:1px solid var(--glass-border-strong); background:var(--glass-bg); border-radius:999px; padding:.35rem .7rem; font-size:.78rem; cursor:pointer; font-weight:600; color:var(--text-secondary); }
    .chip:hover { border-color:var(--accent-blue); color:var(--text-primary); }
    .chip.warn:hover { border-color:var(--danger); color:var(--danger); }
    .reg { text-align:center; margin-top:1.25rem; color:var(--text-secondary); }
    @media (max-width:860px){ .auth{ grid-template-columns:1fr; } .brand-side{ display:none; } }
  `],
})
export class Login {
  auth = inject(AuthService);
  router = inject(Router);
  correo = '';
  password = '';
  ver = false;
  recordar = false;
  enviado = false;
  cargando = false;
  mensaje = '';

  correoErr() { return this.enviado && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo); }
  passErr() { return this.enviado && !this.password; }

  quick(correo: string) { this.correo = correo; this.password = '123456'; this.ingresar(); }

  ingresar() {
    this.enviado = true;
    this.mensaje = '';
    if (this.correoErr() || this.passErr()) return;

    this.cargando = true;
    this.auth.login(this.correo, this.password).subscribe((r) => {
      this.cargando = false;
      if (r.ok && r.redirect) {
        this.router.navigateByUrl(r.redirect);
      } else {
        this.mensaje = r.mensaje || 'No se pudo iniciar sesión.';
      }
    });
  }
}
