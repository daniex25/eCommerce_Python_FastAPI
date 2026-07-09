import pytest

LISTADOS_PUBLICOS = ["/categorias", "/laboratorios", "/productos"]
LISTADOS_PROTEGIDOS = ["/lotes"]


@pytest.mark.parametrize("ruta", LISTADOS_PUBLICOS)
def test_listado_publico_responde_200_con_lista(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


@pytest.mark.parametrize("ruta", LISTADOS_PROTEGIDOS)
def test_listado_protegido_sin_token_devuelve_401(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 401


@pytest.mark.parametrize("ruta", LISTADOS_PROTEGIDOS)
def test_listado_protegido_con_rol_almacen_responde_200(client, ruta, headers_por_rol):
    respuesta = client.get(ruta, headers=headers_por_rol["Encargado de Almacén"])
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


def test_crear_producto_sin_rol_almacen_devuelve_403(client, headers_por_rol):
    respuesta = client.post(
        "/productos",
        json={"nombreProducto": "Test", "codigoCategoria": 1, "codigoLaboratorio": 1},
        headers=headers_por_rol["Cliente"],
    )
    assert respuesta.status_code == 403
