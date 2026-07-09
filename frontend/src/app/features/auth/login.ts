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
      <a routerLink="/" class="b-logo"><span class="logo">✚</span><span>Botica Central</span></a>
      <div class="b-mid">
        <h1>Bienvenido al Sistema Integral</h1>
        <p>Gestión farmacéutica, e-commerce, inventario y distribución — en una sola plataforma segura.</p>
        <ul class="b-feats">
          <li>🔒 Acceso con credenciales únicas por rol</li>
          <li>🏥 Tienda web, intranet y app de reparto</li>
          <li>🧾 Comprobantes electrónicos SUNAT</li>
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
          <div class="notice" [class.notice-red]="tipo!=='inactivo'" [class.notice-amber]="tipo==='bloqueada'" [class.notice-blue]="tipo==='inactivo'">
            <span>{{ tipo==='bloqueada' ? '🔒' : tipo==='inactivo' ? 'ℹ️' : '⚠️' }}</span>
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
              <button type="button" class="eye" (click)="ver = !ver" tabindex="-1">{{ ver ? '🙈' : '👁️' }}</button>
            </div>
            @if (passErr()) { <span class="err">La contraseña es obligatoria.</span> }
          </div>

          <div class="flex between">
            <label class="rec"><input type="checkbox" name="rec" [(ngModel)]="recordar" /> Recordarme</label>
            <a routerLink="/recuperar" class="link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg mt">Ingresar →</button>
        </form>

        <div class="demo">
          <div class="demo-t">Accesos de demostración <span class="muted small">(contraseña: <b>123456</b>)</span></div>
          <div class="demo-chips">
            <button class="chip" (click)="quick('cliente@correo.com')">🛒 Cliente</button>
            <button class="chip" (click)="quick('tecnico@boticacentral.pe')">🧾 Téc. Farmacia</button>
            <button class="chip" (click)="quick('quimico@boticacentral.pe')">💊 Q. Farmacéutico</button>
            <button class="chip" (click)="quick('almacen@boticacentral.pe')">📦 Almacén</button>
            <button class="chip" (click)="quick('admin@boticacentral.pe')">📊 Administrador</button>
            <button class="chip" (click)="quick('repartidor@boticacentral.pe')">🛵 Repartidor</button>
            <button class="chip warn" (click)="quick('cesado@boticacentral.pe')">🚫 Cuenta inactiva</button>
          </div>
        </div>

        <div class="reg muted small">¿Eres cliente nuevo? <a class="link">Crea tu cuenta</a></div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth { min-height:100vh; display:grid; grid-template-columns:1.05fr 1fr; }
    .brand-side { background:linear-gradient(160deg,#0369a1 0%,#0d9488 55%,#15803d 100%); color:#fff; padding:2.5rem; display:flex; flex-direction:column; justify-content:space-between; }
    .b-logo { display:flex; align-items:center; gap:.6rem; font-weight:800; font-size:1.25rem; }
    .b-logo .logo { width:42px; height:42px; border-radius:11px; background:#fff; color:#15803d; display:grid; place-items:center; font-size:1.5rem; font-weight:900; }
    .b-mid h1 { font-size:2rem; line-height:1.15; margin-bottom:.75rem; }
    .b-mid p { opacity:.9; font-size:1.05rem; max-width:420px; }
    .b-feats { list-style:none; padding:0; margin:1.75rem 0 0; display:flex; flex-direction:column; gap:.7rem; }
    .b-feats li { background:rgba(255,255,255,.12); padding:.6rem .9rem; border-radius:9px; font-size:.92rem; }
    .b-foot { opacity:.8; font-size:.85rem; }

    .form-side { display:grid; place-items:center; padding:2rem; background:#f1f5f9; }
    .form-card { width:100%; max-width:420px; background:#fff; border:1px solid #e2e8f0; border-radius:16px; box-shadow:0 10px 30px rgba(15,23,42,.08); padding:2rem; }
    .fc-head h2 { font-size:1.5rem; }
    .fc-head { margin-bottom:1.25rem; }
    .pass { position:relative; }
    .pass .eye { position:absolute; right:.5rem; top:50%; transform:translateY(-50%); border:none; background:none; cursor:pointer; font-size:1rem; }
    .rec { font-size:.85rem; color:#475569; display:flex; align-items:center; gap:.4rem; }
    .link { color:#0369a1; font-weight:600; font-size:.85rem; cursor:pointer; }
    .link:hover { text-decoration:underline; }
    .demo { margin-top:1.5rem; border-top:1px dashed #e2e8f0; padding-top:1rem; }
    .demo-t { font-size:.82rem; font-weight:600; color:#334155; margin-bottom:.6rem; }
    .demo-chips { display:flex; flex-wrap:wrap; gap:.4rem; }
    .chip { border:1px solid #cbd5e1; background:#f8fafc; border-radius:999px; padding:.35rem .7rem; font-size:.78rem; cursor:pointer; font-weight:600; color:#334155; }
    .chip:hover { border-color:#16a34a; color:#15803d; }
    .chip.warn:hover { border-color:#dc2626; color:#dc2626; }
    .reg { text-align:center; margin-top:1.25rem; }
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
  mensaje = '';
  tipo: string | undefined;

  correoErr() { return this.enviado && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo); }
  passErr() { return this.enviado && !this.password; }

  quick(correo: string) { this.correo = correo; this.password = '123456'; this.ingresar(); }

  ingresar() {
    this.enviado = true;
    this.mensaje = '';
    if (this.correoErr() || this.passErr()) return;

    const r = this.auth.login(this.correo, this.password);
    if (r.ok && r.redirect) {
      this.router.navigateByUrl(r.redirect);
    } else {
      this.tipo = r.tipo;
      this.mensaje = r.mensaje || 'No se pudo iniciar sesión.';
    }
  }
}
