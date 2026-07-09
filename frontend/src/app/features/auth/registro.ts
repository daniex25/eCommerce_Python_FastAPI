import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth">
    <div class="brand-side">
      <a routerLink="/" class="b-logo"><span class="logo"><i class="fa-solid fa-mortar-pestle"></i></span><span>Botica Central</span></a>
      <div class="b-mid">
        <h1>Crea tu cuenta</h1>
        <p>Regístrate para comprar en línea, hacer seguimiento de tus pedidos y guardar tu historial de compras.</p>
        <ul class="b-feats">
          <li><i class="fa-solid fa-truck"></i> Entrega a domicilio en Huacho y alrededores</li>
          <li><i class="fa-solid fa-file-invoice"></i> Comprobantes electrónicos SUNAT</li>
          <li><i class="fa-solid fa-shield-halved"></i> Tus datos protegidos (RS0033)</li>
        </ul>
      </div>
      <div class="b-foot">Huacho · Huaura — Atención 24/7</div>
    </div>

    <div class="form-side">
      <div class="form-card">
        <div class="fc-head">
          <h2>Registro de cliente</h2>
          <p class="muted">Completa tus datos para crear tu cuenta.</p>
        </div>

        @if (mensaje) {
          <div class="notice notice-red">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>{{ mensaje }}</div>
          </div>
        }

        <form (ngSubmit)="registrar()" #f="ngForm" novalidate>
          <div class="field-row">
            <div class="field">
              <label>Nombres</label>
              <input class="inp" [class.invalid]="err('nombres')" name="nombres" [(ngModel)]="datos.nombres" required />
            </div>
            <div class="field">
              <label>Apellidos</label>
              <input class="inp" [class.invalid]="err('apellidos')" name="apellidos" [(ngModel)]="datos.apellidos" required />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label>DNI</label>
              <input class="inp" [class.invalid]="err('dni')" name="dni" [(ngModel)]="datos.dni" maxlength="15" required />
            </div>
            <div class="field">
              <label>Teléfono</label>
              <input class="inp" name="telefono" [(ngModel)]="datos.telefono" placeholder="987654321" />
            </div>
          </div>

          <div class="field">
            <label>Correo electrónico</label>
            <input class="inp" [class.invalid]="err('correo')" name="correo" [(ngModel)]="datos.correoElectronico" placeholder="usuario@correo.com" autocomplete="username" required />
            @if (enviado && err('correo')) { <span class="err">Ingresa un correo electrónico válido.</span> }
          </div>

          <div class="field">
            <label>Dirección de entrega</label>
            <input class="inp" name="direccion" [(ngModel)]="datos.direccion" placeholder="Av. Grau 521, Huacho" />
          </div>

          <div class="field">
            <label>Contraseña</label>
            <input class="inp" [class.invalid]="err('password')" type="password" name="password" [(ngModel)]="datos.password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required />
            @if (enviado && err('password')) { <span class="err">La contraseña debe tener al menos 6 caracteres.</span> }
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg mt" [disabled]="cargando">
            {{ cargando ? 'Creando cuenta…' : 'Crear mi cuenta →' }}
          </button>
        </form>

        <div class="reg muted small">¿Ya tienes cuenta? <a routerLink="/login" class="link">Inicia sesión</a></div>
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
      width:100%; max-width:480px; background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border); border-radius:16px; box-shadow:var(--shadow-glass-lg); padding:2rem;
    }
    .fc-head h2 { font-size:1.5rem; color:var(--text-primary); }
    .fc-head { margin-bottom:1.25rem; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
    .link { color:var(--accent-blue); font-weight:600; font-size:.85rem; cursor:pointer; }
    .link:hover { text-decoration:underline; }
    .reg { text-align:center; margin-top:1.25rem; }
    @media (max-width:860px){ .auth{ grid-template-columns:1fr; } .brand-side{ display:none; } .field-row{ grid-template-columns:1fr; } }
  `],
})
export class Registro {
  private auth = inject(AuthService);
  private router = inject(Router);

  datos = {
    nombres: '', apellidos: '', dni: '', telefono: '',
    correoElectronico: '', direccion: '', password: '',
  };
  enviado = false;
  cargando = false;
  mensaje = '';

  err(campo: 'nombres' | 'apellidos' | 'dni' | 'correo' | 'password'): boolean {
    if (!this.enviado) return false;
    switch (campo) {
      case 'nombres': return !this.datos.nombres.trim();
      case 'apellidos': return !this.datos.apellidos.trim();
      case 'dni': return !this.datos.dni.trim();
      case 'correo': return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.datos.correoElectronico);
      case 'password': return this.datos.password.length < 6;
    }
  }

  registrar() {
    this.enviado = true;
    this.mensaje = '';
    const invalido = (['nombres', 'apellidos', 'dni', 'correo', 'password'] as const).some((c) => this.err(c));
    if (invalido) return;

    this.cargando = true;
    this.auth.registrarCliente(this.datos).subscribe((r) => {
      this.cargando = false;
      if (r.ok && r.redirect) {
        this.router.navigateByUrl(r.redirect);
      } else {
        this.mensaje = r.mensaje || 'No se pudo crear la cuenta.';
      }
    });
  }
}
