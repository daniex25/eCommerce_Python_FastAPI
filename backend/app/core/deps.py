"""Dependencias de FastAPI para autenticación y control de acceso por rol.

`get_current_user` resuelve el usuario autenticado a partir del JWT enviado
en `Authorization: Bearer <token>`. `require_role(*roles)` se usa como
`Depends(require_role("Administrador", ...))` en los endpoints que deben
restringirse según el rol (RS0029).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decodificar_access_token
from app.db.database import get_db
from app.models.modelos_seguridad import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credenciales_invalidas

    payload = decodificar_access_token(token)
    if not payload or "sub" not in payload:
        raise credenciales_invalidas

    usuario = db.query(Usuario).filter(Usuario.codigoUsuario == int(payload["sub"])).first()
    if not usuario or not usuario.estado:
        raise credenciales_invalidas

    return usuario


def require_role(*roles_permitidos: str):
    def verificar(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta operación.",
            )
        return usuario

    return verificar
