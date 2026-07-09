import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="rec-wrap">
    <div class="rec-card">
      <a routerLink="/login" class="back">‹ Volver al inicio de sesión</a>
      <div class="logo">✚</div>

      @if (!enviado) {
        <h2>Recuperar contraseña</h2>
        <p class="muted">Ingresa el correo registrado y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form (ngSubmit)="enviar()" novalidate>
          <div class="field mt">
            <label>Correo electrónico</label>
            <input class="inp" [class.invalid]="err()" name="c" [(ngModel)]="correo" placeholder="usuario@correo.com" />
            @if (err()) { <span class="err">Ingresa un correo electrónico válido.</span> }
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt">Enviar enlace de restablecimiento</button>
        </form>
      } @else {
        <div class="ok">✓</div>
        <h2>Revisa tu correo</h2>
        <p class="muted">Si <b>{{ correo }}</b> está registrado, enviamos un enlace para restablecer tu contraseña. El enlace vence en 30 minutos.</p>
        <a routerLink="/login" class="btn btn-primary btn-block btn-lg mt">Volver al inicio de sesión</a>
      }
    </div>
  </div>
  `,
  styles: [`
    .rec-wrap { min-height:100vh; display:grid; place-items:center; padding:1.5rem; background:linear-gradient(160deg,#0369a1,#0d9488 60%,#15803d); }
    .rec-card { width:100%; max-width:420px; background:#fff; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,.25); padding:2rem; }
    .back { color:#0369a1; font-weight:600; font-size:.85rem; }
    .logo { width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg,#16a34a,#0d9488); color:#fff; display:grid; place-items:center; font-size:1.7rem; font-weight:900; margin:1.25rem 0 1rem; }
    .rec-card h2 { font-size:1.4rem; }
    .ok { width:60px; height:60px; border-radius:50%; background:#dcfce7; color:#16a34a; font-size:2rem; display:grid; place-items:center; margin:1.25rem 0 1rem; }
  `],
})
export class Recuperar {
  correo = '';
  enviado = false;
  err() { return this.intento && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo); }
  intento = false;
  enviar() { this.intento = true; if (!this.err()) this.enviado = true; }
}
