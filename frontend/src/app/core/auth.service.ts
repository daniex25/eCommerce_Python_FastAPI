import { Injectable, signal } from '@angular/core';

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
  password: string;        // solo demo (en backend iría cifrada — [RS0033])
  rol: Rol;
  estado: boolean;         // false = cuenta deshabilitada (empleado cesado)
  iniciales: string;
}

export interface ResultadoLogin {
  ok: boolean;
  tipo?: 'invalida' | 'bloqueada' | 'inactivo';
  mensaje?: string;
  usuario?: Usuario;
  redirect?: string;
}

export interface RegistroAuditoria {
  correo: string;
  fechaHora: string;
  resultado: 'Exitoso' | 'Fallido' | 'Bloqueado' | 'Inactivo';
}

const MAX_INTENTOS = 3;

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Usuarios de demostración (uno por rol) ──
  usuarios: Usuario[] = [
    { codigo: 1, nombre: 'María Elena Quispe', correo: 'cliente@correo.com', password: '123456', rol: 'Cliente', estado: true, iniciales: 'MQ' },
    { codigo: 2, nombre: 'Téc. José Pérez', correo: 'tecnico@boticacentral.pe', password: '123456', rol: 'Técnico de Farmacia', estado: true, iniciales: 'JP' },
    { codigo: 3, nombre: 'Q.F. Andrea Salinas', correo: 'quimico@boticacentral.pe', password: '123456', rol: 'Químico Farmacéutico', estado: true, iniciales: 'AS' },
    { codigo: 4, nombre: 'Carlos Mendoza', correo: 'admin@boticacentral.pe', password: '123456', rol: 'Administrador', estado: true, iniciales: 'CM' },
    { codigo: 5, nombre: 'Rosa Núñez', correo: 'almacen@boticacentral.pe', password: '123456', rol: 'Encargado de Almacén', estado: true, iniciales: 'RN' },
    { codigo: 6, nombre: 'Pedro Castillo', correo: 'repartidor@boticacentral.pe', password: '123456', rol: 'Repartidor', estado: true, iniciales: 'PC' },
    { codigo: 7, nombre: 'Luis Torres (cesado)', correo: 'cesado@boticacentral.pe', password: '123456', rol: 'Técnico de Farmacia', estado: false, iniciales: 'LT' },
  ];

  // Sesión activa
  usuarioActual = signal<Usuario | null>(null);

  // Intentos fallidos por correo (para bloqueo temporal — [6.2])
  private intentos = new Map<string, number>();

  // Bitácora de auditoría en memoria ([RS0034])
  auditoria: RegistroAuditoria[] = [];

  intentosRestantes(correo: string): number {
    return Math.max(0, MAX_INTENTOS - (this.intentos.get(correo.toLowerCase()) || 0));
  }

  login(correo: string, password: string): ResultadoLogin {
    const key = correo.trim().toLowerCase();
    const fallidos = this.intentos.get(key) || 0;

    // 6.2 — Cuenta bloqueada por intentos fallidos
    if (fallidos >= MAX_INTENTOS) {
      this.registrar(key, 'Bloqueado');
      return { ok: false, tipo: 'bloqueada', mensaje: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Inténtalo nuevamente en 15 minutos o restablece tu contraseña.' };
    }

    const usuario = this.usuarios.find(u => u.correo.toLowerCase() === key);

    // 6.1 — Credenciales inválidas (no existe o contraseña incorrecta)
    if (!usuario || usuario.password !== password) {
      const n = fallidos + 1;
      this.intentos.set(key, n);
      this.registrar(key, 'Fallido');
      if (n >= MAX_INTENTOS) {
        return { ok: false, tipo: 'bloqueada', mensaje: 'Cuenta bloqueada temporalmente por superar los intentos permitidos.' };
      }
      return { ok: false, tipo: 'invalida', mensaje: `Correo o contraseña incorrectos. Te queda(n) ${MAX_INTENTOS - n} intento(s).` };
    }

    // 6.3 — Usuario inactivo / deshabilitado
    if (!usuario.estado) {
      this.registrar(key, 'Inactivo');
      return { ok: false, tipo: 'inactivo', mensaje: 'Tu cuenta se encuentra deshabilitada. Comunícate con el Administrador del Sistema.' };
    }

    // Éxito — credenciales válidas
    this.intentos.delete(key);
    this.usuarioActual.set(usuario);
    this.registrar(key, 'Exitoso');
    return { ok: true, usuario, redirect: this.redirectPorRol(usuario.rol) };
  }

  logout() { this.usuarioActual.set(null); }

  grupo(rol: Rol): Grupo {
    if (rol === 'Cliente') return 'Cliente';
    if (rol === 'Repartidor') return 'Repartidor';
    return 'Empleado';
  }

  // 5.x — Redirección a la interfaz correspondiente al rol ([RS0029])
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

  private registrar(correo: string, resultado: RegistroAuditoria['resultado']) {
    this.auditoria.unshift({ correo, resultado, fechaHora: new Date().toLocaleString('es-PE') });
  }
}
