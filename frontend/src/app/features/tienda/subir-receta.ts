import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { Producto, RecetaMedica } from '../../core/models';

@Component({
  selector: 'app-subir-receta',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="crumbs muted small mb"><a routerLink="/tienda/catalogo">Catálogo</a> › <b>Validar receta médica</b></div>

    @if (!producto) {
      <div class="card center muted" style="padding:3rem">Producto no encontrado. <a routerLink="/tienda/catalogo">Volver al catálogo</a></div>
    } @else {
      <div class="card receta-card">
        <h1>Receta médica para {{ producto.nombreProducto }}</h1>
        <p class="muted">Este producto es de <b>venta bajo receta médica</b>. Sube los datos y la imagen de tu receta para que el Químico Farmacéutico la valide antes de agregarlo al carrito.</p>

        @if (mensajeError) { <div class="notice notice-red mt"><i class="fa-solid fa-triangle-exclamation"></i> {{ mensajeError }}</div> }

        @if (receta && receta.estado === 'Aprobada') {
          <div class="notice notice-green mt">✓ Tu receta #{{ receta.numeroReceta }} fue aprobada por el Químico Farmacéutico.</div>
          <button class="btn btn-primary btn-lg mt" (click)="agregarAlCarrito()">
            <i class="fa-solid fa-cart-shopping"></i> Agregar al carrito
          </button>
        } @else if (receta && receta.estado === 'Rechazada') {
          <div class="notice notice-red mt">✕ Tu receta #{{ receta.numeroReceta }} fue rechazada. Verifica los datos y sube una nueva.</div>
          <button class="btn btn-outline mt" (click)="receta = undefined">Subir nueva receta</button>
        } @else if (receta && receta.estado === 'Pendiente') {
          <div class="notice notice-blue mt">
            Receta #{{ receta.numeroReceta }} enviada. Está en revisión por el Químico Farmacéutico.
          </div>
          <button class="btn btn-outline mt" [disabled]="verificando" (click)="verificarEstado()">
            {{ verificando ? 'Verificando…' : 'Verificar estado' }}
          </button>
        } @else {
          <form (ngSubmit)="enviar()">
            <div class="field mt"><label>Nombre del paciente</label><input class="inp" [(ngModel)]="nombrePaciente" name="nombrePaciente" required /></div>
            <div class="field"><label>Médico tratante</label><input class="inp" [(ngModel)]="medicoTratante" name="medicoTratante" required /></div>
            <div class="flex">
              <div class="field" style="flex:1"><label>Colegiatura del médico (CMP)</label><input class="inp" [(ngModel)]="cmpMedico" name="cmpMedico" placeholder="Opcional" /></div>
              <div class="field" style="flex:1"><label>Fecha de emisión</label><input class="inp" type="date" [(ngModel)]="fechaEmision" name="fechaEmision" required /></div>
            </div>
            <div class="field"><label>Imagen de la receta</label><input class="inp" type="file" accept="image/*,.pdf" (change)="onArchivo($event)" /></div>
            <button class="btn btn-primary btn-lg mt" type="submit" [disabled]="enviando">
              {{ enviando ? 'Enviando…' : 'Enviar receta para validación' }}
            </button>
          </form>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .receta-card { max-width:560px; margin:0 auto; }
    .receta-card h1 { font-size:1.3rem; margin-bottom:.5rem; }
  `],
})
export class SubirReceta {
  private data = inject(DataService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  producto?: Producto;
  receta?: RecetaMedica;
  archivo?: File;

  nombrePaciente = '';
  medicoTratante = '';
  cmpMedico = '';
  fechaEmision = new Date().toISOString().slice(0, 10);

  enviando = false;
  verificando = false;
  mensajeError = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.producto = this.data.getProducto(id);
    if (this.producto) this.buscarRecetaExistente(this.producto.codigoProducto);
  }

  private buscarRecetaExistente(codigoProducto: number) {
    this.api.getRecetas().subscribe({
      next: (recetas) => {
        const propias = recetas.filter(r => r.codigoProducto === codigoProducto);
        // Prioriza una aprobada; si no, la más reciente.
        this.receta = propias.find(r => r.estado === 'Aprobada') ?? propias.at(-1);
      },
      error: () => {},
    });
  }

  onArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.archivo = input.files?.[0];
  }

  enviar() {
    if (!this.producto || this.enviando) return;
    this.mensajeError = '';
    this.enviando = true;

    this.api.crearReceta({
      codigoProducto: this.producto.codigoProducto,
      nombrePaciente: this.nombrePaciente,
      medicoTratante: this.medicoTratante,
      cmpMedico: this.cmpMedico || undefined,
      fechaEmision: this.fechaEmision,
    }).subscribe({
      next: (receta) => {
        if (this.archivo) {
          this.api.subirImagenReceta(receta.numeroReceta, this.archivo).subscribe({
            next: (actualizada) => { this.receta = actualizada; this.enviando = false; },
            error: () => { this.receta = receta; this.enviando = false; },
          });
        } else {
          this.receta = receta;
          this.enviando = false;
        }
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError = err?.error?.detail || 'No se pudo registrar la receta. Inténtalo nuevamente.';
      },
    });
  }

  verificarEstado() {
    if (!this.receta || this.verificando) return;
    this.verificando = true;
    this.api.getReceta(this.receta.numeroReceta).subscribe({
      next: (receta) => { this.receta = receta; this.verificando = false; },
      error: () => { this.verificando = false; },
    });
  }

  agregarAlCarrito() {
    if (!this.producto || !this.receta) return;
    this.data.agregarAlCarrito(this.producto, 1, this.receta.numeroReceta);
    this.router.navigate(['/tienda/carrito']);
  }
}
