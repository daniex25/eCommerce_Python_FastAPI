import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';
import { Entrega } from '../../core/models';

@Component({
  selector: 'app-entregas-repartidor',
  imports: [CommonModule],
  template: `
  <div class="rep-head">
    <h2>Mis entregas de hoy</h2>
    <div class="rep-sum"><span>{{ pendientes().length }} pendientes</span> · <span>{{ entregadas().length }} entregadas</span></div>
  </div>

  @for (e of mias(); track e.codigoEntrega) {
    <div class="entrega" [class.done]="e.estadoEntrega==='Entregado'">
      <div class="e-top">
        <b>Pedido #{{ e.numeroPedido }}</b>
        @switch (e.estadoEntrega) {
          @case ('Entregado') { <span class="badge badge-green">Entregado</span> }
          @case ('En Ruta') { <span class="badge badge-blue">En ruta</span> }
          @case ('Incidencia') { <span class="badge badge-red">Incidencia</span> }
          @default { <span class="badge badge-amber">Asignado</span> }
        }
      </div>
      <div class="e-cli">👤 {{ e.cliente }}</div>
      <div class="e-dir">📍 {{ e.direccionEntrega }}<div class="muted small">{{ e.distrito }}</div></div>

      @if (e.estadoEntrega !== 'Entregado') {
        <div class="e-acts">
          <a class="btn btn-blue btn-sm" style="flex:1">🗺️ Ver ruta</a>
          <a class="btn btn-outline btn-sm" style="flex:1">📞 Llamar</a>
        </div>
        <button class="btn btn-primary btn-block" (click)="entregar(e)">✓ Marcar como Entregado</button>
        <button class="btn-link" (click)="incidencia(e)">Reportar incidencia</button>
      } @else {
        <div class="e-ok">✓ Entregado a las {{ e.hora }}</div>
      }
    </div>
  }

  @if (toast) { <div class="r-toast">✓ {{ toast }}</div> }
  `,
  styles: [`
    .rep-head { margin-bottom:1rem; }
    .rep-head h2 { font-size:1.15rem; }
    .rep-sum { font-size:.8rem; color:#64748b; }
    .entrega { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1rem; margin-bottom:.85rem; box-shadow:0 1px 3px rgba(15,23,42,.06); }
    .entrega.done { opacity:.7; background:#f8fafc; }
    .e-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
    .e-cli { font-size:.9rem; margin-bottom:.2rem; }
    .e-dir { font-size:.9rem; margin-bottom:.75rem; }
    .e-acts { display:flex; gap:.5rem; margin-bottom:.5rem; }
    .btn-link { background:none; border:none; color:#dc2626; font-size:.8rem; width:100%; padding:.5rem 0 0; cursor:pointer; font-weight:600; }
    .e-ok { color:#15803d; font-weight:700; text-align:center; padding:.4rem 0; }
    .r-toast { position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#15803d; color:#fff; padding:.6rem 1.2rem; border-radius:999px; font-size:.85rem; font-weight:600; box-shadow:0 10px 20px rgba(0,0,0,.3); }
  `],
})
export class EntregasRepartidor {
  data = inject(DataService);
  toast = '';
  // entregas asignadas al repartidor 1 (Pedro Castillo) + una ya entregada de ejemplo
  lista: (Entrega & { hora?: string })[] = [
    ...this.data.getEntregas().filter(e => e.codigoRepartidor === 1),
    { codigoEntrega: 99, numeroPedido: 1045, codigoRepartidor: 1, cliente: 'Luis Alberto Vargas', direccionEntrega: 'Av. 28 de Julio 712', distrito: 'Huacho', estadoEntrega: 'Entregado', hora: '10:24' },
  ];
  mias() { return this.lista; }
  pendientes() { return this.lista.filter(e => e.estadoEntrega !== 'Entregado'); }
  entregadas() { return this.lista.filter(e => e.estadoEntrega === 'Entregado'); }
  entregar(e: any) { e.estadoEntrega = 'Entregado'; e.hora = '11:48'; this.toast = `Pedido #${e.numeroPedido} marcado como entregado`; setTimeout(() => this.toast = '', 1800); }
  incidencia(e: any) { e.estadoEntrega = 'Incidencia'; this.toast = `Incidencia reportada en #${e.numeroPedido}`; setTimeout(() => this.toast = '', 1800); }
}
