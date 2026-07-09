import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-recuperar',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="rec-wrap">
    <div class="rec-card">
      <a routerLink="/login" class="back">‹ Volver al inicio de sesión</a>
      <div class="logo"><i class="fa-solid fa-mortar-pestle"></i></div>

      @if (!enviado) {
        <h2>Recuperar contraseña</h2>
        <p class="muted">Ingresa el correo registrado y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form (ngSubmit)="enviar()" novalidate>
          <div class="field mt">
            <label>Correo electrónico</label>
            <input class="inp" [class.invalid]="err()" name="c" [(ngModel)]="correo" placeholder="usuario@correo.com" />
            @if (err()) { <span class="err">Ingresa un correo electrónico válido.</span> }
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt" [disabled]="cargando">
            {{ cargando ? 'Enviando…' : 'Enviar enlace de restablecimiento' }}
          </button>
        </form>
      } @else {
        <div class="ok"><i class="fa-solid fa-check"></i></div>
        <h2>Revisa tu correo</h2>
        <p class="muted">Si <b>{{ correo }}</b> está registrado, enviamos un enlace para restablecer tu contraseña. El enlace vence en 30 minutos.</p>
        <a routerLink="/login" class="btn btn-primary btn-block btn-lg mt">Volver al inicio de sesión</a>
      }
    </div>
  </div>
  `,
  styles: [`
    .rec-wrap { min-height:100vh; display:grid; place-items:center; padding:1.5rem; background:var(--bg-galaxy-gradient); }
    .rec-card {
      width:100%; max-width:420px; background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
      border:1px solid var(--glass-border); border-radius:16px; box-shadow:var(--shadow-glass-lg); padding:2rem;
    }
    .back { color:var(--accent-blue); font-weight:600; font-size:.85rem; }
    .logo { width:48px; height:48px; border-radius:12px; background:var(--accent-gradient); color:#fff; display:grid; place-items:center; font-size:1.4rem; box-shadow:var(--glow-blue-sm); margin:1.25rem 0 1rem; }
    .rec-card h2 { font-size:1.4rem; color:var(--text-primary); }
    .ok { width:60px; height:60px; border-radius:50%; background:var(--ok-bg); color:var(--ok); font-size:1.6rem; display:grid; place-items:center; margin:1.25rem 0 1rem; }
  `],
})
export class Recuperar {
  private auth = inject(AuthService);

  correo = '';
  enviado = false;
  cargando = false;
  intento = false;

  err() { return this.intento && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo); }

  enviar() {
    this.intento = true;
    if (this.err()) return;

    this.cargando = true;
    this.auth.recuperarPassword(this.correo).subscribe(() => {
      this.cargando = false;
      this.enviado = true;
    });
  }
}
