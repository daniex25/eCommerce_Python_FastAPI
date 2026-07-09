"""Hashing de contraseñas y emisión/validación de JWT de sesión.

Implementa RS0033 (contraseñas cifradas) y sostiene RS0028/RS0029/RS0034
(credenciales únicas, control de acceso por rol, auditoría) para el resto
del módulo de seguridad.

Se usa `bcrypt` directamente (no `passlib`): las versiones recientes de
`bcrypt` (4+) retiraron el atributo `__about__` que `passlib.CryptContext`
necesita para su autodetección de backend, lo que rompe el hashing. Usar
la librería `bcrypt` sin la capa de compatibilidad de passlib evita ese
problema y sigue cumpliendo RS0033.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def crear_access_token(codigo_usuario: int, correo: str, rol: str) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(codigo_usuario),
        "correo": correo,
        "rol": rol,
        "exp": expira,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decodificar_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
