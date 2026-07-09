import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { EstadoPedido } from '../../core/models';

@Component({
  selector: 'app-mis-compras',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="page">
    <div class="page-header"><h1>Mi historial de compras</h1><div class="sub">Cliente: María Elena Quispe Huamán · DNI 45872136</div></div>

    <div class="stats mb">
      <div class="stat"><div class="label">Pedidos totales</div><div class="value">12</div></div>
      <div class="stat"><div class="label">Gastado este año</div><div class="value">S/ 842</div></div>
      <div class="stat"><div class="label">Cupones activos</div><div class="value">1</div></div>
      <div class="stat"><div class="label">Puntos Botica</div><div class="value">340</div></div>
    </div>

    <div class="flex-col" style="gap:1rem">
      @for (p of pedidosCliente(); track p.numeroPedido) {
        <div class="card pedido">
          <div class="ped-head">
            <div>
              <b>Pedido #{{ p.numeroPedido }}</b>
              <span class="muted small"> · {{ p.fechaPedido }} · {{ p.metodoPago }}</span>
            </div>
            <span class="badge" [class.badge-green]="p.estadoPedido==='Entregado'" [class.badge-blue]="p.estadoPedido==='En Ruta'" [class.badge-amber]="p.estadoPedido==='Pagado'||p.estadoPedido==='Preparado'">{{ p.estadoPedido }}</span>
          </div>
          <div class="ped-items">
            @for (d of p.detalle; track d.codigoProducto) {
              <span class="chip">{{ d.cantidad }}× {{ d.nombreProducto }}</span>
            }
          </div>
          <div class="ped-foot">
            <span class="price" style="font-size:1.05rem">S/ {{ p.montoTotal.toFixed(2) }}</span>
            <div class="flex">
              <button class="btn btn-outline btn-sm">🧾 Ver comprobante</button>
              @if (p.estadoPedido==='En Ruta') { <a routerLink="/tienda/seguimiento" class="btn btn-blue btn-sm">Seguir pedido</a> }
              @else { <button class="btn btn-primary btn-sm">Volver a comprar</button> }
            </div>
          </div>
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
    .ped-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
    .ped-items { display:flex; flex-wrap:wrap; gap:.4rem; margin-bottom:.85rem; }
    .chip { background:#f1f5f9; border-radius:999px; padding:.25rem .7rem; font-size:.78rem; color:#475569; }
    .ped-foot { display:flex; justify-content:space-between; align-items:center; padding-top:.85rem; border-top:1px solid #f1f5f9; }
  `],
})
export class MisCompras {
  data = inject(DataService);
  estadoColor: Record<EstadoPedido, string> = {} as any;
  pedidosCliente() { return this.data.getPedidos().filter(p => p.codigoCliente === 1); }
}
