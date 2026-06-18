import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-confirmacion',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="page">
    <div class="conf card">
      <div class="check">✓</div>
      <h1>¡Pedido confirmado!</h1>
      <p class="muted">Gracias por tu compra. Hemos recibido tu pago y estamos preparando tu pedido.</p>

      <div class="num-pedido">
        <span class="muted small">Número de pedido</span>
        <div class="num">#1050</div>
      </div>

      <div class="conf-grid">
        <div><span class="muted small">Comprobante</span><b>Boleta B001-00004522</b></div>
        <div><span class="muted small">Estado SUNAT</span><b class="ok">✓ Aceptado</b></div>
        <div><span class="muted small">Método de pago</span><b>Yape</b></div>
        <div><span class="muted small">Entrega estimada</span><b>Hoy, 18:00 - 20:00</b></div>
        <div><span class="muted small">Dirección</span><b>Av. Grau 521, Huacho</b></div>
        <div><span class="muted small">Total pagado</span><b class="price" style="font-size:1rem">S/ {{ (data.subtotalCarrito()+8).toFixed(2) }}</b></div>
      </div>

      <div class="pasos">
        <div class="paso on"><span>✓</span>Pago confirmado</div>
        <div class="ln"></div>
        <div class="paso"><span>2</span>En preparación</div>
        <div class="ln"></div>
        <div class="paso"><span>3</span>En ruta</div>
        <div class="ln"></div>
        <div class="paso"><span>4</span>Entregado</div>
      </div>

      <div class="flex center" style="justify-content:center">
        <a routerLink="/tienda/seguimiento" class="btn btn-primary">Seguir mi pedido</a>
        <a routerLink="/tienda/catalogo" class="btn btn-outline">Seguir comprando</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .conf { max-width:620px; margin:1.5rem auto; text-align:center; }
    .check { width:72px; height:72px; border-radius:50%; background:#dcfce7; color:#16a34a; font-size:2.4rem; display:grid; place-items:center; margin:0 auto 1rem; }
    .conf h1 { font-size:1.6rem; }
    .num-pedido { background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; padding:1rem; margin:1.5rem 0; }
    .num-pedido .num { font-size:2rem; font-weight:800; color:#0369a1; }
    .conf-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; text-align:left; margin:1.5rem 0; }
    .conf-grid div { display:flex; flex-direction:column; }
    .ok { color:#16a34a; }
    .pasos { display:flex; align-items:center; justify-content:center; margin:1.75rem 0; }
    .paso { display:flex; flex-direction:column; align-items:center; gap:.35rem; font-size:.72rem; color:#94a3b8; }
    .paso span { width:30px; height:30px; border-radius:50%; background:#e2e8f0; color:#64748b; display:grid; place-items:center; font-weight:700; }
    .paso.on { color:#15803d; } .paso.on span { background:#16a34a; color:#fff; }
    .ln { width:42px; height:2px; background:#e2e8f0; margin:0 .25rem; margin-bottom:1.1rem; }
    @media (max-width:560px){ .conf-grid{ grid-template-columns:1fr; } }
  `],
})
export class Confirmacion {
  data = inject(DataService);
}
