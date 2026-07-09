"""Lógica de negocio del dominio de compras y proveedores.

Concentrará el flujo de aprobación de órdenes de compra, la recepción
parcial de mercadería (`DetalleOrdenCompra.cantidadRecibida`) y el cierre
de orden cuando se completa la recepción, hoy ausentes en
`router_compras.py` (CRUD genérico sin flujo). Se implementa en las
Fases 2-3 del plan de corrección.
"""
