import pytest

LISTADOS = ["/proveedores", "/ordenes-compra", "/detalle-ordenes-compra"]


@pytest.mark.parametrize("ruta", LISTADOS)
def test_listado_sin_token_devuelve_401(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 401


@pytest.mark.parametrize("ruta", LISTADOS)
def test_listado_con_rol_almacen_responde_200_con_lista(client, ruta, headers_por_rol):
    respuesta = client.get(ruta, headers=headers_por_rol["Administrador"])
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


@pytest.mark.parametrize("ruta", LISTADOS)
def test_listado_con_rol_sin_permiso_devuelve_403(client, ruta, headers_por_rol):
    respuesta = client.get(ruta, headers=headers_por_rol["Cliente"])
    assert respuesta.status_code == 403
