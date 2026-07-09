import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';
import { Lote } from '../../core/models';

@Component({
  selector: 'app-fefo',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Panel de alertas de caducidad (FEFO)</h1><div class="sub">Productos próximos a vencer (&lt; 90 días) — control sanitario DIGEMID</div></div>

    <div class="stats mb">
      <div class="stat" style="border-left:4px solid #dc2626"><div class="label">Alerta Roja (&lt; 90 días)</div><div class="value" style="color:#dc2626">{{ alertaRoja().length }}</div></div>
      <div class="stat" style="border-left:4px solid #d97706"><div class="label">Stock comprometido</div><div class="value">{{ stockComprometido() }} und</div></div>
      <div class="stat" style="border-left:4px solid #64748b"><div class="label">Vencidos</div><div class="value">{{ vencidos().length }}</div></div>
    </div>

    <div class="card">
      <div class="flex between mb"><h3>⏰ Lotes en alerta</h3><button class="btn btn-outline btn-sm">⬇ Exportar reporte</button></div>
      <div class="alertas">
        @for (l of alertaRoja(); track l.codigoLote) {
          <div class="al" [class.venc]="dias(l) < 0">
            <div class="al-ic">{{ dias(l) < 0 ? '⛔' : '⚠️' }}</div>
            <div class="al-body">
              <b>{{ l.producto }}</b>
              <div class="muted small">Lote {{ l.numeroLote }} · {{ l.stockDisponible }} und · Vence {{ l.fechaVencimiento }}</div>
            </div>
            <div class="al-dias">
              <span class="badge" [class.badge-red]="dias(l) < 30" [class.badge-amber]="dias(l) >= 30">{{ dias(l) < 0 ? 'VENCIDO' : dias(l) + ' días' }}</span>
            </div>
            <button class="btn btn-danger btn-sm" (click)="cuarentena(l)">🚫 Enviar a cuarentena</button>
          </div>
        }
        @if (alertaRoja().length === 0) { <div class="center muted" style="padding:2rem">✓ No hay lotes en alerta. Todo el stock está vigente.</div> }
      </div>
      @if (msg) { <div class="notice notice-amber mt">{{ msg }}</div> }
    </div>
  </div>
  `,
  styles: [`
    .alertas { display:flex; flex-direction:column; gap:.6rem; }
    .al { display:grid; grid-template-columns:auto 1fr auto auto; align-items:center; gap:1rem; border:1px solid #fecaca; background:#fef2f2; border-radius:10px; padding:.85rem 1rem; }
    .al.venc { background:#f1f5f9; border-color:#cbd5e1; }
    .al-ic { font-size:1.5rem; }
    .al-dias { min-width:90px; text-align:right; }
    @media (max-width:680px){ .al{ grid-template-columns:auto 1fr; } }
  `],
})
export class Fefo {
  data = inject(DataService);
  msg = '';
  dias(l: Lote) { return this.data.diasParaVencer(l.fechaVencimiento); }
  alertaRoja() { return this.data.getLotes().filter(l => l.estado !== 'Cuarentena' && this.dias(l) < 90).sort((a, b) => this.dias(a) - this.dias(b)); }
  vencidos() { return this.data.getLotes().filter(l => this.dias(l) < 0); }
  stockComprometido() { return this.alertaRoja().reduce((s, l) => s + l.stockDisponible, 0); }
  cuarentena(l: Lote) { l.estado = 'Cuarentena'; this.msg = `Lote ${l.numeroLote} enviado a cuarentena. Stock retirado de la venta y notificado al Químico Farmacéutico.`; }
}
