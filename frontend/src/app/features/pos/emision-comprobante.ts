import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Pedido, Comprobante } from '../../core/models';

@Component({
  selector: 'app-emision-comprobante',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="page-header"><h1>Emisión de comprobante electrónico</h1><div class="sub">@if (pedido) { Pedido #{{ pedido.numeroPedido }} · } Boleta / Factura</div></div>

    @if (!codigoPago) {
      <div class="card center muted" style="padding:3rem">No hay una venta activa para emitir. <a routerLink="/pos/venta">Volver al POS</a></div>
    } @else {
    <div class="emi-grid">
      <div class="card">
        <h3>Datos del comprobante</h3>

        @if (mensajeError) { <div class="notice notice-red mb">{{ mensajeError }}</div> }

        @if (!comprobante) {
          <div class="seg mb">
            <button [class.on]="tipo==='Boleta'" (click)="tipo='Boleta'">Boleta de Venta</button>
            <button [class.on]="tipo==='Factura'" (click)="tipo='Factura'">Factura</button>
          </div>

          <div class="flex">
            <div class="field" style="flex:1">
              <label>{{ tipo==='Factura' ? 'RUC del cliente' : 'DNI del cliente' }}</label>
              <input class="inp" [(ngModel)]="doc" [class.invalid]="docInvalido()" [placeholder]="tipo==='Factura' ? '11 dígitos' : '8 dígitos'" maxlength="11" />
              @if (docInvalido()) { <span class="err">{{ tipo==='Factura' ? 'El RUC debe tener 11 dígitos' : 'El DNI debe tener 8 dígitos' }}</span> }
            </div>
            <div class="field" style="flex:2">
              <label>{{ tipo==='Factura' ? 'Razón social' : 'Nombre completo' }}</label>
              <input class="inp" [(ngModel)]="nombre" />
            </div>
          </div>

          <div class="flex mt">
            <button class="btn btn-primary" [disabled]="cargando" (click)="emitir()">📤 {{ cargando ? 'Emitiendo…' : 'Emitir y enviar a SUNAT' }}</button>
          </div>
        } @else {
          <div class="notice notice-green mt">✓ Comprobante <b>{{ comprobante.numeroComprobante }}</b> emitido. Estado SUNAT: <b>{{ comprobante.estadoSunat }}</b>.</div>
          <a routerLink="/pos/venta" class="btn btn-outline mt">‹ Nueva venta</a>
        }
      </div>

      <div class="card recibo">
        <div class="rc-head">
          <div class="logo">✚</div>
          <div><b>BOTICA CENTRAL</b><div class="muted small">RUC 20512345678</div><div class="muted small">Av. Grau 521, Huacho — Huaura</div></div>
        </div>
        <div class="rc-tipo">{{ tipo === 'Factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}<br><b>{{ comprobante?.numeroComprobante || (tipo==='Factura'?'F001':'B001') + '-••••••••' }}</b></div>
        <div class="rc-cli">
          <div><span class="muted small">{{ tipo==='Factura'?'RUC':'DNI' }}:</span> {{ doc || '—' }}</div>
          <div><span class="muted small">Cliente:</span> {{ nombre || '—' }}</div>
        </div>
        <table class="rc-tbl">
          <tr><th>Cant.</th><th>Descripción</th><th class="num">Importe</th></tr>
          @for (d of pedido?.detalle; track d.codigoProducto) {
            <tr><td>{{ d.cantidad }}</td><td>{{ d.nombreProducto }}</td><td class="num">{{ d.subtotal.toFixed(2) }}</td></tr>
          }
        </table>
        <div class="rc-tot">
          <div class="flex between"><span>Op. Gravada</span><b>S/ {{ (comprobante?.subtotal ?? 0).toFixed(2) }}</b></div>
          <div class="flex between"><span>IGV (18%)</span><b>S/ {{ (comprobante?.igv ?? 0).toFixed(2) }}</b></div>
          <div class="flex between gtot"><span>TOTAL</span><b>S/ {{ (comprobante?.total ?? pedido?.montoTotal ?? 0).toFixed(2) }}</b></div>
        </div>
        <div class="rc-foot">
          <div class="qr">▦▦<br>▦▦</div>
          <div class="muted small">Representación impresa del comprobante electrónico.
            @if (comprobante) { <span class="sunat">{{ comprobante.estadoSunat === 'Aceptado' ? '✓ Aceptado por SUNAT' : 'Estado SUNAT: ' + comprobante.estadoSunat }}</span> }
          </div>
        </div>
      </div>
    </div>
    }
  </div>
  `,
  styles: [`
    .emi-grid { display:grid; grid-template-columns:1fr 360px; gap:1.25rem; align-items:start; }
    .seg { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; }
    .seg button { border:1px solid #cbd5e1; background:#fff; padding:.6rem 0; border-radius:8px; font-weight:600; cursor:pointer; }
    .seg button.on { background:#0284c7; color:#fff; border-color:#0284c7; }
    .recibo { font-size:.85rem; }
    .rc-head { display:flex; gap:.6rem; align-items:center; border-bottom:1px dashed #cbd5e1; padding-bottom:.75rem; }
    .rc-head .logo { width:40px; height:40px; border-radius:9px; background:#15803d; color:#fff; display:grid; place-items:center; font-weight:900; font-size:1.3rem; }
    .rc-tipo { text-align:center; border:1px solid #cbd5e1; border-radius:8px; padding:.5rem; margin:.85rem 0; font-size:.78rem; font-weight:600; }
    .rc-cli { display:flex; flex-direction:column; gap:.2rem; padding-bottom:.6rem; border-bottom:1px dashed #cbd5e1; }
    .rc-tbl { width:100%; border-collapse:collapse; margin:.6rem 0; }
    .rc-tbl th { text-align:left; font-size:.72rem; color:#64748b; border-bottom:1px solid #e2e8f0; padding:.3rem 0; }
    .rc-tbl td { padding:.3rem 0; border-bottom:1px solid #f1f5f9; }
    .rc-tot { margin-top:.5rem; }
    .rc-tot .flex { padding:.2rem 0; font-size:.85rem; }
    .gtot { border-top:1px solid #cbd5e1; margin-top:.3rem; padding-top:.4rem !important; font-size:1rem; font-weight:800; }
    .rc-foot { display:flex; gap:.6rem; align-items:center; margin-top:.85rem; border-top:1px dashed #cbd5e1; padding-top:.6rem; }
    .qr { font-family:monospace; background:#fff; border:1px solid #cbd5e1; padding:.3rem .5rem; border-radius:6px; font-size:.7rem; line-height:1; }
    .sunat { color:#15803d; font-weight:700; display:block; margin-top:.25rem; }
    @media (max-width:760px){ .emi-grid{ grid-template-columns:1fr; } }
  `],
})
export class EmisionComprobante {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  codigoPago?: number;
  pedido?: Pedido;
  comprobante?: Comprobante;

  tipo: 'Boleta' | 'Factura' = 'Boleta';
  doc = '';
  nombre = '';
  cargando = false;
  mensajeError = '';

  constructor() {
    const pago = Number(this.route.snapshot.queryParamMap.get('pago'));
    const pedido = Number(this.route.snapshot.queryParamMap.get('pedido'));
    this.codigoPago = pago || undefined;

    if (pedido) {
      this.api.getPedido(pedido).subscribe({ next: (p) => this.pedido = p, error: () => {} });
    }
  }

  docInvalido() {
    const len = this.doc.replace(/\D/g, '').length;
    return this.tipo === 'Factura' ? len !== 11 : len !== 8;
  }

  emitir() {
    if (this.docInvalido() || !this.codigoPago || this.cargando) return;
    this.mensajeError = '';
    this.cargando = true;
    this.api.emitirComprobante({
      codigoPago: this.codigoPago,
      tipoComprobante: this.tipo,
      documentoCliente: this.doc,
      nombreCliente: this.nombre,
    }).subscribe({
      next: (comprobante) => { this.comprobante = comprobante; this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err?.error?.detail || 'No se pudo emitir el comprobante.';
      },
    });
  }
}
