import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-lotes',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Registro de lotes y vencimientos</h1><div class="sub">Trazabilidad por lote según norma FEFO (primero en vencer, primero en salir)</div></div>

    <div class="table-wrap card-pad-0">
      <table class="tbl">
        <thead><tr><th>N° de Lote</th><th>Producto</th><th class="num">Stock del lote</th><th>Fecha vencimiento</th><th class="num">Días restantes</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (l of ordenados(); track l.codigoLote) {
            <tr>
              <td><b>{{ l.numeroLote }}</b></td>
              <td>{{ l.producto }}</td>
              <td class="num">{{ l.stockDisponible }}</td>
              <td>{{ l.fechaVencimiento }}</td>
              <td class="num" [style.color]="dias(l) < 0 ? '#dc2626' : dias(l) < 90 ? '#d97706' : '#16a34a'"><b>{{ dias(l) < 0 ? 'Vencido' : dias(l) + ' días' }}</b></td>
              <td>
                @switch (l.estado) {
                  @case ('Vigente') { <span class="badge badge-green">Vigente</span> }
                  @case ('Por Vencer') { <span class="badge badge-amber">Por vencer</span> }
                  @case ('Vencido') { <span class="badge badge-red">Vencido</span> }
                  @case ('Cuarentena') { <span class="badge badge-gray">Cuarentena</span> }
                }
              </td>
              <td><button class="btn btn-ghost btn-sm">Ver movimientos</button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="muted small mt">Ordenado por fecha de vencimiento ascendente (FEFO). Los lotes próximos a vencer aparecen primero.</div>
  </div>
  `,
})
export class Lotes {
  data = inject(DataService);
  dias(l: any) { return this.data.diasParaVencer(l.fechaVencimiento); }
  ordenados() { return [...this.data.lotes].sort((a, b) => +new Date(a.fechaVencimiento) - +new Date(b.fechaVencimiento)); }
}
