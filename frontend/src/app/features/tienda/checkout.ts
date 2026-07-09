import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, IGV_RATE } from '../../core/data.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Checkout — Pago electrónico</h1><div class="sub">Revisa tu pedido y completa el pago de forma segura.</div></div>

    <div class="co-grid">
      <div class="flex-col" style="gap:1.25rem">
        <div class="card">
          <h3>1 · Dirección de entrega</h3>
          <div class="dir-list">
            <label class="dir on"><input type="radio" name="dir" checked /><div><b>Casa — María Elena Quispe</b><div class="muted small">Av. Grau 521, Huacho · Huaura · Lima</div></div></label>
            <label class="dir"><input type="radio" name="dir" /><div><b>Trabajo</b><div class="muted small">Jr. Dos de Mayo 145, Huacho</div></div></label>
          </div>
          <button class="btn btn-outline btn-sm mt">＋ Agregar nueva dirección</button>
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
            <div class="mt">
              <div class="field"><label>Número de tarjeta</label><input class="inp" placeholder="4509 •••• •••• 1234" /></div>
              <div class="flex"><div class="field" style="flex:1"><label>Vencimiento</label><input class="inp" placeholder="MM/AA" /></div><div class="field" style="flex:1"><label>CVV</label><input class="inp" placeholder="•••" /></div></div>
            </div>
          }
          @if (metodo==='PagoEfectivo') {
            <div class="notice notice-amber mt">🧾 Se generará un <b>código CIP</b> para pagar en agentes y bodegas afiliadas. Tu pedido se confirma al registrarse el pago.</div>
          }
        </div>

        <div class="card">
          <h3>3 · Comprobante</h3>
          <div class="flex">
            <label class="comp on"><input type="radio" name="c" checked> Boleta (DNI)</label>
            <label class="comp"><input type="radio" name="c"> Factura (RUC)</label>
          </div>
          <div class="field mt" style="max-width:260px"><label>DNI</label><input class="inp" value="45872136" /></div>
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
        <button class="btn btn-primary btn-block btn-lg mt" (click)="pagar()">🔒 Pagar con {{ metodo }}</button>
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
  router = inject(Router);
  metodo = 'Yape';
  envio = 8.00;
  base() { return this.data.subtotalCarrito() / (1 + IGV_RATE); }
  igv() { return this.data.subtotalCarrito() - this.base(); }
  total() { return this.data.subtotalCarrito() + this.envio; }
  pagar() { this.router.navigate(['/tienda/confirmacion']); }
}
