from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# bcrypt trunca/rechaza contraseñas de más de 72 bytes; se limita aquí para
# devolver un 422 claro en vez de un error interno al hashear/verificar.
PasswordField = Field(min_length=6, max_length=72)

# Roles del sistema (actor 3.3.1 del documento de ingeniería). Se valida aquí
# como Literal, igual que el frontend valida su unión de tipos `Rol`.
RolUsuario = Literal[
    "Cliente",
    "Técnico de Farmacia",
    "Químico Farmacéutico",
    "Administrador",
    "Encargado de Almacén",
    "Repartidor",
    "Administrador del Sistema",
]


# ── Usuario ──────────────────────────────────────────────────────────────
class UsuarioBase(BaseModel):
    nombres: str
    correoElectronico: EmailStr
    rol: RolUsuario
    estado: Optional[bool] = True
    codigoCliente: Optional[int] = None


class UsuarioCreate(UsuarioBase):
    password: str = PasswordField


class UsuarioResponse(UsuarioBase):
    codigoUsuario: int
    fechaCreacion: Optional[datetime] = None
    ultimoAcceso: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ── Autenticación ────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    correoElectronico: EmailStr
    password: str = Field(max_length=72)


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    usuario: UsuarioResponse


class RecuperarPasswordRequest(BaseModel):
    correoElectronico: EmailStr


class RegistroClienteRequest(BaseModel):
    """CUS101 / RS5101 — alta pública de un Cliente con acceso a la tienda web."""

    nombres: str
    apellidos: str
    dni: str
    telefono: Optional[str] = None
    correoElectronico: EmailStr
    direccion: Optional[str] = None
    password: str = PasswordField


# ── Auditoría ────────────────────────────────────────────────────────────
class RegistroAuditoriaResponse(BaseModel):
    codigoRegistro: int
    codigoUsuario: Optional[int] = None
    correoUsuario: str
    accion: str
    entidad: Optional[str] = None
    entidadId: Optional[str] = None
    resultado: str
    detalle: Optional[str] = None
    fechaHora: datetime
    model_config = ConfigDict(from_attributes=True)
