"""Lógica de negocio del dominio de almacén e inventario.

Concentrará las reglas de trazabilidad farmacológica que hoy no existen en
`router_almacen.py`: recepción de mercadería (creación/actualización de
lotes y suma de stock), validación de vencimiento mínimo de lote (RN1301),
alertas de vencimiento próximo (FEFO) y ajustes de inventario con motivo
auditable. Se implementa en la Fase 3 del plan de corrección.
"""
