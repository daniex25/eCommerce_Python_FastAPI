"""Lógica de negocio del dominio de seguridad y autenticación.

Concentra la autenticación de usuarios contra la base de datos (incluyendo
el bloqueo temporal por intentos fallidos, CUS501 6.2) y el registro de
operaciones en la bitácora de auditoría (RS0034). El hash/verificación de
contraseñas y la emisión de JWT viven en `app.core.security`; las
dependencias de FastAPI que resuelven el usuario autenticado viven en
`app.core.deps`.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.modelos_seguridad import RegistroAuditoria, Usuario

MAX_INTENTOS_FALLIDOS = 3
VENTANA_BLOQUEO_MINUTOS = 15


def registrar_auditoria(
    db: Session,
    *,
    correo: str,
    accion: str,
    resultado: str,
    codigo_usuario: int | None = None,
    entidad: str | None = None,
    entidad_id: str | None = None,
    detalle: str | None = None,
) -> RegistroAuditoria:
    registro = RegistroAuditoria(
        codigoUsuario=codigo_usuario,
        correoUsuario=correo,
        accion=accion,
        entidad=entidad,
        entidadId=entidad_id,
        resultado=resultado,
        detalle=detalle,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro


def cuenta_bloqueada(db: Session, correo: str) -> bool:
    """CUS501 6.2 — bloqueo temporal tras superar los intentos fallidos permitidos."""
    desde = datetime.now(timezone.utc) - timedelta(minutes=VENTANA_BLOQUEO_MINUTOS)
    intentos_fallidos = (
        db.query(RegistroAuditoria)
        .filter(
            RegistroAuditoria.correoUsuario == correo,
            RegistroAuditoria.accion == "LOGIN",
            RegistroAuditoria.resultado == "Fallido",
            RegistroAuditoria.fechaHora >= desde,
        )
        .count()
    )
    return intentos_fallidos >= MAX_INTENTOS_FALLIDOS


def autenticar_usuario(db: Session, correo: str, password: str) -> tuple[Usuario | None, str]:
    """Valida credenciales (RS0033) y estado de la cuenta.

    Devuelve (usuario, resultado). `usuario` es None si la autenticación
    falla; `resultado` documenta la causa para la bitácora de auditoría.
    """
    if cuenta_bloqueada(db, correo):
        return None, "Bloqueado"

    usuario = db.query(Usuario).filter(Usuario.correoElectronico == correo).first()
    if not usuario or not verify_password(password, usuario.passwordHash):
        return None, "Fallido"

    if not usuario.estado:
        return None, "Inactivo"

    return usuario, "Exitoso"
