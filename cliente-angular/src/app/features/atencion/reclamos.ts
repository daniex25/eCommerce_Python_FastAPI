import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-reclamos',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="page-header"><h1>Reclamos y atención al cliente</h1><div class="sub">Registro de consultas, reclamos y quejas (Libro de Reclamaciones)</div></div>

    <div class="stats mb">
      <div class="stat"><div class="label">Abiertos</div><div class="value" style="color:#dc2626">{{ porEstado('Abierto') }}</div></div>
      <div class="stat"><div class="label">En proceso</div><div class="value" style="color:#d97706">{{ porEstado('En Proceso') }}</div></div>
      <div class="stat"><div class="label">Resueltos</div><div class="value" style="color:#16a34a">{{ porEstado('Resuelto') }}</div></div>
      <div class="stat"><div class="label">Tiempo prom. resp.</div><div class="value">2.4 h</div></div>
    </div>

    <div class="rec-grid">
      <div class="card card-pad-0">
        <div style="padding:1rem 1.25rem; border-bottom:1px solid #f1f5f9"><b>Tickets de atención</b></div>
        <div class="table-wrap" style="border:none">
          <table class="tbl">
            <thead><tr><th>#</th><th>Cliente</th><th>Tipo</th><th>Asunto</th><th>Canal</th><th>Estado</th></tr></thead>
            <tbody>
              @for (r of data.reclamos; track r.codigo) {
                <tr>
                  <td><b>{{ r.codigo }}</b></td>
                  <td>{{ r.cliente }}<div class="muted small">{{ r.fecha }}</div></td>
                  <td>
                    @if (r.tipo==='Reclamo') { <span class="badge badge-red">Reclamo</span> }
                    @else if (r.tipo==='Queja') { <span class="badge badge-amber">Queja</span> }
                    @else { <span class="badge badge-blue">Consulta</span> }
                  </td>
                  <td>{{ r.asunto }}</td>
                  <td class="muted small">{{ r.canal }}</td>
                  <td>
                    @if (r.estado==='Abierto') { <span class="badge badge-red">Abierto</span> }
                    @else if (r.estado==='En Proceso') { <span class="badge badge-amber">En proceso</span> }
                    @else { <span class="badge badge-green">Resuelto</span> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <aside class="card">
        <h3>Nuevo ticket</h3>
        <div class="field"><label>Cliente</label><input class="inp" placeholder="Nombre o DNI" /></div>
        <div class="field"><label>Tipo</label><select class="inp"><option>Reclamo</option><option>Queja</option><option>Consulta</option></select></div>
        <div class="field"><label>Canal</label><select class="inp"><option>Web</option><option>WhatsApp</option><option>Teléfono</option><option>Presencial</option></select></div>
        <div class="field"><label>Asunto</label><textarea class="inp" rows="3" placeholder="Describe el caso…"></textarea></div>
        <button class="btn btn-primary btn-block" (click)="ok=true">Registrar ticket</button>
        @if (ok) { <div class="notice notice-green mt small">✓ Ticket registrado en el Libro de Reclamaciones.</div> }
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .rec-grid { display:grid; grid-template-columns:1fr 300px; gap:1.25rem; align-items:start; }
    @media (max-width:880px){ .rec-grid{ grid-template-columns:1fr; } }
  `],
})
export class Reclamos {
  data = inject(DataService);
  ok = false;
  porEstado(e: string) { return this.data.reclamos.filter(r => r.estado === e).length; }
}
