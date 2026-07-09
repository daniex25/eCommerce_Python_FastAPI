import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { ApiService, SesionResponse, UsuarioBackend, RegistroClienteRequest } from './api.service';

export type Rol =
  | 'Cliente'
  | 'Técnico de Farmacia'
  | 'Químico Farmacéutico'
  | 'Administrador'
  | 'Encargado de Almacén'
  | 'Repartidor'
  | 'Administrador del Sistema';

export type Grupo = 'Cliente' | 'Empleado' | 'Repartidor';

export interface Usuario {
  codigo: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estado: boolean;
  iniciales: string;
  codigoCliente: number | null;
}

export interface ResultadoLogin {
  ok: boolean;
  mensaje?: string;
  usuario?: Usuario;
  redirect?: string;
}

// Exportada para que `auth.interceptor.ts` lea el token directo de
// localStorage sin inyectar AuthService: inyectarlo ahí generaría una
// dependencia circular (NG0200), porque el propio constructor de
// AuthService dispara una petición HTTP (GET /auth/me) que pasa por ese
// interceptor mientras AuthService todavía se está construyendo.
export const CLAVE_TOKEN = 'botica_token';

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

function mapUsuario(u: UsuarioBackend): Usuario {
  return {
    codigo: u.codigoUsuario,
    nombre: u.nombres,
    correo: u.correoElectronico,
    rol: u.rol as Rol,
    estado: u.estado,
    iniciales: iniciales(u.nombres),
    codigoCliente: u.codigoCliente,
  };
}

// Decodifica el payload del JWT (base64url) solo para restaurar la sesión
// de forma optimista al recargar la página; la fuente de verdad sigue
// siendo el backend, validado a continuación vía GET /auth/me.
function decodificarPayload(token: string): { sub: string; correo: string; rol: string } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  usuarioActual = signal<Usuario | null>(null);
  private token: string | null = null;

  constructor() {
    const token = localStorage.getItem(CLAVE_TOKEN);
    if (!token) return;

    const payload = decodificarPayload(token);
    if (!payload) {
      localStorage.removeItem(CLAVE_TOKEN);
      return;
    }

    this.token = token;
    // Restauración optimista (evita parpadeo de "no autenticado" en el
    // primer render); se confirma/corrige de inmediato contra el backend.
    this.usuarioActual.set({
      codigo: +payload.sub,
      nombre: '',
      correo: payload.correo,
      rol: payload.rol as Rol,
      estado: true,
      iniciales: '',
      codigoCliente: null,
    });

    this.api.me().subscribe({
      next: (u) => this.usuarioActual.set(mapUsuario(u)),
      error: () => this.cerrarSesionLocal(),
    });
  }

  getToken(): string | null {
    return this.token;
  }

  login(correo: string, password: string): Observable<ResultadoLogin> {
    return this.api.login({ correoElectronico: correo, password }).pipe(
      tap((sesion) => this.guardarSesion(sesion)),
      map((sesion) => {
        const usuario = mapUsuario(sesion.usuario);
        return { ok: true, usuario, redirect: this.redirectPorRol(usuario.rol) } as ResultadoLogin;
      }),
      catchError((err) => of({ ok: false, mensaje: mensajeError(err) } as ResultadoLogin))
    );
  }

  registrarCliente(data: RegistroClienteRequest): Observable<ResultadoLogin> {
    return this.api.registrarCliente(data).pipe(
      tap((sesion) => this.guardarSesion(sesion)),
      map((sesion) => {
        const usuario = mapUsuario(sesion.usuario);
        return { ok: true, usuario, redirect: this.redirectPorRol(usuario.rol) } as ResultadoLogin;
      }),
      catchError((err) => of({ ok: false, mensaje: mensajeError(err) } as ResultadoLogin))
    );
  }

  recuperarPassword(correo: string): Observable<{ mensaje: string }> {
    return this.api.recuperarPassword(correo);
  }

  logout() {
    if (this.token) {
      this.api.logout().subscribe({ error: () => {} });
    }
    this.cerrarSesionLocal();
  }

  private guardarSesion(sesion: SesionResponse) {
    this.token = sesion.accessToken;
    localStorage.setItem(CLAVE_TOKEN, sesion.accessToken);
    this.usuarioActual.set(mapUsuario(sesion.usuario));
  }

  private cerrarSesionLocal() {
    this.token = null;
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuarioActual.set(null);
  }

  grupo(rol: Rol): Grupo {
    if (rol === 'Cliente') return 'Cliente';
    if (rol === 'Repartidor') return 'Repartidor';
    return 'Empleado';
  }

  // Redirección a la interfaz correspondiente al rol ([RS0029])
  redirectPorRol(rol: Rol): string {
    switch (rol) {
      case 'Cliente': return '/tienda/catalogo';
      case 'Técnico de Farmacia': return '/pos/venta';
      case 'Químico Farmacéutico': return '/atencion/recetas';
      case 'Encargado de Almacén': return '/almacen/inventario';
      case 'Administrador':
      case 'Administrador del Sistema': return '/admin/reportes';
      case 'Repartidor': return '/repartidor/entregas';
      default: return '/';
    }
  }
}

function mensajeError(err: any): string {
  return err?.error?.detail || 'No se pudo completar la operación. Inténtalo nuevamente.';
}
