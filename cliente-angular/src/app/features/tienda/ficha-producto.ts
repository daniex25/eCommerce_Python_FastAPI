import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Producto } from '../../core/models';

@Component({
  selector: 'app-ficha-producto',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="crumbs muted small mb"><a routerLink="/tienda/catalogo">Catálogo</a> › {{ p?.categoria }} › <b>{{ p?.nombreProducto }}</b></div>

    @if (p; as p) {
    <div class="ficha">
      <div class="card galeria">
        <div class="big">{{ p.imagen }}</div>
        <div class="thumbs"><span>{{ p.imagen }}</span><span>📦</span><span>🏷️</span></div>
      </div>

      <div class="card detalle">
        <div class="d-lab">{{ p.laboratorio }} · {{ p.categoria }}</div>
        <h1>{{ p.nombreProducto }}</h1>
        @if (p.condicionVenta === 'Bajo Receta') {
          <div class="notice notice-amber mb">⚠️ <div>Producto de <b>venta bajo receta médica</b>. Deberás adjuntar tu receta válida en el checkout para que el Químico Farmacéutico la valide.</div></div>
        }
        <p class="muted">{{ p.descripcion }}</p>

        <div class="d-meta">
          <div><span class="muted small">Presentación</span><b>{{ p.presentacion }}</b></div>
          <div><span class="muted small">Condición</span><b>{{ p.condicionVenta }}</b></div>
          <div><span class="muted small">Código</span><b>#{{ p.codigoProducto }}</b></div>
        </div>

        <div class="d-price">
          <span class="price" style="font-size:2rem">S/ {{ p.precioVenta.toFixed(2) }}</span>
          @if (p.stockDisponible > 0) { <span class="badge badge-green">Disponible · {{ p.stockDisponible }} und</span> }
          @else { <span class="badge badge-red">Agotado</span> }
        </div>

        <div class="flex mt">
          <div class="qty">
            <button (click)="cant = cant > 1 ? cant-1 : 1">−</button>
            <input class="inp" [(ngModel)]="cant" type="number" min="1" />
            <button (click)="cant = cant+1">＋</button>
          </div>
          <button class="btn btn-primary btn-lg right" [disabled]="p.stockDisponible === 0" (click)="add(p)">🛒 Agregar al carrito</button>
        </div>

        <div class="d-feats">
          <span>🚚 Delivery en Huacho</span><span>🧾 Boleta / Factura</span><span>✓ Producto original</span>
        </div>
      </div>
    </div>
    } @else {
      <div class="card center muted" style="padding:3rem">Producto no encontrado. <a routerLink="/tienda/catalogo">Volver al catálogo</a></div>
    }
    @if (toast) { <div class="toast">✓ {{ toast }}</div> }
  </div>
  `,
  styles: [`
    .ficha { display:grid; grid-template-columns:0.9fr 1.1fr; gap:1.5rem; align-items:start; }
    .galeria .big { font-size:7rem; text-align:center; background:#f8fafc; border-radius:12px; padding:2.5rem 0; }
    .thumbs { display:flex; gap:.6rem; margin-top:.75rem; }
    .thumbs span { flex:1; text-align:center; font-size:1.6rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:.5rem 0; cursor:pointer; }
    .d-lab { color:#0369a1; font-weight:700; font-size:.8rem; text-transform:uppercase; }
    .detalle h1 { font-size:1.6rem; margin:.25rem 0 .75rem; }
    .d-meta { display:flex; gap:1.5rem; margin:1rem 0; padding:1rem 0; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; }
    .d-meta div { display:flex; flex-direction:column; }
    .d-price { display:flex; align-items:center; gap:1rem; margin:.5rem 0; }
    .qty { display:flex; align-items:center; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; }
    .qty button { border:none; background:#f1f5f9; width:38px; height:42px; font-size:1.2rem; cursor:pointer; }
    .qty input { width:54px; text-align:center; border:none; box-shadow:none; }
    .qty input:focus { box-shadow:none; }
    .d-feats { display:flex; gap:1.25rem; margin-top:1.25rem; font-size:.82rem; color:#475569; flex-wrap:wrap; }
    .toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); background:#15803d; color:#fff; padding:.7rem 1.4rem; border-radius:999px; font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,.25); z-index:50; }
    @media (max-width:760px){ .ficha{ grid-template-columns:1fr; } }
  `],
})
export class FichaProducto {
  data = inject(DataService);
  route = inject(ActivatedRoute);
  p?: Producto;
  cant = 1;
  toast = '';

  constructor() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.p = this.data.getProducto(id);
  }

  add(p: Producto) {
    this.data.agregarAlCarrito(p, +this.cant);
    this.toast = `${this.cant} × ${p.nombreProducto} agregado`;
    setTimeout(() => this.toast = '', 1800);
  }
}
