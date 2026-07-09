import pytest

LISTADOS = ["/proveedores", "/ordenes-compra", "/detalle-ordenes-compra"]


@pytest.mark.parametrize("ruta", LISTADOS)
def test_listado_responde_200_con_lista(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)
