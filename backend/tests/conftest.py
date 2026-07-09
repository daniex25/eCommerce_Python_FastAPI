import pytest
from fastapi.testclient import TestClient

from app.main import app

# Credenciales de las cuentas de demostración sembradas por `app.seed`
# (ver backend/app/seed.py — USUARIOS_DEMO). Los tests de autorización se
# apoyan en ellas en vez de crear usuarios ad-hoc, para que "python -m
# app.seed" sea el único punto de verdad de credenciales de prueba.
PASSWORD_DEMO = "123456"
CORREOS_POR_ROL = {
    "Cliente": "cliente@correo.com",
    "Técnico de Farmacia": "tecnico@boticacentral.pe",
    "Químico Farmacéutico": "quimico@boticacentral.pe",
    "Administrador": "admin@boticacentral.pe",
    "Encargado de Almacén": "almacen@boticacentral.pe",
    "Repartidor": "repartidor@boticacentral.pe",
}


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="session")
def token_por_rol(client: TestClient):
    """Autentica una vez por sesión de test contra cada cuenta demo y
    devuelve un dict {rol: access_token}."""
    tokens: dict[str, str] = {}
    for rol, correo in CORREOS_POR_ROL.items():
        respuesta = client.post(
            "/auth/login", json={"correoElectronico": correo, "password": PASSWORD_DEMO}
        )
        assert respuesta.status_code == 200, f"No se pudo autenticar '{correo}': {respuesta.text}"
        tokens[rol] = respuesta.json()["accessToken"]
    return tokens


@pytest.fixture(scope="session")
def headers_por_rol(token_por_rol: dict[str, str]):
    return {rol: {"Authorization": f"Bearer {token}"} for rol, token in token_por_rol.items()}
