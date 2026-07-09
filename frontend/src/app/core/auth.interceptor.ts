import { HttpInterceptorFn } from '@angular/common/http';
import { CLAVE_TOKEN } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Adjunta `Authorization: Bearer <token>` a cada request dirigido al
 * backend. Lee el token directo de localStorage (no inyecta AuthService):
 * el constructor de AuthService dispara una petición HTTP propia
 * (GET /auth/me) que pasaría por este mismo interceptor, e inyectar
 * AuthService aquí produciría una dependencia circular (NG0200).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(CLAVE_TOKEN);

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
