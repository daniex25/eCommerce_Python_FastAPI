import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, IGV_RATE } from '../../core/data.service';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="page">
    <div class="page-header"><h1>Carrito de compras</h1><div class="sub">{{ data.cantidadCarrito() }} producto(s) en tu carrito</div></div>

    @if (data.getCarrito().length > 0) {
    <div class="car-grid">
      <div class="card card-pad-0">
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>Producto</th><th class="num">Precio</th><th class="center">Cantidad</th><th class="num">Subtotal</th><th></th></tr></thead>
            <tbody>
              @for (i of data.getCarrito(); track i.producto.codigoProducto) {
                <tr>
                  <td>
                    <div class="ci"><span class="ci-img">{{ i.producto.imagen }}</span>
                      <div><b>{{ i.producto.nombreProducto }}</b><div class="muted small">{{ i.producto.laboratorio }} · {{ i.producto.presentacion }}</div></div>
                    </div>
                  </td>
                  <td class="num">S/ {{ i.producto.precioVenta.toFixed(2) }}</td>
                  <td class="center">
                    <div class="qty">
                      <button (click)="data.cambiarCantidad(i.producto.codigoProducto, i.cantidad-1)">−</button>
                      <span>{{ i.cantidad }}</span>
                      <button (click)="data.cambiarCantidad(i.producto.codigoProducto, i.cantidad+1)">＋</button>
                    </div>
                  </td>
                  <td class="num money">S/ {{ (i.producto.precioVenta * i.cantidad).toFixed(2) }}</td>
                  <td class="center"><button class="x" (click)="data.quitarDelCarrito(i.producto.codigoProducto)">🗑️</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="car-foot"><a routerLink="/tienda/catalogo" class="btn btn-ghost">‹ Seguir comprando</a></div>
      </div>

      <aside class="card resumen">
        <h3>Resumen</h3>
        <div class="r-line"><span>Subtotal (sin IGV)</span><b>S/ {{ baseImponible().toFixed(2) }}</b></div>
        <div class="r-line"><span>IGV (18%)</span><b>S/ {{ igv().toFixed(2) }}</b></div>
        <div class="r-line"><span>Envío</span><b>S/ {{ envio.toFixed(2) }}</b></div>
        <div class="r-total"><span>Total</span><span class="price">S/ {{ total().toFixed(2) }}</span></div>
        <a routerLink="/tienda/checkout" class="btn btn-primary btn-block btn-lg mt">Ir a pagar →</a>
        <div class="r-pay muted small">Aceptamos Yape · Plin · PagoEfectivo · Tarjeta</div>
      </aside>
    </div>
    } @else {
      <div class="card center" style="padding:3rem">
        <div style="font-size:3rem">🛒</div>
        <h3>Tu carrito está vacío</h3>
        <p class="muted">Agrega productos desde el catálogo.</p>
        <a routerLink="/tienda/catalogo" class="btn btn-primary mt">Ver catálogo</a>
      </div>
    }
  </div>
  `,
  styles: [`
    .car-grid { display:grid; grid-template-columns:1fr 320px; gap:1.25rem; align-items:start; }
    .ci { display:flex; align-items:center; gap:.75rem; }
    .ci-img { font-size:1.8rem; background:#f8fafc; border-radius:8px; padding:.35rem .55rem; }
    .qty { display:inline-flex; align-items:center; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; }
    .qty button { border:none; background:#f1f5f9; width:30px; height:32px; cursor:pointer; font-size:1rem; }
    .qty span { width:38px; text-align:center; font-weight:600; }
    .x { border:none; background:transparent; cursor:pointer; font-size:1.1rem; }
    .car-foot { padding:1rem 1.25rem; border-top:1px solid #f1f5f9; }
    .resumen { position:sticky; top:80px; }
    .resumen h3 { margin-bottom:1rem; }
    .r-line { display:flex; justify-content:space-between; padding:.45rem 0; font-size:.9rem; color:#475569; }
    .r-total { display:flex; justify-content:space-between; align-items:center; padding-top:.85rem; margin-top:.5rem; border-top:2px solid #f1f5f9; font-weight:800; }
    .r-pay { text-align:center; margin-top:.75rem; }
    @media (max-width:760px){ .car-grid{ grid-template-columns:1fr; } }
  `],
})
export class Carrito {
  data = inject(DataService);
  envio = 8.00;
  baseImponible() { return this.data.subtotalCarrito() / (1 + IGV_RATE); }
  igv() { return this.data.subtotalCarrito() - this.baseImponible(); }
  total() { return this.data.subtotalCarrito() + this.envio; }
}
