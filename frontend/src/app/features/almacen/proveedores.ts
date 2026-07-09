import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-proveedores',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Proveedores y órdenes de compra</h1><div class="sub">Gestión de abastecimiento</div></div>

    <div class="prov-grid">
      <div class="card card-pad-0">
        <div class="flex between" style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Proveedores</b><button class="btn btn-primary btn-sm">＋ Nuevo</button></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>RUC</th><th>Razón social</th><th>Teléfono</th></tr></thead>
            <tbody>
              @for (p of data.getProveedores(); track p.rucProveedor) {
                <tr><td>{{ p.rucProveedor }}</td><td><b>{{ p.razonSocial }}</b><div class="muted small">{{ p.correoElectronico }}</div></td><td>{{ p.telefono }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card card-pad-0">
        <div class="flex between" style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Órdenes de compra</b><button class="btn btn-primary btn-sm">＋ Generar OC</button></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>N° OC</th><th>Proveedor</th><th>Fecha</th><th class="num">Monto</th><th>Estado</th></tr></thead>
            <tbody>
              @for (o of data.getOrdenes(); track o.numeroOrden) {
                <tr>
                  <td><b>#{{ o.numeroOrden }}</b></td>
                  <td>{{ o.proveedor }}</td>
                  <td>{{ o.fechaEmision }}</td>
                  <td class="num money">S/ {{ o.montoTotal.toFixed(2) }}</td>
                  <td>
                    @if (o.estado==='Pendiente') { <span class="badge badge-amber">Pendiente</span> }
                    @else if (o.estado==='Recibida') { <span class="badge badge-green">Recibida</span> }
                    @else { <span class="badge badge-gray">{{ o.estado }}</span> }
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
    .prov-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; align-items:start; }
    @media (max-width:880px){ .prov-grid{ grid-template-columns:1fr; } }
  `],
})
export class Proveedores {
  data = inject(DataService);
}
