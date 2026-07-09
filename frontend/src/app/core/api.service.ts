import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Producto, Categoria, Laboratorio, Lote, Cliente, Pedido, 
  Repartidor, Entrega, RecetaMedica, Comprobante, Proveedor, 
  OrdenCompra, Reclamo, Cupon, MovimientoCaja, ProductoVendido,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── Productos ──
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }
  getProductosConFiltros(params: any): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`, { params });
  }

  // ── Categorías ──
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  // ── Laboratorios ──
  getLaboratorios(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`${this.apiUrl}/laboratorios`);
  }

  // ── Clientes ──
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  // ── Pedidos ──
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`);
  }
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }
  crearPedido(pedido: any): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/checkout`, pedido);
  }

  // ── Lotes ──
  getLotes(): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.apiUrl}/lotes`);
  }
  getLotesPorProducto(id: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.apiUrl}/productos/${id}/lotes`);
  }

  // ── Entregas ──
  getEntregas(): Observable<Entrega[]> {
    return this.http.get<Entrega[]>(`${this.apiUrl}/entregas`);
  }
  asignarEntrega(asignacion: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/entregas/asignar`, asignacion);
  }
  actualizarEstadoEntrega(id: number, estado: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/entregas/${id}/estado`, estado);
  }

  // ── Recetas ──
  getRecetas(): Observable<RecetaMedica[]> {
    return this.http.get<RecetaMedica[]>(`${this.apiUrl}/recetas-medicas`);
  }
  validarReceta(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/recetas-medicas/${id}/validar`, data);
  }

  // ── Reportes ──
  getReporteVentas(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/ventas`, { params });
  }
  getTopProductos(): Observable<ProductoVendido[]> {
    return this.http.get<ProductoVendido[]>(`${this.apiUrl}/reportes/top-productos`);
  }

  // ── Comprobantes ──
  emitirComprobante(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comprobantes/emitir`, data);
  }

  // ── Autenticación (CUS501/CUS101) ──
  login(credenciales: { correoElectronico: string; password: string }): Observable<SesionResponse> {
    return this.http.post<SesionResponse>(`${this.apiUrl}/auth/login`, credenciales);
  }
  registrarCliente(datos: RegistroClienteRequest): Observable<SesionResponse> {
    return this.http.post<SesionResponse>(`${this.apiUrl}/auth/registro-cliente`, datos);
  }
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {});
  }
  me(): Observable<UsuarioBackend> {
    return this.http.get<UsuarioBackend>(`${this.apiUrl}/auth/me`);
  }
  recuperarPassword(correoElectronico: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/auth/recuperar-password`, { correoElectronico });
  }
}

// ── Contratos de autenticación (alineados con schemas_seguridad.py) ──
export interface UsuarioBackend {
  codigoUsuario: number;
  nombres: string;
  correoElectronico: string;
  rol: string;
  estado: boolean;
  codigoCliente: number | null;
  fechaCreacion: string | null;
  ultimoAcceso: string | null;
}

export interface SesionResponse {
  accessToken: string;
  tokenType: string;
  usuario: UsuarioBackend;
}

export interface RegistroClienteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correoElectronico: string;
  direccion?: string;
  password: string;
}