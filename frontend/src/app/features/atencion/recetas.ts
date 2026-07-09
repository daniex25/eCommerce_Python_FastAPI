import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';
import { RecetaMedica } from '../../core/models';

@Component({
  selector: 'app-recetas',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Validación de recetas médicas</h1><div class="sub">Panel del Químico Farmacéutico · Revisión de recetas para venta de productos éticos</div></div>

    <div class="rec-grid">
      <aside class="card card-pad-0">
        <div class="flex between" style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Bandeja</b><span class="badge badge-amber">{{ pendientes().length }} pendientes</span></div>
        @for (r of data.getRecetas(); track r.numeroReceta) {
          <button class="ri" [class.on]="sel?.numeroReceta===r.numeroReceta" (click)="sel=r">
            <div class="flex between"><b>Receta #{{ r.numeroReceta }}</b>
              @switch (r.estado) {
                @case ('Pendiente') { <span class="badge badge-amber">Pendiente</span> }
                @case ('Aprobada') { <span class="badge badge-green">Aprobada</span> }
                @case ('Rechazada') { <span class="badge badge-red">Rechazada</span> }
              }
            </div>
            <div class="muted small">{{ r.nombrePaciente }}</div>
            <div class="muted small">{{ r.producto }}</div>
          </button>
        }
      </aside>

      <div class="card">
        @if (sel; as r) {
          <div class="flex between mb">
            <h3>Receta #{{ r.numeroReceta }}</h3>
            <span class="muted small">Pedido #{{ r.numeroPedido }} · {{ r.fechaEmision }}</span>
          </div>
          <div class="visor-grid">
            <div class="visor">
              <div class="visor-img"><i class="fa-solid fa-file-medical"></i></div>
              <div class="visor-cap muted small">Imagen de la receta cargada por el cliente · Clic para ampliar</div>
            </div>
            <div class="datos">
              <div class="d"><span class="muted small">Paciente</span><b>{{ r.nombrePaciente }}</b></div>
              <div class="d"><span class="muted small">Médico tratante</span><b>{{ r.medicoTratante }}</b></div>
              <div class="d"><span class="muted small">Colegiatura</span><b>{{ r.cmp }}</b></div>
              <div class="d"><span class="muted small">Producto solicitado</span><b>{{ r.producto }}</b></div>
              <div class="d"><span class="muted small">Fecha de emisión</span><b>{{ r.fechaEmision }}</b></div>
            </div>
          </div>

          @if (r.estado === 'Pendiente') {
            <div class="notice notice-blue mt">Verifica que la receta sea legible, vigente y corresponda al producto solicitado antes de aprobar.</div>
            <div class="flex mt">
              <button class="btn btn-primary" (click)="r.estado='Aprobada'">✓ Aprobar receta</button>
              <button class="btn btn-danger" (click)="r.estado='Rechazada'">✕ Rechazar</button>
              <button class="btn btn-outline">Solicitar nueva foto</button>
            </div>
          } @else if (r.estado === 'Aprobada') {
            <div class="notice notice-green mt">✓ Receta aprobada por Q.F. Andrea Salinas. El pedido puede continuar a despacho.</div>
          } @else {
            <div class="notice notice-red mt">✕ Receta rechazada. Se notificó al cliente para que adjunte una receta válida.</div>
          }
        } @else {
          <div class="center muted" style="padding:3rem">Selecciona una receta de la bandeja.</div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
    .rec-grid { display:grid; grid-template-columns:280px 1fr; gap:1.25rem; align-items:start; }
    .ri { display:block; width:100%; text-align:left; border:none; border-bottom:1px solid #f1f5f9; background:#fff; padding:.85rem 1.25rem; cursor:pointer; }
    .ri:hover { background:#f8fafc; } .ri.on { background:#e0f2fe; border-left:3px solid #0284c7; }
    .visor-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
    .visor { border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
    .visor-img { font-size:5rem; text-align:center; background:#f1f5f9; padding:2.5rem 0; }
    .visor-cap { padding:.6rem; text-align:center; }
    .datos { display:flex; flex-direction:column; gap:.85rem; }
    .datos .d { display:flex; flex-direction:column; }
    @media (max-width:880px){ .rec-grid,.visor-grid{ grid-template-columns:1fr; } }
  `],
})
export class Recetas {
  data = inject(DataService);
  sel?: RecetaMedica = this.data.getRecetas()[0];
  pendientes() { return this.data.getRecetas().filter(r => r.estado === 'Pendiente'); }
}
