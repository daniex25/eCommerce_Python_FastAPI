import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from './auth.service';

/**
 * Exige sesión iniciada; si la ruta declara `data: { roles: [...] }`,
 * exige además que el rol del usuario esté en esa lista (RS0029).
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const usuario = auth.usuarioActual();
  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data?.['roles'] as Rol[] | undefined;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
