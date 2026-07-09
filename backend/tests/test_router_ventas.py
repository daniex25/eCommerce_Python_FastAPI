import pytest

# Rol autorizado representativo para cada listado, usado para verificar
# que el acceso concedido efectivamente responde 200 (ver router_ventas.py
# para el detalle completo de grupos de rol por endpoint).
LISTADOS_Y_ROL_AUTORIZADO = {
    "/clientes": "Administrador",
    "/carritos": "Cliente",
    "/pedidos": "Cliente",
    "/detalle-pedidos": "Cliente",
    "/recetas-medicas": "Cliente",
    "/repartidores": "Repartidor",
    "/entregas": "Repartidor",
    "/pagos": "Administrador",
    "/comprobantes": "Administrador",
}


@pytest.mark.parametrize("ruta", LISTADOS_Y_ROL_AUTORIZADO.keys())
def test_listado_sin_token_devuelve_401(client, ruta):
    respuesta = client.get(ruta)
    assert respuesta.status_code == 401


@pytest.mark.parametrize("ruta,rol", LISTADOS_Y_ROL_AUTORIZADO.items())
def test_listado_con_rol_autorizado_responde_200_con_lista(client, ruta, rol, headers_por_rol):
    respuesta = client.get(ruta, headers=headers_por_rol[rol])
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


@pytest.mark.parametrize("ruta", ["/clientes", "/pagos", "/comprobantes"])
def test_listado_financiero_o_personal_con_rol_cliente_devuelve_403(client, ruta, headers_por_rol):
    respuesta = client.get(ruta, headers=headers_por_rol["Cliente"])
    assert respuesta.status_code == 403
