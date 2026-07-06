import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="flex between mb">
      <div class="page-header" style="margin:0"><h1>Reportes gerenciales</h1><div class="sub">Ventas omnicanal (tienda física + web) · Semana del 12 al 18 de junio 2026</div></div>
      <div class="flex"><button class="btn btn-outline btn-sm">⬇ PDF</button><button class="btn btn-outline btn-sm">⬇ Excel</button></div>
    </div>

    <div class="stats mb">
      <div class="stat"><div class="flex between"><div class="label">Ventas totales</div><span class="ic">💰</span></div><div class="value">S/ 28,950</div><div class="delta up">▲ 12.4% vs semana ant.</div></div>
      <div class="stat"><div class="flex between"><div class="label">Tickets emitidos</div><span class="ic">🧾</span></div><div class="value">1,284</div><div class="delta up">▲ 6.1%</div></div>
      <div class="stat"><div class="flex between"><div class="label">Ticket promedio</div><span class="ic">📊</span></div><div class="value">S/ 22.55</div><div class="delta up">▲ 3.0%</div></div>
      <div class="stat"><div class="flex between"><div class="label">Ventas web</div><span class="ic">🌐</span></div><div class="value">37%</div><div class="delta down">▼ 1.2%</div></div>
    </div>

    <div class="rep-grid">
      <div class="card">
        <h3>Ventas por día — Web vs. Física</h3>
        <div class="chart">
          @for (d of data.ventasSemana; track d.dia) {
            <div class="col">
              <div class="bars">
                <div class="bar web" [style.height.%]="pct(d.web)" [title]="'Web: S/ '+d.web"></div>
                <div class="bar fis" [style.height.%]="pct(d.fisica)" [title]="'Física: S/ '+d.fisica"></div>
              </div>
              <div class="dia">{{ d.dia }}</div>
            </div>
          }
        </div>
        <div class="leg"><span><i class="sw fis"></i> Tienda física</span><span><i class="sw web"></i> Tienda web</span></div>
      </div>

      <div class="card">
        <h3>Productos más vendidos</h3>
        @for (p of data.topVendidos; track p.nombre) {
          <div class="top">
            <div class="flex between"><b class="t-name">{{ p.nombre }}</b><span class="muted small">{{ p.unidades }} und · S/ {{ p.ingresos.toFixed(0) }}</span></div>
            <div class="t-bar"><div [style.width.%]="topPct(p.unidades)"></div></div>
          </div>
        }
      </div>
    </div>

    <div class="rep-grid mt">
      <div class="card">
        <h3>Ventas por categoría</h3>
        <table class="tbl">
          <thead><tr><th>Categoría</th><th class="num">Unidades</th><th class="num">Ingresos</th><th class="num">%</th></tr></thead>
          <tbody>
            <tr><td>Medicamentos</td><td class="num">3,210</td><td class="num">S/ 12,840</td><td class="num">44%</td></tr>
            <tr><td>Bioseguridad e Higiene</td><td class="num">1,180</td><td class="num">S/ 5,210</td><td class="num">18%</td></tr>
            <tr><td>Vitaminas y Suplementos</td><td class="num">640</td><td class="num">S/ 4,620</td><td class="num">16%</td></tr>
            <tr><td>Dermocosmética</td><td class="num">320</td><td class="num">S/ 3,480</td><td class="num">12%</td></tr>
            <tr><td>Dispositivos Médicos</td><td class="num">96</td><td class="num">S/ 1,890</td><td class="num">7%</td></tr>
            <tr><td>Infantil</td><td class="num">210</td><td class="num">S/ 910</td><td class="num">3%</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3>Medios de pago</h3>
        <div class="pays">
          <div class="pay"><div class="flex between"><span>Efectivo</span><b>34%</b></div><div class="t-bar"><div style="width:34%; background:#16a34a"></div></div></div>
          <div class="pay"><div class="flex between"><span>Yape</span><b>28%</b></div><div class="t-bar"><div style="width:28%; background:#6d28d9"></div></div></div>
          <div class="pay"><div class="flex between"><span>Tarjeta</span><b>22%</b></div><div class="t-bar"><div style="width:22%; background:#0f172a"></div></div></div>
          <div class="pay"><div class="flex between"><span>Plin</span><b>11%</b></div><div class="t-bar"><div style="width:11%; background:#0891b2"></div></div></div>
          <div class="pay"><div class="flex between"><span>PagoEfectivo</span><b>5%</b></div><div class="t-bar"><div style="width:5%; background:#dc2626"></div></div></div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .rep-grid { display:grid; grid-template-columns:1.3fr 1fr; gap:1.25rem; align-items:start; }
    .card h3 { margin-bottom:1.1rem; }
    .chart { display:flex; align-items:flex-end; gap:.85rem; height:200px; padding-top:.5rem; }
    .col { flex:1; display:flex; flex-direction:column; align-items:center; height:100%; }
    .bars { flex:1; display:flex; align-items:flex-end; gap:3px; width:100%; justify-content:center; }
    .bar { width:14px; border-radius:4px 4px 0 0; transition:.3s; }
    .bar.fis { background:#0284c7; } .bar.web { background:#16a34a; }
    .dia { font-size:.75rem; color:#64748b; margin-top:.4rem; }
    .leg { display:flex; gap:1.5rem; justify-content:center; margin-top:.75rem; font-size:.8rem; color:#475569; }
    .sw { display:inline-block; width:11px; height:11px; border-radius:3px; margin-right:.3rem; }
    .sw.fis { background:#0284c7; } .sw.web { background:#16a34a; }
    .top { margin-bottom:.85rem; }
    .t-name { font-size:.88rem; }
    .t-bar { height:8px; background:#f1f5f9; border-radius:6px; overflow:hidden; margin-top:.3rem; }
    .t-bar div { height:100%; background:#16a34a; border-radius:6px; }
    .pays { display:flex; flex-direction:column; gap:.85rem; }
    @media (max-width:880px){ .rep-grid{ grid-template-columns:1fr; } }
  `],
})
export class Reportes {
  data = inject(DataService);
  maxV = Math.max(...this.data.ventasSemana.flatMap(d => [d.web, d.fisica]));
  maxT = Math.max(...this.data.getTopVendidos().map(p => p.unidades));
  pct(v: number) { return (v / this.maxV) * 100; }
  topPct(v: number) { return (v / this.maxT) * 100; }
}
