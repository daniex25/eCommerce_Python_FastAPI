"""Fase 2 — Núcleo de Ventas y Catálogo (E-commerce + POS).

Corre contra la base de datos real y el seed de `app.seed`, igual que el
resto de la suite (ver `tests/test_router_auth.py`). Los checkouts exitosos
compran 1 unidad de productos con stock amplio (Paracetamol, Ibuprofeno,
Vitamina C) para no agotarlos entre corridas; los casos de "stock
insuficiente" piden una cantidad deliberadamente absurda en vez de depender
del stock restante exacto.
"""
import secrets

import pytest

from tests.conftest import PASSWORD_DEMO


def _codigo_producto(client, nombre: str) -> int:
    respuesta = client.get("/productos", params={"search": nombre})
    productos = respuesta.json()
    assert productos, f"No se encontró el producto '{nombre}' (¿se corrió `python -m app.seed`?)"
    return productos[0]["codigoProducto"]


def _registrar_cliente_de_prueba(client) -> str:
    sufijo = secrets.token_hex(4)
    respuesta = client.post(
        "/auth/registro-cliente",
        json={
            "nombres": "Cliente",
            "apellidos": "De Prueba Fase2",
            "dni": str(int(sufijo, 16))[:8].ljust(8, "0"),
            "correoElectronico": f"fase2.pytest.{sufijo}@correo.com",
            "password": PASSWORD_DEMO,
        },
    )
    assert respuesta.status_code == 201, respuesta.text
    return respuesta.json()["accessToken"]


# ── GET /productos (filtros) y GET /productos/{id}/lotes ───────────────────
def test_get_productos_filtro_search_por_nombre(client):
    respuesta = client.get("/productos", params={"search": "Paracetamol"})
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert datos
    assert all("paracetamol" in p["nombreProducto"].lower() for p in datos)


def test_get_productos_filtro_solo_disponibles_excluye_agotados(client):
    respuesta = client.get("/productos", params={"soloDisponibles": True})
    assert respuesta.status_code == 200
    assert all(p["stockDisponible"] > 0 for p in respuesta.json())


def test_get_lotes_de_producto_es_publico(client):
    codigo = _codigo_producto(client, "Paracetamol 500mg")
    respuesta = client.get(f"/productos/{codigo}/lotes")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


def test_get_lotes_de_producto_inexistente_devuelve_404(client):
    respuesta = client.get("/productos/999999/lotes")
    assert respuesta.status_code == 404


# ── POST /checkout (CUS105, RN1101) ─────────────────────────────────────────
class TestCheckout:
    def test_checkout_venta_libre_descuenta_stock_y_emite_comprobante(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Paracetamol 500mg")
        antes = client.get(f"/productos/{codigo}").json()["stockDisponible"]

        respuesta = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 1}],
                "direccionEntrega": "Av. Grau 521, Huacho",
                "distrito": "Huacho",
                "metodoPago": "Yape",
                "tipoComprobante": "Boleta",
            },
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 201, respuesta.text
        cuerpo = respuesta.json()
        assert cuerpo["pedido"]["estadoPedido"] == "Pagado"
        assert cuerpo["pago"]["estadoPago"] == "Aprobado"
        assert cuerpo["comprobante"]["estadoSunat"] == "Pendiente"
        assert cuerpo["comprobante"]["numeroComprobante"].startswith("B001-")
        assert len(cuerpo["pedido"]["detalle"]) == 1
        assert cuerpo["pedido"]["detalle"][0]["nombreProducto"] == "Paracetamol 500mg"
        # El total del pedido incluye envío; el comprobante no.
        assert cuerpo["pedido"]["montoTotal"] > cuerpo["comprobante"]["total"]

        despues = client.get(f"/productos/{codigo}").json()["stockDisponible"]
        assert despues == antes - 1

    def test_checkout_carrito_vacio_devuelve_422(self, client, headers_por_rol):
        respuesta = client.post(
            "/checkout",
            json={"items": [], "direccionEntrega": "x", "metodoPago": "Yape"},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 422

    def test_checkout_stock_insuficiente_devuelve_409(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Paracetamol 500mg")
        respuesta = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 999999}],
                "direccionEntrega": "x",
                "metodoPago": "Yape",
            },
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 409

    def test_checkout_producto_inexistente_devuelve_404(self, client, headers_por_rol):
        respuesta = client.post(
            "/checkout",
            json={"items": [{"codigoProducto": 999999, "cantidad": 1}], "direccionEntrega": "x", "metodoPago": "Yape"},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 404

    def test_checkout_producto_bajo_receta_sin_receta_devuelve_422(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        respuesta = client.post(
            "/checkout",
            json={"items": [{"codigoProducto": codigo, "cantidad": 1}], "direccionEntrega": "x", "metodoPago": "Yape"},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 422
        assert "receta" in respuesta.json()["detail"].lower()

    def test_checkout_requiere_rol_cliente(self, client, headers_por_rol):
        respuesta = client.post(
            "/checkout",
            json={"items": [{"codigoProducto": 1, "cantidad": 1}], "direccionEntrega": "x", "metodoPago": "Yape"},
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert respuesta.status_code == 403

    def test_checkout_con_receta_aprobada_permite_comprar_y_la_consume(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")

        receta = client.post(
            "/recetas-medicas",
            json={
                "codigoProducto": codigo,
                "nombrePaciente": "María Elena Quispe Huamán",
                "medicoTratante": "Dr. Hugo Ramírez Paz",
                "fechaEmision": "2026-07-01",
                "estado": "Aprobada",  # el backend debe ignorarlo: nace "Pendiente"
            },
            headers=headers_por_rol["Cliente"],
        )
        assert receta.status_code == 201, receta.text
        assert receta.json()["estado"] == "Pendiente"
        numero_receta = receta.json()["numeroReceta"]

        # Aún no aprobada: el checkout la rechaza (RN1101).
        rechazo = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 1, "numeroReceta": numero_receta}],
                "direccionEntrega": "x",
                "metodoPago": "Yape",
            },
            headers=headers_por_rol["Cliente"],
        )
        assert rechazo.status_code == 422

        aprobar = client.put(
            f"/recetas-medicas/{numero_receta}/validar",
            json={"estado": "Aprobada"},
            headers=headers_por_rol["Químico Farmacéutico"],
        )
        assert aprobar.status_code == 200
        assert aprobar.json()["estado"] == "Aprobada"

        # Una receta ya evaluada no se puede volver a validar.
        segunda_validacion = client.put(
            f"/recetas-medicas/{numero_receta}/validar",
            json={"estado": "Rechazada"},
            headers=headers_por_rol["Químico Farmacéutico"],
        )
        assert segunda_validacion.status_code == 409

        exito = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 1, "numeroReceta": numero_receta}],
                "direccionEntrega": "x",
                "metodoPago": "Yape",
            },
            headers=headers_por_rol["Cliente"],
        )
        assert exito.status_code == 201, exito.text

        # La receta ya está vinculada a un pedido: no se puede reutilizar.
        reuso = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 1, "numeroReceta": numero_receta}],
                "direccionEntrega": "x",
                "metodoPago": "Yape",
            },
            headers=headers_por_rol["Cliente"],
        )
        assert reuso.status_code == 409

    def test_validar_receta_requiere_rol_quimico_farmaceutico(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        receta = client.post(
            "/recetas-medicas",
            json={"codigoProducto": codigo, "nombrePaciente": "Test", "medicoTratante": "Dr. Test", "fechaEmision": "2026-07-01"},
            headers=headers_por_rol["Cliente"],
        ).json()
        respuesta = client.put(
            f"/recetas-medicas/{receta['numeroReceta']}/validar",
            json={"estado": "Aprobada"},
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert respuesta.status_code == 403


# ── Titularidad de Pedido/Comprobante (RS0028) ──────────────────────────────
class TestPropiedadPedidoYComprobante:
    def test_otro_cliente_no_puede_ver_pedido_ni_comprobante_ajeno(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Ibuprofeno 400mg")
        creado = client.post(
            "/checkout",
            json={"items": [{"codigoProducto": codigo, "cantidad": 1}], "direccionEntrega": "x", "metodoPago": "Tarjeta"},
            headers=headers_por_rol["Cliente"],
        )
        assert creado.status_code == 201, creado.text
        numero_pedido = creado.json()["pedido"]["numeroPedido"]
        numero_comprobante = creado.json()["comprobante"]["numeroComprobante"]

        otro_token = _registrar_cliente_de_prueba(client)
        otro_headers = {"Authorization": f"Bearer {otro_token}"}

        assert client.get(f"/pedidos/{numero_pedido}", headers=otro_headers).status_code == 404
        assert client.get(f"/comprobantes/{numero_comprobante}", headers=otro_headers).status_code == 404

        # El dueño y el personal administrativo sí pueden.
        propio = client.get(f"/pedidos/{numero_pedido}", headers=headers_por_rol["Cliente"])
        assert propio.status_code == 200
        assert len(propio.json()["detalle"]) == 1
        assert client.get(f"/pedidos/{numero_pedido}", headers=headers_por_rol["Administrador"]).status_code == 200

    def test_listado_de_pedidos_de_cliente_no_incluye_los_de_otros(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Ibuprofeno 400mg")
        creado = client.post(
            "/checkout",
            json={"items": [{"codigoProducto": codigo, "cantidad": 1}], "direccionEntrega": "x", "metodoPago": "Tarjeta"},
            headers=headers_por_rol["Cliente"],
        )
        numero_pedido = creado.json()["pedido"]["numeroPedido"]

        otro_token = _registrar_cliente_de_prueba(client)
        otro_headers = {"Authorization": f"Bearer {otro_token}"}

        numeros_del_otro = {p["numeroPedido"] for p in client.get("/pedidos", headers=otro_headers).json()}
        assert numero_pedido not in numeros_del_otro

        numeros_propios = {p["numeroPedido"] for p in client.get("/pedidos", headers=headers_por_rol["Cliente"]).json()}
        assert numero_pedido in numeros_propios

    def test_otro_cliente_no_ve_ni_puede_usar_receta_ajena(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        receta = client.post(
            "/recetas-medicas",
            json={"codigoProducto": codigo, "nombrePaciente": "Test", "medicoTratante": "Dr. Test", "fechaEmision": "2026-07-01"},
            headers=headers_por_rol["Cliente"],
        ).json()
        numero_receta = receta["numeroReceta"]
        client.put(f"/recetas-medicas/{numero_receta}/validar", json={"estado": "Aprobada"}, headers=headers_por_rol["Químico Farmacéutico"])

        otro_token = _registrar_cliente_de_prueba(client)
        otro_headers = {"Authorization": f"Bearer {otro_token}"}

        # No puede verla en su bandeja ni por id.
        assert receta not in client.get("/recetas-medicas", headers=otro_headers).json()
        assert client.get(f"/recetas-medicas/{numero_receta}", headers=otro_headers).status_code == 404

        # No puede comprar el producto usando la receta de otro cliente.
        respuesta = client.post(
            "/checkout",
            json={
                "items": [{"codigoProducto": codigo, "cantidad": 1, "numeroReceta": numero_receta}],
                "direccionEntrega": "x",
                "metodoPago": "Yape",
            },
            headers=otro_headers,
        )
        assert respuesta.status_code == 404


# ── POST /pos/venta y POST /comprobantes/emitir (CUS202/CUS203) ────────────
class TestPOS:
    def test_venta_pos_venta_libre_no_emite_comprobante_automaticamente(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Vitamina C 1000mg")
        respuesta = client.post(
            "/pos/venta",
            json={"items": [{"codigoProducto": codigo, "cantidad": 1}], "metodoPago": "Efectivo"},
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert respuesta.status_code == 201, respuesta.text
        cuerpo = respuesta.json()
        assert cuerpo["pedido"]["codigoCliente"] is None
        assert cuerpo["pago"]["estadoPago"] == "Aprobado"

        codigo_pago = cuerpo["pago"]["codigoPago"]
        emitido = client.post(
            "/comprobantes/emitir",
            json={
                "codigoPago": codigo_pago, "tipoComprobante": "Boleta",
                "documentoCliente": "45872136", "nombreCliente": "María Elena Quispe",
            },
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert emitido.status_code == 201, emitido.text
        assert emitido.json()["estadoSunat"] == "Pendiente"

        duplicado = client.post(
            "/comprobantes/emitir",
            json={"codigoPago": codigo_pago, "tipoComprobante": "Boleta"},
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert duplicado.status_code == 409

    def test_venta_pos_bajo_receta_sin_datos_de_receta_devuelve_422(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        respuesta = client.post(
            "/pos/venta",
            json={"items": [{"codigoProducto": codigo, "cantidad": 1}], "metodoPago": "Efectivo"},
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert respuesta.status_code == 422

    def test_venta_pos_bajo_receta_con_datos_inline_registra_receta_aprobada(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        respuesta = client.post(
            "/pos/venta",
            json={
                "items": [
                    {
                        "codigoProducto": codigo,
                        "cantidad": 1,
                        "receta": {
                            "nombrePaciente": "Juan Pérez",
                            "medicoTratante": "Dra. Ana Vega",
                            "cmpMedico": "CMP 1234",
                        },
                    }
                ],
                "metodoPago": "Efectivo",
            },
            headers=headers_por_rol["Técnico de Farmacia"],
        )
        assert respuesta.status_code == 201, respuesta.text

    def test_venta_pos_requiere_rol_staff(self, client, headers_por_rol):
        respuesta = client.post(
            "/pos/venta",
            json={"items": [{"codigoProducto": 1, "cantidad": 1}], "metodoPago": "Efectivo"},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 403


# ── POST /recetas-medicas/{numero}/imagen (CUS104) ──────────────────────────
class TestSubirImagenReceta:
    def _crear_receta(self, client, headers_por_rol):
        codigo = _codigo_producto(client, "Azitromicina 500mg")
        return client.post(
            "/recetas-medicas",
            json={
                "codigoProducto": codigo, "nombrePaciente": "Test", "medicoTratante": "Dr. Test",
                "fechaEmision": "2026-07-01",
            },
            headers=headers_por_rol["Cliente"],
        ).json()

    def test_subir_imagen_receta_actualiza_imagenUrl(self, client, headers_por_rol):
        receta = self._crear_receta(client, headers_por_rol)
        archivo = ("receta.png", b"contenido-binario-de-prueba", "image/png")
        respuesta = client.post(
            f"/recetas-medicas/{receta['numeroReceta']}/imagen",
            files={"archivo": archivo},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 200, respuesta.text
        assert respuesta.json()["imagenUrl"].startswith("/uploads/recetas/")

    def test_subir_imagen_receta_extension_no_admitida_devuelve_415(self, client, headers_por_rol):
        receta = self._crear_receta(client, headers_por_rol)
        archivo = ("receta.exe", b"contenido", "application/octet-stream")
        respuesta = client.post(
            f"/recetas-medicas/{receta['numeroReceta']}/imagen",
            files={"archivo": archivo},
            headers=headers_por_rol["Cliente"],
        )
        assert respuesta.status_code == 415
