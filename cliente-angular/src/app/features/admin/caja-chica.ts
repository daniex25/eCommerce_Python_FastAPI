import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-caja-chica',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Vale de caja chica</h1><div class="sub">Registro de egresos menores · Fondo fijo S/ 300.00</div></div>

    <div class="cc-grid">
      <div class="card vale">
        <div class="v-head">
          <div><b>VALE DE CAJA CHICA</b><div class="muted small">Botica Central — Sede Huacho</div></div>
          <div class="v-num">N° {{ numero }}</div>
        </div>
        <div class="field"><label>Fecha</label><input class="inp" type="date" value="2026-06-18" /></div>
        <div class="field"><label>Concepto del gasto</label><input class="inp" [(ngModel)]="concepto" placeholder="Ej. Compra de útiles de limpieza" /></div>
        <div class="flex">
          <div class="field" style="flex:1"><label>Monto (S/)</label><input class="inp" type="number" [(ngModel)]="monto" /></div>
          <div class="field" style="flex:1"><label>Categoría</label><select class="inp"><option>Limpieza</option><option>Movilidad</option><option>Oficina</option><option>Mantenimiento</option><option>Otros</option></select></div>
        </div>
        <div class="field"><label>Responsable / recibe</label><input class="inp" [(ngModel)]="responsable" /></div>
        <div class="field"><label>Autorizado por</label><input class="inp" value="Administrador — C. Mendoza" readonly /></div>
        <div class="flex">
          <button class="btn btn-primary" (click)="registrar()">✓ Registrar vale</button>
          <button class="btn btn-outline">🖨️ Imprimir vale</button>
        </div>
        @if (ok) { <div class="notice notice-green mt small">✓ Vale {{ numero }} registrado. Saldo de caja chica actualizado.</div> }
      </div>

      <div class="card card-pad-0">
        <div class="flex between" style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Egresos del mes</b><span class="badge badge-blue">Saldo: S/ {{ saldo().toFixed(2) }}</span></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>Hora</th><th>Concepto</th><th class="num">Monto</th></tr></thead>
            <tbody>
              @for (m of egresos(); track $index) {
                <tr><td>{{ m.hora }}</td><td>{{ m.concepto }}</td><td class="num money" style="color:#dc2626">− S/ {{ m.monto.toFixed(2) }}</td></tr>
              }
              <tr><td>09:30</td><td>Recarga de agua</td><td class="num money" style="color:#dc2626">− S/ 15.00</td></tr>
              <tr><td>08:50</td><td>Útiles de oficina</td><td class="num money" style="color:#dc2626">− S/ 24.50</td></tr>
            </tbody>
          </table>
        </div>
        <div class="flex between" style="padding:1rem 1.25rem; border-top:2px solid #f1f5f9; font-weight:800">
          <span>Total egresos</span><span style="color:#dc2626">S/ {{ totalEgresos().toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .cc-grid { display:grid; grid-template-columns:380px 1fr; gap:1.25rem; align-items:start; }
    .v-head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px dashed #cbd5e1; padding-bottom:.75rem; margin-bottom:1rem; }
    .v-num { font-family:monospace; font-weight:800; color:#0369a1; }
    @media (max-width:880px){ .cc-grid{ grid-template-columns:1fr; } }
  `],
})
export class CajaChica {
  data = inject(DataService);
  numero = '0042';
  concepto = '';
  monto = 0;
  responsable = '';
  ok = false;
  egresos() { return this.data.movimientosCaja.filter(m => m.tipo === 'Egreso'); }
  totalEgresos() { return this.egresos().reduce((s, m) => s + m.monto, 0) + 39.50; }
  saldo() { return 300 - this.totalEgresos(); }
  registrar() { this.ok = true; }
}
