import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Seguimiento de pedido</h1><div class="sub">Pedido #1044 · Realizado el 18/06/2026</div></div>

    <div class="seg-grid">
      <div class="card">
        <div class="flex between mb">
          <h3>Estado del envío</h3>
          <span class="badge badge-blue">En ruta</span>
        </div>

        <div class="timeline">
          <div class="tl done">
            <div class="tl-dot">✓</div>
            <div class="tl-body"><b>Pago confirmado</b><div class="muted small">18/06 · 09:12 — Pago por PagoEfectivo aprobado</div></div>
          </div>
          <div class="tl done">
            <div class="tl-dot">✓</div>
            <div class="tl-body"><b>En preparación</b><div class="muted small">18/06 · 09:40 — Pedido alistado en Botica Central</div></div>
          </div>
          <div class="tl active">
            <div class="tl-dot">🛵</div>
            <div class="tl-body"><b>En ruta</b><div class="muted small">18/06 · 11:05 — Pedro Castillo va camino a tu dirección</div></div>
          </div>
          <div class="tl">
            <div class="tl-dot">4</div>
            <div class="tl-body"><b>Entregado</b><div class="muted small">Estimado hoy entre 12:00 y 13:30</div></div>
          </div>
        </div>
      </div>

      <aside class="flex-col" style="gap:1.25rem">
        <div class="card">
          <h3>Repartidor</h3>
          <div class="rep"><div class="ava">PC</div><div><b>Pedro Castillo</b><div class="muted small">Moto · ABC-123</div></div></div>
          <button class="btn btn-outline btn-block btn-sm mt">📞 Llamar al repartidor</button>
        </div>
        <div class="card">
          <h3>Detalle</h3>
          <div class="d-line"><span>Protector Solar FPS 50+</span><b>S/ 68.00</b></div>
          <div class="d-line"><span>Loratadina 10mg</span><b>S/ 7.50</b></div>
          <div class="d-line"><span>Envío</span><b>S/ 8.00</b></div>
          <div class="d-total"><span>Total</span><span class="price" style="font-size:1.1rem">S/ 83.50</span></div>
          <div class="muted small mt">📍 Calle Lima 340, Hualmay</div>
        </div>
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .seg-grid { display:grid; grid-template-columns:1fr 300px; gap:1.25rem; align-items:start; }
    .timeline { position:relative; padding-left:.5rem; }
    .tl { display:flex; gap:1rem; padding-bottom:1.5rem; position:relative; }
    .tl:not(:last-child)::before { content:''; position:absolute; left:15px; top:32px; bottom:0; width:2px; background:#e2e8f0; }
    .tl.done:not(:last-child)::before { background:#16a34a; }
    .tl-dot { width:32px; height:32px; border-radius:50%; background:#e2e8f0; color:#64748b; display:grid; place-items:center; font-weight:700; flex-shrink:0; z-index:1; }
    .tl.done .tl-dot { background:#16a34a; color:#fff; }
    .tl.active .tl-dot { background:#0284c7; color:#fff; box-shadow:0 0 0 4px #e0f2fe; }
    .rep { display:flex; gap:.7rem; align-items:center; }
    .ava { width:42px; height:42px; border-radius:50%; background:#0284c7; color:#fff; display:grid; place-items:center; font-weight:700; }
    .d-line { display:flex; justify-content:space-between; font-size:.86rem; padding:.3rem 0; color:#475569; }
    .d-total { display:flex; justify-content:space-between; align-items:center; padding-top:.6rem; margin-top:.4rem; border-top:1px solid #f1f5f9; font-weight:800; }
    @media (max-width:760px){ .seg-grid{ grid-template-columns:1fr; } }
  `],
})
export class Seguimiento {}
