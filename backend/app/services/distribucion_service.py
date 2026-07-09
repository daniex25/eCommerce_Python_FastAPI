"""Lógica de negocio del dominio de distribución y entregas.

Concentrará la asignación de repartidor a un pedido (validando estado
"Pagado"/"Preparado" y horario de reparto 08:00-21:00, RN1201-1202), las
transiciones de estado de una entrega y el registro de incidencias de
entrega. No existe ningún router de distribución todavía. Se implementa en
la Fase 4 del plan de corrección.
"""
