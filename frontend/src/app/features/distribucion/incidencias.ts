import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incidencias',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Gestión de incidencias de entrega</h1><div class="sub">Registro y seguimiento de problemas en el reparto</div></div>

    <div class="inc-grid">
      <div class="card">
        <h3>Registrar incidencia</h3>
        <div class="field"><label>Pedido</label><select class="inp"><option>#1044 — Rosa Isabel Flores</option><option>#1042 — María Elena Quispe</option></select></div>
        <div class="field"><label>Tipo de incidencia</label>
          <select class="inp" [(ngModel)]="tipo">
            <option>Cliente ausente</option><option>Dirección no encontrada</option><option>Producto dañado</option><option>Cliente rechaza pedido</option><option>Zona de difícil acceso</option>
          </select>
        </div>
        <div class="field"><label>Repartidor</label><input class="inp" value="Pedro Castillo Núñez" readonly /></div>
        <div class="field"><label>Detalle / observación</label><textarea class="inp" rows="3" [(ngModel)]="detalle" placeholder="Describe lo ocurrido…"></textarea></div>
        <div class="flex">
          <button class="btn btn-danger" (click)="registrar()">Registrar incidencia</button>
          <button class="btn btn-outline">Reprogramar entrega</button>
        </div>
        @if (ok) { <div class="notice notice-amber mt">⚠️ Incidencia registrada. El pedido pasó a estado <b>Incidencia</b> y se notificó a atención al cliente.</div> }
      </div>

      <div class="card card-pad-0">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Incidencias recientes</b></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>Pedido</th><th>Tipo</th><th>Repartidor</th><th>Estado</th></tr></thead>
            <tbody>
              <tr><td><b>#1038</b></td><td>Cliente ausente</td><td>Juan Mendoza</td><td><span class="badge badge-amber">Reprogramado</span></td></tr>
              <tr><td><b>#1031</b></td><td>Producto dañado</td><td>Pedro Castillo</td><td><span class="badge badge-blue">En atención</span></td></tr>
              <tr><td><b>#1025</b></td><td>Dirección no encontrada</td><td>Miguel Soto</td><td><span class="badge badge-green">Resuelto</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .inc-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; align-items:start; }
    @media (max-width:880px){ .inc-grid{ grid-template-columns:1fr; } }
  `],
})
export class Incidencias {
  tipo = 'Cliente ausente';
  detalle = '';
  ok = false;
  registrar() { this.ok = true; }
}
