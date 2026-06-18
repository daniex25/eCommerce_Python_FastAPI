import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-fidelizacion',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Fidelización — Emisión de cupones</h1><div class="sub">Compensación por reclamo válido y retención de clientes</div></div>

    <div class="fid-grid">
      <div class="card emisor">
        <h3>Emitir cupón de descuento</h3>
        <div class="field"><label>Cliente</label><select class="inp" [(ngModel)]="cliente"><option>Rosa Isabel Flores</option><option>Luis Alberto Vargas</option><option>María Elena Quispe</option></select></div>
        <div class="field"><label>Motivo</label><select class="inp"><option>Reclamo válido — empaque dañado</option><option>Demora en entrega</option><option>Cliente frecuente</option></select></div>
        <div class="field"><label>Porcentaje de descuento</label>
          <div class="desc-opts">
            @for (d of [10,15,20,25]; track d) { <button class="do" [class.on]="descuento===d" (click)="descuento=d">{{ d }}%</button> }
          </div>
        </div>
        <div class="field"><label>Vigencia</label><input class="inp" type="date" value="2026-07-18" /></div>
        <button class="btn btn-primary btn-block" (click)="emitir()">🎁 Generar cupón</button>

        @if (emitido) {
          <div class="cupon mt">
            <div class="c-left"><div class="c-pct">{{ descuento }}%</div><div class="c-off">DCTO</div></div>
            <div class="c-right">
              <b>Botica Central</b>
              <div class="c-code">DISC-{{ descuento }}-{{ codigo }}</div>
              <div class="muted small">{{ cliente }} · Vence 18/07/2026</div>
            </div>
          </div>
          <div class="notice notice-green mt small">✓ Cupón emitido y enviado al correo y app del cliente.</div>
        }
      </div>

      <div class="card card-pad-0">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Cupones emitidos</b></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>Código</th><th>Cliente</th><th class="num">Dcto</th><th>Vence</th><th>Estado</th></tr></thead>
            <tbody>
              @for (c of data.cupones; track c.codigo) {
                <tr>
                  <td><b>{{ c.codigo }}</b><div class="muted small">{{ c.motivo }}</div></td>
                  <td>{{ c.cliente }}</td>
                  <td class="num"><b>{{ c.descuento }}%</b></td>
                  <td>{{ c.vencimiento }}</td>
                  <td>
                    @if (c.estado==='Activo') { <span class="badge badge-green">Activo</span> }
                    @else if (c.estado==='Usado') { <span class="badge badge-gray">Usado</span> }
                    @else { <span class="badge badge-red">Vencido</span> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .fid-grid { display:grid; grid-template-columns:340px 1fr; gap:1.25rem; align-items:start; }
    .desc-opts { display:grid; grid-template-columns:repeat(4,1fr); gap:.4rem; }
    .do { border:1px solid #cbd5e1; background:#fff; padding:.55rem 0; border-radius:8px; font-weight:700; cursor:pointer; }
    .do.on { background:#16a34a; color:#fff; border-color:#16a34a; }
    .cupon { display:flex; border:2px dashed #16a34a; border-radius:12px; overflow:hidden; background:#f0fdf4; }
    .c-left { background:#16a34a; color:#fff; padding:1rem 1.25rem; text-align:center; display:flex; flex-direction:column; justify-content:center; }
    .c-pct { font-size:1.8rem; font-weight:800; line-height:1; }
    .c-off { font-size:.7rem; letter-spacing:.1em; }
    .c-right { padding:.85rem 1rem; }
    .c-code { font-family:monospace; font-weight:700; color:#15803d; margin:.2rem 0; }
    @media (max-width:880px){ .fid-grid{ grid-template-columns:1fr; } }
  `],
})
export class Fidelizacion {
  data = inject(DataService);
  cliente = 'Rosa Isabel Flores';
  descuento = 20;
  emitido = false;
  codigo = Math.floor(1000 + Math.random() * 9000);
  emitir() { this.emitido = true; this.codigo = Math.floor(1000 + Math.random() * 9000); }
}
