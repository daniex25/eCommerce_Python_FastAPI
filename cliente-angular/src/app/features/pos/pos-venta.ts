import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService, IGV_RATE } from '../../core/data.service';
import { Producto } from '../../core/models';

interface Linea { producto: Producto; cantidad: number; }

@Component({
  selector: 'app-pos-venta',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="pos">
    <div class="pos-left">
      <div class="pos-search">
        <span>🔍</span>
        <input class="inp" [(ngModel)]="q" placeholder="Buscar o escanear producto (nombre o código)…" autofocus />
        <span class="badge badge-blue">⌫ Escáner activo</span>
      </div>
      <div class="pos-prods">
        @for (p of filtrados(); track p.codigoProducto) {
          <button class="pp" [disabled]="p.stockDisponible===0" (click)="add(p)">
            <span class="pp-img">{{ p.imagen }}</span>
            <span class="pp-name">{{ p.nombreProducto }}</span>
            <span class="pp-price">S/ {{ p.precioVenta.toFixed(2) }}</span>
            <span class="pp-stock" [class.out]="p.stockDisponible===0">{{ p.stockDisponible===0 ? 'Agotado' : p.stockDisponible + ' und' }}</span>
          </button>
        }
      </div>
    </div>

    <div class="pos-right">
      <div class="pos-top">
        <div><b>Venta en mostrador</b><div class="muted small">Caja 01 · Téc. Farmacia J. Pérez</div></div>
        <span class="badge badge-green">Turno mañana</span>
      </div>

      <div class="pos-cart">
        @if (lineas.length === 0) { <div class="empty muted">Agrega productos para iniciar la venta</div> }
        @for (l of lineas; track l.producto.codigoProducto) {
          <div class="pl">
            <div class="pl-info"><b>{{ l.producto.nombreProducto }}</b><div class="muted small">S/ {{ l.producto.precioVenta.toFixed(2) }} c/u</div></div>
            <div class="qty">
              <button (click)="dec(l)">−</button><span>{{ l.cantidad }}</span><button (click)="l.cantidad=l.cantidad+1">＋</button>
            </div>
            <div class="pl-sub money">S/ {{ (l.producto.precioVenta*l.cantidad).toFixed(2) }}</div>
            <button class="x" (click)="quitar(l)">✕</button>
          </div>
        }
      </div>

      <div class="pos-pago">
        <div class="flex between"><span class="muted">Subtotal</span><b>S/ {{ base().toFixed(2) }}</b></div>
        <div class="flex between"><span class="muted">IGV (18%)</span><b>S/ {{ igv().toFixed(2) }}</b></div>
        <div class="flex between total"><span>TOTAL</span><span class="price" style="font-size:1.6rem">S/ {{ total().toFixed(2) }}</span></div>

        <div class="opts">
          <div>
            <label class="muted small">Comprobante</label>
            <div class="seg"><button [class.on]="comp==='Boleta'" (click)="comp='Boleta'">Boleta</button><button [class.on]="comp==='Factura'" (click)="comp='Factura'">Factura</button></div>
          </div>
          <div>
            <label class="muted small">Método de pago</label>
            <div class="seg s4"><button [class.on]="pago==='Efectivo'" (click)="pago='Efectivo'">Efectivo</button><button [class.on]="pago==='Yape'" (click)="pago='Yape'">Yape</button><button [class.on]="pago==='Plin'" (click)="pago='Plin'">Plin</button><button [class.on]="pago==='Tarjeta'" (click)="pago='Tarjeta'">Tarjeta</button></div>
          </div>
        </div>

        <a routerLink="/pos/comprobante" class="btn btn-primary btn-block btn-lg cobrar" [class.dis]="lineas.length===0">💵 COBRAR · S/ {{ total().toFixed(2) }}</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .pos { display:grid; grid-template-columns:1fr 380px; height:calc(100vh - 57px); }
    .pos-left { padding:1.25rem; overflow-y:auto; }
    .pos-search { display:flex; align-items:center; gap:.6rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:.4rem .9rem; margin-bottom:1rem; position:sticky; top:0; }
    .pos-search input { border:none; box-shadow:none; } .pos-search input:focus{ box-shadow:none; }
    .pos-prods { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.75rem; }
    .pp { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:.85rem .6rem; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:.2rem; text-align:center; transition:.12s; }
    .pp:hover:not(:disabled){ border-color:#16a34a; transform:translateY(-2px); }
    .pp:disabled { opacity:.5; cursor:not-allowed; }
    .pp-img { font-size:1.9rem; }
    .pp-name { font-size:.78rem; font-weight:600; line-height:1.15; min-height:32px; }
    .pp-price { font-weight:800; color:#15803d; font-size:.9rem; }
    .pp-stock { font-size:.68rem; color:#64748b; } .pp-stock.out { color:#dc2626; font-weight:700; }
    .pos-right { background:#fff; border-left:1px solid #e2e8f0; display:flex; flex-direction:column; }
    .pos-top { padding:1rem 1.25rem; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
    .pos-cart { flex:1; overflow-y:auto; padding:.75rem 1rem; }
    .empty { text-align:center; padding:2.5rem 0; }
    .pl { display:grid; grid-template-columns:1fr auto auto auto; align-items:center; gap:.6rem; padding:.6rem 0; border-bottom:1px solid #f1f5f9; }
    .pl-info b { font-size:.86rem; }
    .qty { display:inline-flex; align-items:center; border:1px solid #cbd5e1; border-radius:7px; overflow:hidden; }
    .qty button { border:none; background:#f1f5f9; width:26px; height:28px; cursor:pointer; }
    .qty span { width:28px; text-align:center; font-weight:600; font-size:.85rem; }
    .pl-sub { font-size:.86rem; min-width:64px; text-align:right; }
    .x { border:none; background:transparent; color:#94a3b8; cursor:pointer; }
    .pos-pago { border-top:2px solid #f1f5f9; padding:1rem 1.25rem 1.25rem; }
    .total { padding:.5rem 0; border-top:1px dashed #e2e8f0; margin-top:.4rem; font-weight:800; }
    .opts { display:flex; flex-direction:column; gap:.7rem; margin:.85rem 0; }
    .seg { display:grid; grid-template-columns:1fr 1fr; gap:.3rem; margin-top:.25rem; }
    .seg.s4 { grid-template-columns:repeat(4,1fr); }
    .seg button { border:1px solid #cbd5e1; background:#fff; padding:.45rem 0; border-radius:7px; font-size:.78rem; font-weight:600; cursor:pointer; }
    .seg button.on { background:#0284c7; color:#fff; border-color:#0284c7; }
    .cobrar { margin-top:.5rem; } .cobrar.dis { pointer-events:none; opacity:.5; }
    @media (max-width:880px){ .pos{ grid-template-columns:1fr; height:auto; } .pos-right{ border-left:none; } }
  `],
})
export class PosVenta {
  data = inject(DataService);
  q = '';
  comp = 'Boleta';
  pago = 'Efectivo';
  lineas: Linea[] = [
    { producto: this.data.getProductos()[0], cantidad: 2 },
    { producto: this.data.getProductos()[4], cantidad: 1 },
  ];

  filtrados() {
    const q = this.q.toLowerCase();
    return this.data.getProductos().filter(p => !q || p.nombreProducto.toLowerCase().includes(q) || String(p.codigoProducto) === q);
  }
  add(p: Producto) {
    const l = this.lineas.find(x => x.producto.codigoProducto === p.codigoProducto);
    if (l) l.cantidad++; else this.lineas.push({ producto: p, cantidad: 1 });
  }
  dec(l: Linea) { l.cantidad > 1 ? l.cantidad-- : this.quitar(l); }
  quitar(l: Linea) { this.lineas = this.lineas.filter(x => x !== l); }
  sub() { return this.lineas.reduce((s, l) => s + l.producto.precioVenta * l.cantidad, 0); }
  base() { return this.sub() / (1 + IGV_RATE); }
  igv() { return this.sub() - this.base(); }
  total() { return this.sub(); }
}
