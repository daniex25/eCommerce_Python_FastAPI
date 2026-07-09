import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, IGV_RATE } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

interface Direccion { etiqueta: string; direccion: string; distrito: string; }

const DIRECCIONES: Direccion[] = [
  { etiqueta: 'Casa — María Elena Quispe', direccion: 'Av. Grau 521, Huacho', distrito: 'Huacho' },
  { etiqueta: 'Trabajo', direccion: 'Jr. Dos de Mayo 145, Huacho', distrito: 'Huacho' },
];

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Checkout — Pago electrónico</h1><div class="sub">Revisa tu pedido y completa el pago de forma segura.</div></div>

    @if (mensajeError) { <div class="notice notice-red mb"><i class="fa-solid fa-triangle-exclamation"></i> {{ mensajeError }}</div> }

    <div class="co-grid">
      <div class="flex-col" style="gap:1.25rem">
        <div class="card">
          <h3>1 · Dirección de entrega</h3>
          <div class="dir-list">
            @for (d of direcciones; track d.etiqueta; let i = $index) {
              <label class="dir" [class.on]="dirSeleccionada===i">
                <input type="radio" name="dir" [checked]="dirSeleccionada===i" (change)="dirSeleccionada=i" />
                <div><b>{{ d.etiqueta }}</b><div class="muted small">{{ d.direccion }} · {{ d.distrito }}</div></div>
              </label>
            }
          </div>
        </div>

        <div class="card">
          <h3>2 · Método de pago</h3>
          <div class="pagos">
            <label class="pago" [class.on]="metodo==='Yape'"><input type="radio" name="m" (change)="metodo='Yape'"><span class="pi" style="background:#6d28d9">Yape</span><b>Yape</b></label>
            <label class="pago" [class.on]="metodo==='Plin'"><input type="radio" name="m" (change)="metodo='Plin'"><span class="pi" style="background:#0891b2">Plin</span><b>Plin</b></label>
            <label class="pago" [class.on]="metodo==='Tarjeta'"><input type="radio" name="m" (change)="metodo='Tarjeta'"><span class="pi" style="background:#0f172a">💳</span><b>Tarjeta</b></label>
            <label class="pago" [class.on]="metodo==='PagoEfectivo'"><input type="radio" name="m" (change)="metodo='PagoEfectivo'"><span class="pi" style="background:#dc2626">PE</span><b>PagoEfectivo</b></label>
          </div>

          @if (metodo==='Yape' || metodo==='Plin') {
            <div class="qr notice notice-blue mt">
              <div class="qr-box">▦▦▦<br>▦ QR ▦<br>▦▦▦</div>
              <div>Escanea el código <b>{{ metodo }}</b> con tu app y confirma el pago de <b>S/ {{ total().toFixed(2) }}</b>.<br><span class="muted small">Número: 987 654 321 · Botica Central</span></div>
            </div>
          }
          @if (metodo==='Tarjeta') {
            <div class="mt notice notice-blue">Serás derivado a la pasarela de pago para ingresar los datos de tu tarjeta de forma segura.</div>
          }
          @if (metodo==='PagoEfectivo') {
            <div class="notice notice-amber mt">🧾 Se generará un <b>código CIP</b> para pagar en agentes y bodegas afiliadas. Tu pedido se confirma al registrarse el pago.</div>
          }
        </div>

        <div class="card">
          <h3>3 · Comprobante</h3>
          <div class="flex">
            <label class="comp" [class.on]="tipoComprobante==='Boleta'"><input type="radio" name="c" [checked]="tipoComprobante==='Boleta'" (change)="tipoComprobante='Boleta'"> Boleta (DNI)</label>
            <label class="comp" [class.on]="tipoComprobante==='Factura'"><input type="radio" name="c" [checked]="tipoComprobante==='Factura'" (change)="tipoComprobante='Factura'"> Factura (RUC)</label>
          </div>
          <div class="field mt" style="max-width:260px">
            <label>{{ tipoComprobante==='Factura' ? 'RUC' : 'DNI' }}</label>
            <input class="inp" [(ngModel)]="documentoCliente" [placeholder]="tipoComprobante==='Factura' ? '11 dígitos' : '8 dígitos'" />
          </div>
        </div>
      </div>

      <aside class="card resumen">
        <h3>Resumen del pedido</h3>
        @for (i of data.getCarrito(); track i.producto.codigoProducto) {
          <div class="r-item"><span>{{ i.cantidad }}× {{ i.producto.nombreProducto }}</span><b>S/ {{ (i.producto.precioVenta*i.cantidad).toFixed(2) }}</b></div>
        }
        <hr>
        <div class="r-line"><span>Subtotal</span><b>S/ {{ base().toFixed(2) }}</b></div>
        <div class="r-line"><span>IGV (18%)</span><b>S/ {{ igv().toFixed(2) }}</b></div>
        <div class="r-line"><span>Costo de envío</span><b>S/ {{ envio.toFixed(2) }}</b></div>
        <div class="r-total"><span>Total a pagar</span><span class="price">S/ {{ total().toFixed(2) }}</span></div>
        <button class="btn btn-primary btn-block btn-lg mt" [disabled]="cargando || data.getCarrito().length===0" (click)="pagar()">
          {{ cargando ? 'Procesando…' : '🔒 Pagar con ' + metodo }}
        </button>
        <div class="muted small center mt">Pago seguro · Datos protegidos</div>
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .co-grid { display:grid; grid-template-columns:1fr 340px; gap:1.25rem; align-items:start; }
    .card h3 { margin-bottom:1rem; }
    .dir-list { display:flex; flex-direction:column; gap:.6rem; }
    .dir { display:flex; gap:.7rem; align-items:center; border:1px solid #e2e8f0; border-radius:10px; padding:.8rem 1rem; cursor:pointer; }
    .dir.on { border-color:#16a34a; background:#dcfce7; }
    .pagos { display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem; }
    .pago { display:flex; flex-direction:column; align-items:center; gap:.4rem; border:1px solid #e2e8f0; border-radius:10px; padding:.85rem .5rem; cursor:pointer; }
    .pago.on { border-color:#0284c7; background:#e0f2fe; }
    .pago input { display:none; }
    .pi { width:40px; height:30px; border-radius:6px; color:#fff; display:grid; place-items:center; font-weight:800; font-size:.75rem; }
    .pago b { font-size:.8rem; }
    .qr { align-items:center; }
    .qr-box { font-family:monospace; background:#fff; border:1px solid #cbd5e1; padding:.6rem; border-radius:8px; text-align:center; font-size:.8rem; line-height:1.1; }
    .comp { border:1px solid #e2e8f0; border-radius:8px; padding:.5rem .9rem; cursor:pointer; font-size:.88rem; font-weight:600; }
    .comp.on { border-color:#16a34a; background:#dcfce7; }
    .resumen { position:sticky; top:80px; }
    .r-item { display:flex; justify-content:space-between; font-size:.85rem; padding:.3rem 0; color:#475569; }
    .r-line { display:flex; justify-content:space-between; padding:.35rem 0; font-size:.9rem; color:#475569; }
    .r-total { display:flex; justify-content:space-between; align-items:center; padding-top:.7rem; margin-top:.4rem; border-top:2px solid #f1f5f9; font-weight:800; }
    hr { border:none; border-top:1px dashed #e2e8f0; margin:.6rem 0; }
    @media (max-width:760px){ .co-grid{ grid-template-columns:1fr; } .pagos{ grid-template-columns:repeat(2,1fr);} }
  `],
})
export class Checkout {
  data = inject(DataService);
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);

  direcciones = DIRECCIONES;
  dirSeleccionada = 0;
  metodo: 'Yape' | 'Plin' | 'Tarjeta' | 'PagoEfectivo' = 'Yape';
  tipoComprobante: 'Boleta' | 'Factura' = 'Boleta';
  documentoCliente = '';
  envio = 8.00;
  cargando = false;
  mensajeError = '';

  base() { return this.data.subtotalCarrito() / (1 + IGV_RATE); }
  igv() { return this.data.subtotalCarrito() - this.base(); }
  total() { return this.data.subtotalCarrito() + this.envio; }

  pagar() {
    if (this.cargando || this.data.getCarrito().length === 0) return;
    this.mensajeError = '';
    this.cargando = true;

    const direccion = this.direcciones[this.dirSeleccionada];
    const usuario = this.auth.usuarioActual();

    this.api.checkout({
      items: this.data.getCarrito().map(i => ({
        codigoProducto: i.producto.codigoProducto,
        cantidad: i.cantidad,
        numeroReceta: i.numeroReceta,
      })),
      direccionEntrega: direccion.direccion,
      distrito: direccion.distrito,
      metodoPago: this.metodo,
      tipoComprobante: this.tipoComprobante,
      documentoCliente: this.documentoCliente || undefined,
      nombreCliente: usuario?.nombre,
    }).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.data.vaciarCarrito();
        this.router.navigate(['/tienda/confirmacion'], {
          queryParams: {
            pedido: respuesta.pedido.numeroPedido,
            comprobante: respuesta.comprobante.numeroComprobante,
            metodo: this.metodo,
          },
        });
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err?.error?.detail || 'No se pudo procesar el pago. Inténtalo nuevamente.';
      },
    });
  }
}
