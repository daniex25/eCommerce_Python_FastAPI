import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { OrdenCompra } from '../../core/models';

@Component({
  selector: 'app-recepcion',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Recepción de mercadería</h1><div class="sub">Ingreso de productos contra orden de compra · Lote y vencimiento obligatorios</div></div>

    <div class="rec-grid">
      <aside class="card card-pad-0">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Órdenes pendientes</b></div>
        @for (o of pendientes(); track o.numeroOrden) {
          <button class="oc" [class.on]="sel?.numeroOrden===o.numeroOrden" (click)="elegir(o)">
            <div class="flex between"><b>OC #{{ o.numeroOrden }}</b><span class="badge badge-amber">{{ o.estado }}</span></div>
            <div class="muted small">{{ o.proveedor }}</div>
            <div class="muted small">{{ o.fechaEmision }} · S/ {{ o.montoTotal.toFixed(2) }}</div>
          </button>
        }
      </aside>

      <div class="card">
        @if (sel) {
          <div class="flex between mb">
            <div><h3>OC #{{ sel.numeroOrden }} — Detalle de recepción</h3><div class="muted small">{{ sel.proveedor }} · RUC {{ sel.rucProveedor }}</div></div>
            <span class="badge badge-blue">Guía de remisión: 001-008842</span>
          </div>

          <div class="notice notice-amber mb">⚠️ El <b>número de lote</b> y la <b>fecha de vencimiento</b> son obligatorios por trazabilidad sanitaria (DIGEMID).</div>

          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>Producto</th><th class="num">Solicitado</th><th class="num">Recibido</th><th>N° de Lote *</th><th>F. Vencimiento *</th></tr></thead>
              <tbody>
                @for (d of sel.detalle; track d.codigoProducto; let i = $index) {
                  <tr>
                    <td><b>{{ d.nombreProducto }}</b></td>
                    <td class="num">{{ d.cantidad }}</td>
                    <td class="num"><input class="inp ti" [value]="d.cantidad" type="number" /></td>
                    <td><input class="inp" placeholder="Ej. LT-2026-A07" [(ngModel)]="lotes[i]" [class.invalid]="!lotes[i]" /></td>
                    <td><input class="inp" type="date" [(ngModel)]="vence[i]" [class.invalid]="!vence[i]" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex between mt">
            <div class="muted small">Recepcionado por: Encargado de Almacén · 18/06/2026</div>
            <div class="flex">
              <button class="btn btn-outline">Recepción parcial</button>
              <button class="btn btn-primary" [disabled]="!completo()" (click)="confirmar()">✓ Confirmar ingreso a stock</button>
            </div>
          </div>
          @if (ok) { <div class="notice notice-green mt">✓ Ingreso registrado. Stock actualizado y lotes creados con su fecha de vencimiento.</div> }
        } @else {
          <div class="center muted" style="padding:3rem">Selecciona una orden de compra para recepcionar.</div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
    .rec-grid { display:grid; grid-template-columns:260px 1fr; gap:1.25rem; align-items:start; }
    .oc { display:block; width:100%; text-align:left; border:none; border-bottom:1px solid #f1f5f9; background:#fff; padding:.85rem 1.25rem; cursor:pointer; }
    .oc:hover { background:#f8fafc; }
    .oc.on { background:#e0f2fe; border-left:3px solid #0284c7; }
    .ti { width:70px; }
    @media (max-width:760px){ .rec-grid{ grid-template-columns:1fr; } }
  `],
})
export class Recepcion {
  data = inject(DataService);
  sel?: OrdenCompra;
  lotes: string[] = [];
  vence: string[] = [];
  ok = false;
  pendientes() { return this.data.ordenes.filter(o => o.estado === 'Pendiente'); }
  elegir(o: OrdenCompra) { this.sel = o; this.lotes = []; this.vence = []; this.ok = false; }
  completo() { const n = this.sel?.detalle?.length || 0; return n > 0 && this.lotes.filter(Boolean).length === n && this.vence.filter(Boolean).length === n; }
  confirmar() { if (this.completo()) this.ok = true; }
}
