import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-caja',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Arqueo de caja — Cierre de turno</h1><div class="sub">Caja 01 · Turno mañana (08:00 – 14:00) · 18/06/2026</div></div>

    <div class="caja-grid">
      <div class="flex-col" style="gap:1.25rem">
        <div class="card">
          <h3>Resumen del turno</h3>
          <div class="res">
            <div class="r"><span>Fondo inicial</span><b>S/ {{ fondoInicial.toFixed(2) }}</b></div>
            <div class="r"><span>Ventas en efectivo</span><b>S/ {{ efectivo().toFixed(2) }}</b></div>
            <div class="r"><span>Ventas con Yape / Plin</span><b>S/ {{ digital().toFixed(2) }}</b></div>
            <div class="r"><span>Ventas con tarjeta</span><b>S/ {{ tarjeta().toFixed(2) }}</b></div>
            <div class="r egreso"><span>Egresos de caja chica</span><b>− S/ {{ egresos().toFixed(2) }}</b></div>
            <div class="r tot"><span>Efectivo esperado en caja</span><b>S/ {{ esperado().toFixed(2) }}</b></div>
          </div>
        </div>

        <div class="card">
          <h3>Conciliación de medios digitales</h3>
          <table class="tbl"><thead><tr><th>Medio</th><th class="num">Sistema</th><th class="num">Reportado</th><th>Estado</th></tr></thead>
            <tbody>
              <tr><td>Yape</td><td class="num">S/ 64.40</td><td class="num">S/ 64.40</td><td><span class="badge badge-green">✓ Cuadra</span></td></tr>
              <tr><td>Plin</td><td class="num">S/ 47.80</td><td class="num">S/ 47.80</td><td><span class="badge badge-green">✓ Cuadra</span></td></tr>
              <tr><td>Tarjeta (POS)</td><td class="num">S/ 129.00</td><td class="num">S/ 129.00</td><td><span class="badge badge-green">✓ Cuadra</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="card cuadre">
        <h3>Cuadre de efectivo físico</h3>
        <div class="field"><label>Efectivo contado en caja (S/)</label><input class="inp" type="number" [(ngModel)]="contado" /></div>

        <div class="cuadre-res" [class.ok]="diferencia()===0" [class.warn]="diferencia()!==0">
          <div class="flex between"><span>Esperado</span><b>S/ {{ esperado().toFixed(2) }}</b></div>
          <div class="flex between"><span>Contado</span><b>S/ {{ (+contado).toFixed(2) }}</b></div>
          <div class="flex between dif"><span>Diferencia</span><b>{{ diferencia()>=0?'+':'' }}S/ {{ diferencia().toFixed(2) }}</b></div>
        </div>

        @if (diferencia()===0) { <div class="notice notice-green mt small">✓ Caja cuadrada. Sin faltantes ni sobrantes.</div> }
        @else if (diferencia()<0) { <div class="notice notice-red mt small">⚠️ Faltante de S/ {{ (-diferencia()).toFixed(2) }}. Requiere justificación.</div> }
        @else { <div class="notice notice-amber mt small">Sobrante de S/ {{ diferencia().toFixed(2) }}.</div> }

        <button class="btn btn-primary btn-block mt" (click)="cerrar()">🔒 Cerrar turno y generar arqueo</button>
        @if (cerrado) { <div class="notice notice-blue mt small">Turno cerrado por Téc. J. Pérez. Reporte enviado a Administración.</div> }
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .caja-grid { display:grid; grid-template-columns:1fr 320px; gap:1.25rem; align-items:start; }
    .res .r { display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid #f1f5f9; font-size:.92rem; }
    .res .egreso b { color:#dc2626; }
    .res .tot { border-bottom:none; border-top:2px solid #e2e8f0; margin-top:.3rem; padding-top:.7rem; font-weight:800; font-size:1.05rem; }
    .cuadre-res { background:#f8fafc; border-radius:10px; padding:.85rem 1rem; margin-top:.5rem; }
    .cuadre-res .dif { border-top:1px dashed #cbd5e1; margin-top:.4rem; padding-top:.5rem; font-weight:800; }
    .cuadre-res.ok .dif b { color:#16a34a; } .cuadre-res.warn .dif b { color:#dc2626; }
    @media (max-width:880px){ .caja-grid{ grid-template-columns:1fr; } }
  `],
})
export class Caja {
  data = inject(DataService);
  fondoInicial = 100.00;
  contado = 158.30;
  efectivo() { return this.data.movimientosCaja.filter(m => m.tipo === 'Ingreso' && m.metodo === 'Efectivo').reduce((s, m) => s + m.monto, 0); }
  digital() { return this.data.movimientosCaja.filter(m => m.tipo === 'Ingreso' && (m.metodo === 'Yape' || m.metodo === 'Plin')).reduce((s, m) => s + m.monto, 0); }
  tarjeta() { return this.data.movimientosCaja.filter(m => m.tipo === 'Ingreso' && m.metodo === 'Tarjeta').reduce((s, m) => s + m.monto, 0); }
  egresos() { return this.data.movimientosCaja.filter(m => m.tipo === 'Egreso').reduce((s, m) => s + m.monto, 0); }
  esperado() { return this.fondoInicial + this.efectivo() - this.egresos(); }
  diferencia() { return +(+this.contado - this.esperado()).toFixed(2); }
  cerrado = false;
  cerrar() { this.cerrado = true; }
}
