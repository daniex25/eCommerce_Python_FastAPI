import secrets

from tests.conftest import PASSWORD_DEMO


def test_login_exitoso_devuelve_token_y_usuario(client):
    respuesta = client.post(
        "/auth/login",
        json={"correoElectronico": "admin@boticacentral.pe", "password": PASSWORD_DEMO},
    )
    assert respuesta.status_code == 200
    cuerpo = respuesta.json()
    assert cuerpo["accessToken"]
    assert cuerpo["usuario"]["rol"] == "Administrador"
    assert "passwordHash" not in cuerpo["usuario"]


def test_login_password_incorrecta_devuelve_401(client):
    respuesta = client.post(
        "/auth/login",
        json={"correoElectronico": "admin@boticacentral.pe", "password": "incorrecta"},
    )
    assert respuesta.status_code == 401


def test_login_usuario_inexistente_devuelve_401(client):
    respuesta = client.post(
        "/auth/login",
        json={"correoElectronico": "no-existe@correo.com", "password": PASSWORD_DEMO},
    )
    assert respuesta.status_code == 401


def test_login_usuario_inactivo_devuelve_401(client):
    respuesta = client.post(
        "/auth/login",
        json={"correoElectronico": "cesado@boticacentral.pe", "password": PASSWORD_DEMO},
    )
    assert respuesta.status_code == 401
    assert "deshabilitada" in respuesta.json()["detail"]


def test_me_sin_token_devuelve_401(client):
    respuesta = client.get("/auth/me")
    assert respuesta.status_code == 401


def test_me_con_token_devuelve_usuario_actual(client, headers_por_rol):
    respuesta = client.get("/auth/me", headers=headers_por_rol["Administrador"])
    assert respuesta.status_code == 200
    assert respuesta.json()["correoElectronico"] == "admin@boticacentral.pe"


def test_recuperar_password_responde_generico_exista_o_no_el_correo(client):
    r1 = client.post("/auth/recuperar-password", json={"correoElectronico": "admin@boticacentral.pe"})
    r2 = client.post("/auth/recuperar-password", json={"correoElectronico": "no-existe@correo.com"})
    assert r1.status_code == 202
    assert r2.status_code == 202
    assert r1.json() == r2.json()


def test_registro_cliente_crea_cuenta_y_devuelve_sesion(client):
    # Corre contra la base de datos real (sin rollback entre tests, igual
    # que el resto de la suite); se generan correo y DNI únicos por
    # ejecución para que el test se pueda repetir sin colisionar con datos
    # previos (ambos campos tienen restricción unique en `Cliente`).
    sufijo = secrets.token_hex(4)
    correo = f"cliente.pytest.{sufijo}@correo.com"
    dni = str(int(sufijo, 16))[:8].ljust(8, "0")
    respuesta = client.post(
        "/auth/registro-cliente",
        json={
            "nombres": "Cliente",
            "apellidos": "De Prueba",
            "dni": dni,
            "correoElectronico": correo,
            "password": PASSWORD_DEMO,
        },
    )
    assert respuesta.status_code == 201
    assert respuesta.json()["usuario"]["rol"] == "Cliente"

    duplicado = client.post(
        "/auth/registro-cliente",
        json={
            "nombres": "Cliente",
            "apellidos": "De Prueba",
            "dni": "87654321",
            "correoElectronico": correo,
            "password": PASSWORD_DEMO,
        },
    )
    assert duplicado.status_code == 400
