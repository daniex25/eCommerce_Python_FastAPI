import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-asignacion',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Pedidos por despachar — Asignación de ruta</h1><div class="sub">Pedidos pagados y preparados, listos para reparto</div></div>

    <div class="asig-grid">
      <div class="card card-pad-0">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Pedidos listos ({{ porDespachar().length }})</b></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Dirección</th><th>Distrito</th><th class="num">Monto</th><th>Repartidor</th></tr></thead>
            <tbody>
              @for (p of porDespachar(); track p.numeroPedido) {
                <tr>
                  <td><b>#{{ p.numeroPedido }}</b><div><span class="badge badge-green">{{ p.estadoPedido }}</span></div></td>
                  <td>{{ p.cliente }}</td>
                  <td>{{ p.direccionEntrega }}</td>
                  <td>{{ p.distrito }}</td>
                  <td class="num money">S/ {{ p.montoTotal.toFixed(2) }}</td>
                  <td>
                    <select class="inp" [(ngModel)]="asignados[p.numeroPedido]" (ngModelChange)="0" name="r{{p.numeroPedido}}">
                      <option [ngValue]="undefined">— Asignar —</option>
                      @for (r of disponibles(); track r.codigoRepartidor) { <option [ngValue]="r.codigoRepartidor">{{ r.nombre }}</option> }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex between" style="padding:1rem 1.25rem; border-top:1px solid #f1f5f9">
          <span class="muted small">{{ totalAsignados() }} de {{ porDespachar().length }} pedidos asignados</span>
          <button class="btn btn-primary" (click)="notificar()">🔔 Asignar y notificar repartidores</button>
        </div>
        @if (msg) { <div class="notice notice-green" style="margin:0 1.25rem 1.25rem">{{ msg }}</div> }
      </div>

      <aside class="card">
        <h3>Repartidores</h3>
        @for (r of data.repartidores; track r.codigoRepartidor) {
          <div class="rep">
            <div class="ava">{{ iniciales(r.nombre) }}</div>
            <div style="flex:1"><b>{{ r.nombre }}</b><div class="muted small">{{ r.vehiculo }}</div></div>
            @if (r.estado) { <span class="badge badge-green">Disponible</span> } @else { <span class="badge badge-gray">Ocupado</span> }
          </div>
        }
        <div class="notice notice-blue mt small">Solo los repartidores <b>disponibles</b> aparecen para asignación.</div>
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .asig-grid { display:grid; grid-template-columns:1fr 280px; gap:1.25rem; align-items:start; }
    select.inp { min-width:150px; }
    .rep { display:flex; gap:.6rem; align-items:center; padding:.6rem 0; border-bottom:1px solid #f1f5f9; }
    .ava { width:38px; height:38px; border-radius:50%; background:#0d9488; color:#fff; display:grid; place-items:center; font-weight:700; font-size:.78rem; }
    @media (max-width:880px){ .asig-grid{ grid-template-columns:1fr; } }
  `],
})
export class Asignacion {
  data = inject(DataService);
  asignados: Record<number, number | undefined> = { 1042: 1 };
  msg = '';
  porDespachar() { return this.data.pedidos.filter(p => p.estadoPedido === 'Pagado' || p.estadoPedido === 'Preparado'); }
  disponibles() { return this.data.repartidores.filter(r => r.estado); }
  totalAsignados() { return Object.values(this.asignados).filter(v => v !== undefined).length; }
  iniciales(n: string) { return n.split(' ').slice(0, 2).map(x => x[0]).join(''); }
  notificar() { this.msg = `${this.totalAsignados()} pedido(s) asignado(s). Se notificó a los repartidores vía la app móvil.`; }
}
