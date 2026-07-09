import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Consulta de inventario</h1><div class="sub">Stock actual por producto · Sede Huacho</div></div>

    <div class="stats mb">
      <div class="stat"><div class="label">Productos</div><div class="value">{{ data.getProductos().length }}</div></div>
      <div class="stat"><div class="label">Stock total (und)</div><div class="value">{{ stockTotal() }}</div></div>
      <div class="stat"><div class="label">Bajo mínimo</div><div class="value" style="color:#d97706">{{ bajos() }}</div></div>
      <div class="stat"><div class="label">Agotados</div><div class="value" style="color:#dc2626">{{ agotados() }}</div></div>
    </div>

    <div class="card card-pad-0">
      <div class="flex between" style="padding:1rem 1.25rem">
        <div class="flex">
          <input class="inp" style="width:260px" [(ngModel)]="q" placeholder="Buscar producto…" />
          <select class="inp" [(ngModel)]="cat" style="width:200px"><option value="">Todas las categorías</option>@for(c of data.getCategorias(); track c.codigoCategoria){<option [value]="c.nombre">{{c.nombre}}</option>}</select>
        </div>
        <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Exportar Excel</button>
      </div>
      <div class="table-wrap" style="border:none">
        <table class="tbl">
          <thead><tr><th>Producto</th><th>Categoría</th><th>Laboratorio</th><th class="num">Stock actual</th><th class="num">Stock mín.</th><th>Estado</th></tr></thead>
          <tbody>
            @for (p of filtrados(); track p.codigoProducto) {
              <tr>
                <td><b><i class="fa-solid {{ p.icono }}"></i> {{ p.nombreProducto }}</b><div class="muted small">{{ p.presentacion }}</div></td>
                <td>{{ p.categoria }}</td>
                <td>{{ p.laboratorio }}</td>
                <td class="num"><b>{{ p.stockDisponible }}</b></td>
                <td class="num muted">{{ p.stockMinimo }}</td>
                <td>
                  @if (p.stockDisponible === 0) { <span class="badge badge-red">Agotado</span> }
                  @else if (p.stockDisponible <= (p.stockMinimo || 0)) { <span class="badge badge-amber">Bajo mínimo</span> }
                  @else { <span class="badge badge-green">Óptimo</span> }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `,
})
export class Inventario {
  data = inject(DataService);
  q = '';
  cat = '';
  filtrados() {
    const q = this.q.toLowerCase();
    return this.data.getProductos().filter(p => (!q || p.nombreProducto.toLowerCase().includes(q)) && (!this.cat || p.categoria === this.cat));
  }
  stockTotal() { return this.data.getProductos().reduce((s, p) => s + p.stockDisponible, 0); }
  bajos() { return this.data.getProductos().filter(p => p.stockDisponible > 0 && p.stockDisponible <= (p.stockMinimo || 0)).length; }
  agotados() { return this.data.getProductos().filter(p => p.stockDisponible === 0).length; }
}
