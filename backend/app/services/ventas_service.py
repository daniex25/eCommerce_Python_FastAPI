"""Lógica de negocio del dominio de ventas (E-commerce y POS).

Concentrará las reglas que hoy no existen en `router_ventas.py` más allá del
CRUD genérico: armado de pedido desde el carrito con descuento de stock por
lote (FEFO), validación de receta médica aprobada para productos "Bajo
Receta" (RN1101), cálculo de IGV, venta de mostrador y emisión de
comprobante. Se implementa en la Fase 2 del plan de corrección.
"""
