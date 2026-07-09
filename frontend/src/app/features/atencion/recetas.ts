import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { RecetaMedica } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recetas',
  imports: [CommonModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Validación de recetas médicas</h1><div class="sub">Panel del Químico Farmacéutico · Revisión de recetas para venta de productos éticos</div></div>

    @if (mensajeError) { <div class="notice notice-red mb"><i class="fa-solid fa-triangle-exclamation"></i> {{ mensajeError }}</div> }

    <div class="rec-grid">
      <aside class="card card-pad-0">
        <div class="flex between" style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Bandeja</b><span class="badge badge-amber">{{ pendientes().length }} pendientes</span></div>
        @for (r of recetas; track r.numeroReceta) {
          <button class="ri" [class.on]="sel?.numeroReceta===r.numeroReceta" (click)="sel=r">
            <div class="flex between"><b>Receta #{{ r.numeroReceta }}</b>
              @switch (r.estado) {
                @case ('Pendiente') { <span class="badge badge-amber">Pendiente</span> }
                @case ('Aprobada') { <span class="badge badge-green">Aprobada</span> }
                @case ('Rechazada') { <span class="badge badge-red">Rechazada</span> }
              }
            </div>
            <div class="muted small">{{ r.nombrePaciente }}</div>
          </button>
        } @empty {
          <div class="muted small" style="padding:1rem 1.25rem">No hay recetas registradas.</div>
        }
      </aside>

      <div class="card">
        @if (sel; as r) {
          <div class="flex between mb">
            <h3>Receta #{{ r.numeroReceta }}</h3>
            <span class="muted small">{{ r.fechaEmision }}</span>
          </div>
          <div class="visor-grid">
            <div class="visor">
              @if (r.imagenUrl) {
                <img class="visor-img-real" [src]="urlImagen(r.imagenUrl)" alt="Imagen de la receta" />
              } @else {
                <div class="visor-img"><i class="fa-solid fa-file-medical"></i></div>
                <div class="visor-cap muted small">El cliente no adjuntó una imagen.</div>
              }
            </div>
            <div class="datos">
              <div class="d"><span class="muted small">Paciente</span><b>{{ r.nombrePaciente }}</b></div>
              <div class="d"><span class="muted small">Médico tratante</span><b>{{ r.medicoTratante }}</b></div>
              <div class="d"><span class="muted small">Colegiatura</span><b>{{ r.cmpMedico || '—' }}</b></div>
              <div class="d"><span class="muted small">Fecha de emisión</span><b>{{ r.fechaEmision }}</b></div>
            </div>
          </div>

          @if (r.estado === 'Pendiente') {
            <div class="notice notice-blue mt">Verifica que la receta sea legible, vigente y corresponda al producto solicitado antes de aprobar.</div>
            <div class="flex mt">
              <button class="btn btn-primary" [disabled]="procesando" (click)="validar(r, 'Aprobada')">✓ Aprobar receta</button>
              <button class="btn btn-danger" [disabled]="procesando" (click)="validar(r, 'Rechazada')">✕ Rechazar</button>
            </div>
          } @else if (r.estado === 'Aprobada') {
            <div class="notice notice-green mt">✓ Receta aprobada. El Cliente ya puede completar su compra.</div>
          } @else {
            <div class="notice notice-red mt">✕ Receta rechazada. El Cliente deberá subir una receta válida.</div>
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
    .visor-img-real { width:100%; max-height:320px; object-fit:contain; background:#f1f5f9; display:block; }
    .visor-cap { padding:.6rem; text-align:center; }
    .datos { display:flex; flex-direction:column; gap:.85rem; }
    .datos .d { display:flex; flex-direction:column; }
    @media (max-width:880px){ .rec-grid,.visor-grid{ grid-template-columns:1fr; } }
  `],
})
export class Recetas {
  private api = inject(ApiService);

  recetas: RecetaMedica[] = [];
  sel?: RecetaMedica;
  procesando = false;
  mensajeError = '';

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.api.getRecetas().subscribe({
      next: (recetas) => {
        this.recetas = recetas;
        this.sel = recetas.find(r => r.estado === 'Pendiente') ?? recetas[0];
      },
      error: () => { this.mensajeError = 'No se pudieron cargar las recetas.'; },
    });
  }

  pendientes() { return this.recetas.filter(r => r.estado === 'Pendiente'); }

  urlImagen(ruta: string): string {
    return `${environment.apiUrl}${ruta}`;
  }

  validar(receta: RecetaMedica, estado: 'Aprobada' | 'Rechazada') {
    if (this.procesando) return;
    this.mensajeError = '';
    this.procesando = true;
    this.api.validarReceta(receta.numeroReceta, { estado }).subscribe({
      next: (actualizada) => {
        this.procesando = false;
        const idx = this.recetas.findIndex(r => r.numeroReceta === actualizada.numeroReceta);
        if (idx >= 0) this.recetas[idx] = actualizada;
        if (this.sel?.numeroReceta === actualizada.numeroReceta) this.sel = actualizada;
      },
      error: (err) => {
        this.procesando = false;
        this.mensajeError = err?.error?.detail || 'No se pudo registrar la validación.';
      },
    });
  }
}
