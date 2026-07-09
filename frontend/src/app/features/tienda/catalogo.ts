import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Producto } from '../../core/models';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="cat-hero">
      <div>
        <h1>Catálogo de productos</h1>
        <p class="muted">Medicamentos, dispositivos, dermocosmética y más — entrega a domicilio en Huacho.</p>
      </div>
      <span class="badge badge-green">{{ filtrados().length }} productos</span>
    </div>

    <div class="cat-grid">
      <aside class="filtros card">
        <h3>Filtros</h3>
        <div class="field">
          <label>Buscar</label>
          <input class="inp" [(ngModel)]="q" placeholder="Nombre del producto…" />
        </div>
        <div class="field">
          <label>Categoría</label>
          <select class="inp" [(ngModel)]="cat">
            <option value="">Todas</option>
            @for (c of data.getCategorias(); track c.codigoCategoria) { <option [value]="c.nombre">{{ c.nombre }}</option> }
          </select>
        </div>
        <div class="field">
          <label>Laboratorio</label>
          <select class="inp" [(ngModel)]="lab">
            <option value="">Todos</option>
            @for (l of data.getLaboratorios(); track l.codigoLaboratorio) { <option [value]="l.nombre">{{ l.nombre }}</option> }
          </select>
        </div>
        <div class="field">
          <label>Precio máximo: S/ {{ precioMax }}</label>
          <input type="range" min="10" max="150" step="5" [(ngModel)]="precioMax" />
        </div>
        <button class="btn btn-outline btn-block btn-sm" (click)="limpiar()">Limpiar filtros</button>
      </aside>

      <section class="productos">
        @for (p of filtrados(); track p.codigoProducto) {
          <div class="prod card">
            <a [routerLink]="['/tienda/producto', p.codigoProducto]" class="prod-img"><i class="fa-solid {{ p.icono }}"></i></a>
            @if (p.condicionVenta === 'Bajo Receta') { <span class="receta badge badge-amber">Venta bajo receta</span> }
            <div class="prod-lab">{{ p.laboratorio }}</div>
            <a [routerLink]="['/tienda/producto', p.codigoProducto]" class="prod-name">{{ p.nombreProducto }}</a>
            <div class="prod-pres muted small">{{ p.presentacion }}</div>
            <div class="flex between mt">
              <span class="price">S/ {{ p.precioVenta.toFixed(2) }}</span>
              @if (p.stockDisponible > 0) { <span class="badge badge-green">Disponible</span> }
              @else { <span class="badge badge-red">Agotado</span> }
            </div>
            <button class="btn btn-primary btn-block mt" [disabled]="p.stockDisponible === 0" (click)="add(p)">
              {{ p.stockDisponible === 0 ? 'Sin stock' : '＋ Agregar al carrito' }}
            </button>
          </div>
        }
        @if (filtrados().length === 0) {
          <div class="card center muted" style="grid-column:1/-1; padding:3rem">No se encontraron productos con esos filtros.</div>
        }
      </section>
    </div>

    @if (toast) { <div class="toast">✓ {{ toast }}</div> }
  </div>
  `,
  styles: [`
    .cat-hero { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
    .cat-hero h1 { font-size:1.5rem; }
    .cat-grid { display:grid; grid-template-columns:240px 1fr; gap:1.25rem; align-items:start; }
    .filtros { position:sticky; top:80px; }
    .filtros h3 { margin-bottom:1rem; }
    .productos { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:1rem; }
    .prod { display:flex; flex-direction:column; position:relative; }
    .prod-img { display:block; font-size:2.6rem; text-align:center; background:var(--glass-bg-strong); border:1px solid var(--glass-border); color:var(--accent-blue); border-radius:10px; padding:1.1rem 0; margin-bottom:.6rem; }
    .receta { position:absolute; top:.65rem; right:.65rem; }
    .prod-lab { font-size:.72rem; color:var(--accent-blue); font-weight:700; text-transform:uppercase; }
    .prod-name { font-weight:700; font-size:.95rem; line-height:1.25; margin:.15rem 0; color:var(--text-primary); }
    .prod-name:hover { color:var(--accent-blue); }
    .toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); background:var(--accent-gradient); color:#fff; padding:.7rem 1.4rem; border-radius:999px; font-weight:600; box-shadow:var(--glow-blue); z-index:50; }
    @media (max-width:760px){ .cat-grid{ grid-template-columns:1fr; } .filtros{ position:static; } }
  `],
})
export class Catalogo {
  data = inject(DataService);
  q = '';
  cat = '';
  lab = '';
  precioMax = 150;
  toast = '';

  filtrados(): Producto[] {
    const q = this.q.toLowerCase();
    return this.data.getProductos().filter(p =>
      (!q || p.nombreProducto.toLowerCase().includes(q)) &&
      (!this.cat || p.categoria === this.cat) &&
      (!this.lab || p.laboratorio === this.lab) &&
      (p.precioVenta <= +this.precioMax));
  }

  add(p: Producto) {
    this.data.agregarAlCarrito(p);
    this.toast = `${p.nombreProducto} agregado al carrito`;
    setTimeout(() => this.toast = '', 1800);
  }

  limpiar() { this.q = ''; this.cat = ''; this.lab = ''; this.precioMax = 150; }
}
