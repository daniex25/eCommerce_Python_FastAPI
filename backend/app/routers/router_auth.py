import logging
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import crear_access_token, hash_password
from app.db.database import get_db
from app.models.modelos_seguridad import Usuario
from app.models.modelos_ventas import Cliente
from app.schemas.schemas_seguridad import (
    LoginRequest,
    RecuperarPasswordRequest,
    RegistroClienteRequest,
    TokenResponse,
    UsuarioResponse,
)
from app.services import seguridad_service

logger = logging.getLogger("app.auth")

router = APIRouter(prefix="/auth", tags=["Autenticación"])

MENSAJES_ERROR = {
    "Fallido": "Correo o contraseña incorrectos.",
    "Bloqueado": "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Inténtalo nuevamente en 15 minutos o restablece tu contraseña.",
    "Inactivo": "Tu cuenta se encuentra deshabilitada. Comunícate con el Administrador del Sistema.",
}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """CUS501 — Autenticar usuario. Registra cada intento en la bitácora (RS0034)."""
    usuario, resultado = seguridad_service.autenticar_usuario(db, data.correoElectronico, data.password)

    if not usuario:
        seguridad_service.registrar_auditoria(
            db, correo=data.correoElectronico, accion="LOGIN", resultado=resultado
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=MENSAJES_ERROR.get(resultado, "No se pudo iniciar sesión."),
        )

    usuario.ultimoAcceso = datetime.now(timezone.utc)
    db.commit()
    db.refresh(usuario)

    seguridad_service.registrar_auditoria(
        db,
        correo=usuario.correoElectronico,
        accion="LOGIN",
        resultado="Exitoso",
        codigo_usuario=usuario.codigoUsuario,
    )

    token = crear_access_token(usuario.codigoUsuario, usuario.correoElectronico, usuario.rol)
    return TokenResponse(accessToken=token, usuario=UsuarioResponse.model_validate(usuario))


@router.post("/registro-cliente", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registro_cliente(data: RegistroClienteRequest, db: Session = Depends(get_db)):
    """CUS101 / RS5101 — Registro de Cliente Web.

    Crea el `Cliente` (datos personales) y el `Usuario` (credenciales, rol
    Cliente) en una sola transacción, y devuelve una sesión ya autenticada.
    """
    existe = db.query(Usuario).filter(Usuario.correoElectronico == data.correoElectronico).first()
    if existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese correo ya está registrado.")

    cliente = Cliente(
        nombres=data.nombres,
        apellidos=data.apellidos,
        dni=data.dni,
        telefono=data.telefono,
        correoElectronico=data.correoElectronico,
        direccion=data.direccion,
        estado=True,
    )
    db.add(cliente)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El DNI o correo ya está registrado.")

    usuario = Usuario(
        nombres=f"{data.nombres} {data.apellidos}",
        correoElectronico=data.correoElectronico,
        passwordHash=hash_password(data.password),
        rol="Cliente",
        estado=True,
        codigoCliente=cliente.codigoCliente,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    seguridad_service.registrar_auditoria(
        db,
        correo=usuario.correoElectronico,
        accion="REGISTRO_CLIENTE",
        resultado="Exitoso",
        codigo_usuario=usuario.codigoUsuario,
    )

    token = crear_access_token(usuario.codigoUsuario, usuario.correoElectronico, usuario.rol)
    return TokenResponse(accessToken=token, usuario=UsuarioResponse.model_validate(usuario))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(usuario: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    seguridad_service.registrar_auditoria(
        db,
        correo=usuario.correoElectronico,
        accion="LOGOUT",
        resultado="Exitoso",
        codigo_usuario=usuario.codigoUsuario,
    )


@router.get("/me", response_model=UsuarioResponse)
def me(usuario: Usuario = Depends(get_current_user)):
    return usuario


@router.post("/recuperar-password", status_code=status.HTTP_202_ACCEPTED)
def recuperar_password(data: RecuperarPasswordRequest, db: Session = Depends(get_db)):
    """CUS501 6.4 / RS5103 — genera un token de restablecimiento.

    El envío real por correo queda pendiente de la Fase 6 (integración de
    correo, RS0026); mientras tanto el token se registra en la bitácora de
    auditoría para trazabilidad. La respuesta es siempre genérica para no
    revelar si el correo está registrado (RS0028, confidencialidad).
    """
    usuario = db.query(Usuario).filter(Usuario.correoElectronico == data.correoElectronico).first()
    if usuario:
        token_reset = secrets.token_urlsafe(32)
        logger.info("Token de restablecimiento para %s: %s", usuario.correoElectronico, token_reset)
        seguridad_service.registrar_auditoria(
            db,
            correo=usuario.correoElectronico,
            accion="RECUPERAR_PASSWORD",
            resultado="Exitoso",
            codigo_usuario=usuario.codigoUsuario,
            detalle="Token de restablecimiento generado (envío por correo pendiente de Fase 6).",
        )
    return {"mensaje": "Si el correo está registrado, se enviará un enlace de restablecimiento."}
