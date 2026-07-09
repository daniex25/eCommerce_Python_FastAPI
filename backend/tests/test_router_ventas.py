import pytest

LISTADOS = [
    "/clientes",
    "/carritos",
    "/pedidos",
    "/detalle-pedidos",
    "/recetas-medicas",
    "/repartidores",
    "/entregas",
    "/pagos",
    "/comprobantes",
]


@pytest.mark.parametrize("ruta", LISTADOS)
def test_listado_responde_200_con_lista(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)
