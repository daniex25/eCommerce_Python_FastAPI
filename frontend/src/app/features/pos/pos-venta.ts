import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, IGV_RATE } from '../../core/data.service';
import { ApiService, RecetaInlinePOS } from '../../core/api.service';
import { Producto } from '../../core/models';

interface Linea { producto: Producto; cantidad: number; receta?: RecetaInlinePOS; }

@Component({
  selector: 'app-pos-venta',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="pos">
    <div class="pos-left">
      <div class="pos-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input class="inp" [(ngModel)]="q" placeholder="Buscar o escanear producto (nombre o código)…" autofocus />
        <span class="badge badge-blue"><i class="fa-solid fa-barcode"></i> Escáner activo</span>
      </div>
      <div class="pos-prods">
        @for (p of filtrados(); track p.codigoProducto) {
          <button class="pp" [disabled]="p.stockDisponible===0" (click)="alSeleccionar(p)">
            <span class="pp-img"><i class="fa-solid {{ p.icono }}"></i></span>
            <span class="pp-name">{{ p.nombreProducto }}</span>
            @if (p.condicionVenta === 'Bajo Receta') { <span class="badge badge-amber small">Bajo receta</span> }
            <span class="pp-price">S/ {{ p.precioVenta.toFixed(2) }}</span>
            <span class="pp-stock" [class.out]="p.stockDisponible===0">{{ p.stockDisponible===0 ? 'Agotado' : p.stockDisponible + ' und' }}</span>
          </button>
        }
      </div>
    </div>

    <div class="pos-right">
      <div class="pos-top">
        <div><b>Venta en mostrador</b><div class="muted small">Caja 01</div></div>
        <span class="badge badge-green">Sesión activa</span>
      </div>

      @if (mensajeError) { <div class="notice notice-red" style="margin:.75rem 1rem">{{ mensajeError }}</div> }

      @if (productoBajoReceta; as pbr) {
        <div class="notice notice-amber receta-inline">
          <b>Producto de venta bajo receta: {{ pbr.nombreProducto }}</b>
          <p class="muted small">RN1101 — registra y retén la receta física antes de continuar.</p>
          <div class="field"><label>Nombre del paciente</label><input class="inp" [(ngModel)]="recetaForm.nombrePaciente" /></div>
          <div class="field"><label>Médico tratante</label><input class="inp" [(ngModel)]="recetaForm.medicoTratante" /></div>
          <div class="field"><label>Colegiatura (CMP)</label><input class="inp" [(ngModel)]="recetaForm.cmpMedico" placeholder="Opcional" /></div>
          <div class="flex mt">
            <button class="btn btn-primary btn-sm" [disabled]="!recetaForm.nombrePaciente || !recetaForm.medicoTratante" (click)="confirmarRecetaYAgregar()">Confirmar y agregar</button>
            <button class="btn btn-outline btn-sm" (click)="productoBajoReceta = undefined">Cancelar</button>
          </div>
        </div>
      }

      <div class="pos-cart">
        @if (lineas.length === 0) { <div class="empty muted">Agrega productos para iniciar la venta</div> }
        @for (l of lineas; track l.producto.codigoProducto) {
          <div class="pl">
            <div class="pl-info"><b>{{ l.producto.nombreProducto }}</b><div class="muted small">S/ {{ l.producto.precioVenta.toFixed(2) }} c/u @if (l.receta) { · receta: {{ l.receta.nombrePaciente }} }</div></div>
            <div class="qty">
              <button (click)="dec(l)">−</button><span>{{ l.cantidad }}</span><button (click)="l.cantidad=l.cantidad+1">＋</button>
            </div>
            <div class="pl-sub money">S/ {{ (l.producto.precioVenta*l.cantidad).toFixed(2) }}</div>
            <button class="x" (click)="quitar(l)"><i class="fa-solid fa-xmark"></i></button>
          </div>
        }
      </div>

      <div class="pos-pago">
        <div class="flex between"><span class="muted">Subtotal</span><b>S/ {{ base().toFixed(2) }}</b></div>
        <div class="flex between"><span class="muted">IGV (18%)</span><b>S/ {{ igv().toFixed(2) }}</b></div>
        <div class="flex between total"><span>TOTAL</span><span class="price" style="font-size:1.6rem">S/ {{ total().toFixed(2) }}</span></div>

        <div class="opts">
          <div>
            <label class="muted small">Método de pago</label>
            <div class="seg s4"><button [class.on]="pago==='Efectivo'" (click)="pago='Efectivo'">Efectivo</button><button [class.on]="pago==='Yape'" (click)="pago='Yape'">Yape</button><button [class.on]="pago==='Plin'" (click)="pago='Plin'">Plin</button><button [class.on]="pago==='Tarjeta'" (click)="pago='Tarjeta'">Tarjeta</button></div>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg cobrar" [class.dis]="lineas.length===0 || cargando" [disabled]="lineas.length===0 || cargando" (click)="cobrar()">
          <i class="fa-solid fa-sack-dollar"></i> {{ cargando ? 'Procesando…' : 'COBRAR · S/ ' + total().toFixed(2) }}
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .pos { display:grid; grid-template-columns:1fr 380px; height:calc(100vh - 57px); }
    .pos-left { padding:1.25rem; overflow-y:auto; }
    .pos-search {
      display:flex; align-items:center; gap:.6rem; background:var(--glass-bg); border:1px solid var(--glass-border);
      border-radius:10px; padding:.4rem .9rem; margin-bottom:1rem; position:sticky; top:0; color:var(--text-secondary);
    }
    .pos-search input { border:none; box-shadow:none; } .pos-search input:focus{ box-shadow:none; }
    .pos-prods { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.75rem; }
    .pp {
      background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:10px; padding:.85rem .6rem; cursor:pointer;
      display:flex; flex-direction:column; align-items:center; gap:.2rem; text-align:center; transition:.12s;
    }
    .pp:hover:not(:disabled){ border-color:var(--accent-blue); transform:translateY(-2px); box-shadow:var(--glow-blue-sm); }
    .pp:disabled { opacity:.5; cursor:not-allowed; }
    .pp-img { font-size:1.6rem; color:var(--accent-blue); }
    .pp-name { font-size:.78rem; font-weight:600; line-height:1.15; min-height:32px; color:var(--text-primary); }
    .pp-price { font-weight:800; color:var(--ok); font-size:.9rem; }
    .pp-stock { font-size:.68rem; color:var(--text-secondary); } .pp-stock.out { color:var(--danger); font-weight:700; }
    .pos-right { background:var(--glass-bg); border-left:1px solid var(--glass-border); display:flex; flex-direction:column; overflow-y:auto; }
    .pos-top { padding:1rem 1.25rem; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center; color:var(--text-primary); }
    .receta-inline { margin:.75rem 1rem; }
    .pos-cart { flex:1; overflow-y:auto; padding:.75rem 1rem; }
    .empty { text-align:center; padding:2.5rem 0; color:var(--text-secondary); }
    .pl { display:grid; grid-template-columns:1fr auto auto auto; align-items:center; gap:.6rem; padding:.6rem 0; border-bottom:1px solid var(--glass-border); }
    .pl-info b { font-size:.86rem; color:var(--text-primary); }
    .qty { display:inline-flex; align-items:center; border:1px solid var(--glass-border-strong); border-radius:7px; overflow:hidden; }
    .qty button { border:none; background:var(--glass-bg-strong); color:var(--text-primary); width:26px; height:28px; cursor:pointer; }
    .qty span { width:28px; text-align:center; font-weight:600; font-size:.85rem; color:var(--text-primary); }
    .pl-sub { font-size:.86rem; min-width:64px; text-align:right; color:var(--text-primary); }
    .x { border:none; background:transparent; color:var(--text-secondary); cursor:pointer; }
    .pos-pago { border-top:2px solid var(--glass-border); padding:1rem 1.25rem 1.25rem; }
    .total { padding:.5rem 0; border-top:1px dashed var(--glass-border); margin-top:.4rem; font-weight:800; color:var(--text-primary); }
    .opts { display:flex; flex-direction:column; gap:.7rem; margin:.85rem 0; }
    .seg { display:grid; grid-template-columns:1fr 1fr; gap:.3rem; margin-top:.25rem; }
    .seg.s4 { grid-template-columns:repeat(4,1fr); }
    .seg button { border:1px solid var(--glass-border-strong); background:var(--glass-bg); color:var(--text-primary); padding:.45rem 0; border-radius:7px; font-size:.78rem; font-weight:600; cursor:pointer; }
    .seg button.on { background:var(--accent-gradient); color:#fff; border-color:transparent; }
    .cobrar { margin-top:.5rem; } .cobrar.dis { pointer-events:none; opacity:.5; }
    @media (max-width:880px){ .pos{ grid-template-columns:1fr; height:auto; } .pos-right{ border-left:none; } }
  `],
})
export class PosVenta {
  data = inject(DataService);
  api = inject(ApiService);
  router = inject(Router);

  q = '';
  pago: 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta' = 'Efectivo';
  lineas: Linea[] = [];
  cargando = false;
  mensajeError = '';

  productoBajoReceta?: Producto;
  recetaForm: RecetaInlinePOS = { nombrePaciente: '', medicoTratante: '', cmpMedico: '' };

  filtrados() {
    const q = this.q.toLowerCase();
    return this.data.getProductos().filter(p => !q || p.nombreProducto.toLowerCase().includes(q) || String(p.codigoProducto) === q);
  }

  alSeleccionar(p: Producto) {
    if (p.condicionVenta === 'Bajo Receta') {
      this.productoBajoReceta = p;
      this.recetaForm = { nombrePaciente: '', medicoTratante: '', cmpMedico: '' };
      return;
    }
    this.add(p);
  }

  confirmarRecetaYAgregar() {
    if (!this.productoBajoReceta) return;
    this.add(this.productoBajoReceta, { ...this.recetaForm });
    this.productoBajoReceta = undefined;
  }

  add(p: Producto, receta?: RecetaInlinePOS) {
    const l = this.lineas.find(x => x.producto.codigoProducto === p.codigoProducto);
    if (l) l.cantidad++;
    else this.lineas.push({ producto: p, cantidad: 1, receta });
  }
  dec(l: Linea) { l.cantidad > 1 ? l.cantidad-- : this.quitar(l); }
  quitar(l: Linea) { this.lineas = this.lineas.filter(x => x !== l); }
  sub() { return this.lineas.reduce((s, l) => s + l.producto.precioVenta * l.cantidad, 0); }
  base() { return this.sub() / (1 + IGV_RATE); }
  igv() { return this.sub() - this.base(); }
  total() { return this.sub(); }

  cobrar() {
    if (this.cargando || this.lineas.length === 0) return;
    this.mensajeError = '';
    this.cargando = true;

    this.api.ventaPOS({
      items: this.lineas.map(l => ({ codigoProducto: l.producto.codigoProducto, cantidad: l.cantidad, receta: l.receta })),
      metodoPago: this.pago,
    }).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.lineas = [];
        this.router.navigate(['/pos/comprobante'], {
          queryParams: { pago: respuesta.pago.codigoPago, pedido: respuesta.pedido.numeroPedido },
        });
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err?.error?.detail || 'No se pudo registrar la venta. Inténtalo nuevamente.';
      },
    });
  }
}
