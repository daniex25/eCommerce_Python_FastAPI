import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financiero',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="flex between mb">
      <div class="page-header" style="margin:0"><h1>Reporte financiero</h1><div class="sub">Estado de resultados · Junio 2026 (al 18/06)</div></div>
      <button class="btn btn-outline btn-sm">⬇ Exportar PDF</button>
    </div>

    <div class="stats mb">
      <div class="stat"><div class="label">Ingresos</div><div class="value" style="color:#16a34a">S/ 118,420</div></div>
      <div class="stat"><div class="label">Costo de ventas</div><div class="value">S/ 71,050</div></div>
      <div class="stat"><div class="label">Utilidad bruta</div><div class="value" style="color:#0369a1">S/ 47,370</div></div>
      <div class="stat"><div class="label">Margen</div><div class="value">40.0%</div></div>
    </div>

    <div class="fin-grid">
      <div class="card">
        <h3>Estado de resultados</h3>
        <table class="tbl">
          <tbody>
            <tr><td>Ventas netas</td><td class="num money">S/ 118,420.00</td></tr>
            <tr><td>(−) Costo de ventas</td><td class="num">S/ 71,050.00</td></tr>
            <tr class="sub"><td><b>Utilidad bruta</b></td><td class="num"><b>S/ 47,370.00</b></td></tr>
            <tr><td>(−) Gastos de personal</td><td class="num">S/ 18,200.00</td></tr>
            <tr><td>(−) Alquiler y servicios</td><td class="num">S/ 6,400.00</td></tr>
            <tr><td>(−) Distribución / delivery</td><td class="num">S/ 3,150.00</td></tr>
            <tr><td>(−) Otros gastos operativos</td><td class="num">S/ 2,480.00</td></tr>
            <tr class="sub"><td><b>Utilidad operativa</b></td><td class="num"><b>S/ 17,140.00</b></td></tr>
            <tr><td>(−) IGV por pagar</td><td class="num">S/ 5,140.00</td></tr>
            <tr class="tot"><td><b>Utilidad neta</b></td><td class="num"><b style="color:#16a34a">S/ 12,000.00</b></td></tr>
          </tbody>
        </table>
      </div>

      <div class="flex-col" style="gap:1.25rem">
        <div class="card">
          <h3>Obligaciones tributarias</h3>
          <div class="ob"><span>IGV (18%) por pagar</span><b>S/ 5,140.00</b></div>
          <div class="ob"><span>Renta (mensual)</span><b>S/ 1,776.00</b></div>
          <div class="ob"><span>Próximo vencimiento SUNAT</span><b class="badge badge-amber">12/07/2026</b></div>
        </div>
        <div class="card">
          <h3>Flujo de caja</h3>
          <div class="ob"><span>Saldo inicial</span><b>S/ 24,500</b></div>
          <div class="ob"><span>Cobranzas</span><b style="color:#16a34a">+ S/ 118,420</b></div>
          <div class="ob"><span>Pagos</span><b style="color:#dc2626">− S/ 101,280</b></div>
          <div class="ob tot"><span>Saldo final</span><b>S/ 41,640</b></div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .fin-grid { display:grid; grid-template-columns:1.2fr 1fr; gap:1.25rem; align-items:start; }
    table.tbl tr.sub td { background:#f8fafc; border-top:1px solid #e2e8f0; }
    table.tbl tr.tot td { background:#f0fdf4; border-top:2px solid #16a34a; font-size:1.05rem; }
    .ob { display:flex; justify-content:space-between; align-items:center; padding:.55rem 0; border-bottom:1px solid #f1f5f9; font-size:.9rem; }
    .ob.tot { border-bottom:none; border-top:2px solid #e2e8f0; margin-top:.3rem; padding-top:.7rem; font-weight:800; }
    @media (max-width:880px){ .fin-grid{ grid-template-columns:1fr; } }
  `],
})
export class Financiero {}
