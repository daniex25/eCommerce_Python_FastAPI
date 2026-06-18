import { Injectable, signal, computed } from '@angular/core';
import {
  Producto, Categoria, Laboratorio, Lote, Cliente, Pedido, Repartidor, Entrega,
  RecetaMedica, Comprobante, Proveedor, OrdenCompra, ItemCarrito, Reclamo, Cupon,
  MovimientoCaja, ProductoVendido,
} from './models';

export const IGV_RATE = 0.18;

@Injectable({ providedIn: 'root' })
export class DataService {

  categorias: Categoria[] = [
    { codigoCategoria: 1, nombre: 'Medicamentos', descripcion: 'De marca y genéricos' },
    { codigoCategoria: 2, nombre: 'Dispositivos Médicos', descripcion: 'Equipos y dispositivos' },
    { codigoCategoria: 3, nombre: 'Dermocosmética', descripcion: 'Cuidado de la piel' },
    { codigoCategoria: 4, nombre: 'Infantil', descripcion: 'Productos para bebés y niños' },
    { codigoCategoria: 5, nombre: 'Vitaminas y Suplementos', descripcion: 'Bienestar y nutrición' },
    { codigoCategoria: 6, nombre: 'Bioseguridad e Higiene', descripcion: 'Protección y limpieza' },
  ];

  laboratorios: Laboratorio[] = [
    { codigoLaboratorio: 1, nombre: 'Bayer', pais: 'Alemania' },
    { codigoLaboratorio: 2, nombre: 'Pfizer', pais: 'Estados Unidos' },
    { codigoLaboratorio: 3, nombre: 'Genfar', pais: 'Colombia' },
    { codigoLaboratorio: 4, nombre: 'Medifarma', pais: 'Perú' },
    { codigoLaboratorio: 5, nombre: 'Roche', pais: 'Suiza' },
    { codigoLaboratorio: 6, nombre: 'Hersil', pais: 'Perú' },
    { codigoLaboratorio: 7, nombre: 'La Roche-Posay', pais: 'Francia' },
    { codigoLaboratorio: 8, nombre: 'Abbott', pais: 'Estados Unidos' },
  ];

  productos: Producto[] = [
    { codigoProducto: 1, codigoCategoria: 1, codigoLaboratorio: 4, nombreProducto: 'Paracetamol 500mg', descripcion: 'Analgésico y antipirético. Caja x 100 tabletas.', precioVenta: 8.50, condicionVenta: 'Venta Libre', stockDisponible: 320, categoria: 'Medicamentos', laboratorio: 'Medifarma', presentacion: 'Caja x 100 tab', stockMinimo: 50, imagen: '💊' },
    { codigoProducto: 2, codigoCategoria: 1, codigoLaboratorio: 1, nombreProducto: 'Aspirina 100mg', descripcion: 'Ácido acetilsalicílico. Prevención cardiovascular.', precioVenta: 12.90, condicionVenta: 'Venta Libre', stockDisponible: 145, categoria: 'Medicamentos', laboratorio: 'Bayer', presentacion: 'Caja x 30 tab', stockMinimo: 40, imagen: '💊' },
    { codigoProducto: 3, codigoCategoria: 1, codigoLaboratorio: 3, nombreProducto: 'Amoxicilina 500mg', descripcion: 'Antibiótico de amplio espectro.', precioVenta: 18.00, condicionVenta: 'Bajo Receta', stockDisponible: 0, categoria: 'Medicamentos', laboratorio: 'Genfar', presentacion: 'Caja x 21 cáps', stockMinimo: 30, imagen: '💊' },
    { codigoProducto: 4, codigoCategoria: 1, codigoLaboratorio: 2, nombreProducto: 'Azitromicina 500mg', descripcion: 'Antibiótico macrólido.', precioVenta: 24.50, condicionVenta: 'Bajo Receta', stockDisponible: 62, categoria: 'Medicamentos', laboratorio: 'Pfizer', presentacion: 'Caja x 3 tab', stockMinimo: 25, imagen: '💊' },
    { codigoProducto: 5, codigoCategoria: 1, codigoLaboratorio: 6, nombreProducto: 'Ibuprofeno 400mg', descripcion: 'Antiinflamatorio no esteroideo.', precioVenta: 9.90, condicionVenta: 'Venta Libre', stockDisponible: 210, categoria: 'Medicamentos', laboratorio: 'Hersil', presentacion: 'Caja x 100 tab', stockMinimo: 50, imagen: '💊' },
    { codigoProducto: 6, codigoCategoria: 2, codigoLaboratorio: 8, nombreProducto: 'Termómetro Digital', descripcion: 'Medición rápida y precisa. Punta flexible.', precioVenta: 25.90, condicionVenta: 'Venta Libre', stockDisponible: 48, categoria: 'Dispositivos Médicos', laboratorio: 'Abbott', presentacion: 'Unidad', stockMinimo: 15, imagen: '🌡️' },
    { codigoProducto: 7, codigoCategoria: 2, codigoLaboratorio: 8, nombreProducto: 'Tensiómetro Digital de Brazo', descripcion: 'Monitor de presión arterial automático.', precioVenta: 129.00, condicionVenta: 'Venta Libre', stockDisponible: 12, categoria: 'Dispositivos Médicos', laboratorio: 'Abbott', presentacion: 'Unidad', stockMinimo: 5, imagen: '🩺' },
    { codigoProducto: 8, codigoCategoria: 2, codigoLaboratorio: 8, nombreProducto: 'Glucómetro Accu-Chek', descripcion: 'Medidor de glucosa en sangre con 10 tiras.', precioVenta: 89.90, condicionVenta: 'Venta Libre', stockDisponible: 9, categoria: 'Dispositivos Médicos', laboratorio: 'Roche', presentacion: 'Kit', stockMinimo: 8, imagen: '🩸' },
    { codigoProducto: 9, codigoCategoria: 3, codigoLaboratorio: 7, nombreProducto: 'Protector Solar FPS 50+', descripcion: 'Anthelios. Protección alta para rostro.', precioVenta: 68.00, condicionVenta: 'Venta Libre', stockDisponible: 35, categoria: 'Dermocosmética', laboratorio: 'La Roche-Posay', presentacion: 'Frasco 50ml', stockMinimo: 10, imagen: '🧴' },
    { codigoProducto: 10, codigoCategoria: 3, codigoLaboratorio: 7, nombreProducto: 'Gel Limpiador Facial', descripcion: 'Effaclar. Piel grasa y con tendencia acneica.', precioVenta: 54.50, condicionVenta: 'Venta Libre', stockDisponible: 28, categoria: 'Dermocosmética', laboratorio: 'La Roche-Posay', presentacion: 'Frasco 200ml', stockMinimo: 10, imagen: '🧴' },
    { codigoProducto: 11, codigoCategoria: 4, codigoLaboratorio: 4, nombreProducto: 'Pañales Etapa 3 x40', descripcion: 'Hipoalergénicos, 6 a 10 kg.', precioVenta: 42.90, condicionVenta: 'Venta Libre', stockDisponible: 60, categoria: 'Infantil', laboratorio: 'Medifarma', presentacion: 'Paquete x 40', stockMinimo: 20, imagen: '👶' },
    { codigoProducto: 12, codigoCategoria: 4, codigoLaboratorio: 6, nombreProducto: 'Suero Fisiológico Bebé', descripcion: 'Solución para higiene nasal infantil.', precioVenta: 14.50, condicionVenta: 'Venta Libre', stockDisponible: 90, categoria: 'Infantil', laboratorio: 'Hersil', presentacion: 'Caja x 20 amp', stockMinimo: 25, imagen: '👶' },
    { codigoProducto: 13, codigoCategoria: 5, codigoLaboratorio: 2, nombreProducto: 'Vitamina C 1000mg', descripcion: 'Refuerzo del sistema inmune. Efervescente.', precioVenta: 29.90, condicionVenta: 'Venta Libre', stockDisponible: 110, categoria: 'Vitaminas y Suplementos', laboratorio: 'Pfizer', presentacion: 'Tubo x 20 tab', stockMinimo: 30, imagen: '🍊' },
    { codigoProducto: 14, codigoCategoria: 5, codigoLaboratorio: 5, nombreProducto: 'Vitamina D3 2000 UI', descripcion: 'Salud ósea e inmunológica.', precioVenta: 38.50, condicionVenta: 'Venta Libre', stockDisponible: 24, categoria: 'Vitaminas y Suplementos', laboratorio: 'Roche', presentacion: 'Frasco x 60 cáps', stockMinimo: 15, imagen: '☀️' },
    { codigoProducto: 15, codigoCategoria: 5, codigoLaboratorio: 6, nombreProducto: 'Colágeno Hidrolizado', descripcion: 'Con magnesio y vitamina C. Sabor frutos rojos.', precioVenta: 75.00, condicionVenta: 'Venta Libre', stockDisponible: 18, categoria: 'Vitaminas y Suplementos', laboratorio: 'Hersil', presentacion: 'Pote 300g', stockMinimo: 10, imagen: '💪' },
    { codigoProducto: 16, codigoCategoria: 6, codigoLaboratorio: 4, nombreProducto: 'Alcohol en Gel 1L', descripcion: 'Antibacterial 70°. Dispensador.', precioVenta: 16.90, condicionVenta: 'Venta Libre', stockDisponible: 140, categoria: 'Bioseguridad e Higiene', laboratorio: 'Medifarma', presentacion: 'Botella 1L', stockMinimo: 40, imagen: '🧼' },
    { codigoProducto: 17, codigoCategoria: 6, codigoLaboratorio: 4, nombreProducto: 'Mascarillas KN95 x10', descripcion: 'Protección respiratoria, 5 capas.', precioVenta: 19.90, condicionVenta: 'Venta Libre', stockDisponible: 4, categoria: 'Bioseguridad e Higiene', laboratorio: 'Medifarma', presentacion: 'Caja x 10', stockMinimo: 30, imagen: '😷' },
    { codigoProducto: 18, codigoCategoria: 1, codigoLaboratorio: 3, nombreProducto: 'Loratadina 10mg', descripcion: 'Antihistamínico para alergias.', precioVenta: 7.50, condicionVenta: 'Venta Libre', stockDisponible: 175, categoria: 'Medicamentos', laboratorio: 'Genfar', presentacion: 'Caja x 10 tab', stockMinimo: 40, imagen: '💊' },
  ];

  lotes: Lote[] = [
    { codigoLote: 1, codigoProducto: 1, numeroLote: 'PARA-2024-A18', fechaVencimiento: '2027-03-15', stockDisponible: 200, estado: 'Vigente', producto: 'Paracetamol 500mg' },
    { codigoLote: 2, codigoProducto: 1, numeroLote: 'PARA-2024-A19', fechaVencimiento: '2026-08-20', stockDisponible: 120, estado: 'Vigente', producto: 'Paracetamol 500mg' },
    { codigoLote: 3, codigoProducto: 4, numeroLote: 'AZIT-2023-C07', fechaVencimiento: '2026-07-30', stockDisponible: 62, estado: 'Por Vencer', producto: 'Azitromicina 500mg' },
    { codigoLote: 4, codigoProducto: 13, numeroLote: 'VITC-2024-K22', fechaVencimiento: '2026-09-05', stockDisponible: 110, estado: 'Por Vencer', producto: 'Vitamina C 1000mg' },
    { codigoLote: 5, codigoProducto: 5, numeroLote: 'IBUP-2023-B11', fechaVencimiento: '2025-12-01', stockDisponible: 30, estado: 'Por Vencer', producto: 'Ibuprofeno 400mg' },
    { codigoLote: 6, codigoProducto: 12, numeroLote: 'SUER-2022-H03', fechaVencimiento: '2025-05-10', stockDisponible: 0, estado: 'Vencido', producto: 'Suero Fisiológico Bebé' },
    { codigoLote: 7, codigoProducto: 9, numeroLote: 'PROT-2024-L09', fechaVencimiento: '2027-01-18', stockDisponible: 35, estado: 'Vigente', producto: 'Protector Solar FPS 50+' },
    { codigoLote: 8, codigoProducto: 2, numeroLote: 'ASPI-2023-A45', fechaVencimiento: '2026-08-28', stockDisponible: 45, estado: 'Por Vencer', producto: 'Aspirina 100mg' },
  ];

  clientes: Cliente[] = [
    { codigoCliente: 1, nombres: 'María Elena', apellidos: 'Quispe Huamán', dni: '45872136', telefono: '987654321', correoElectronico: 'maria.quispe@gmail.com', direccion: 'Av. Grau 521', estado: true },
    { codigoCliente: 2, nombres: 'José Carlos', apellidos: 'Ramírez Torres', dni: '40258741', telefono: '956321478', correoElectronico: 'jcramirez@hotmail.com', direccion: 'Jr. San Martín 188', estado: true },
    { codigoCliente: 3, nombres: 'Rosa Isabel', apellidos: 'Flores Cárdenas', dni: '72145896', telefono: '912458736', correoElectronico: 'rosa.flores@gmail.com', direccion: 'Calle Lima 340', estado: true },
    { codigoCliente: 4, nombres: 'Luis Alberto', apellidos: 'Vargas Mendoza', dni: '08741259', telefono: '998745123', correoElectronico: 'lvargas@outlook.com', direccion: 'Av. 28 de Julio 712', estado: true },
    { codigoCliente: 5, nombres: 'Carmen Rosa', apellidos: 'Díaz Salazar', dni: '46987325', telefono: '945781236', correoElectronico: 'carmen.diaz@gmail.com', direccion: 'Urb. Santa Rosa Mz B Lt 14', estado: true },
  ];

  repartidores: Repartidor[] = [
    { codigoRepartidor: 1, nombre: 'Pedro Castillo Núñez', telefono: '987112233', estado: true, vehiculo: 'Moto · ABC-123', pedidosAsignados: 2 },
    { codigoRepartidor: 2, nombre: 'Juan Mendoza Ríos', telefono: '987445566', estado: true, vehiculo: 'Moto · DEF-456', pedidosAsignados: 1 },
    { codigoRepartidor: 3, nombre: 'Miguel Ángel Soto', telefono: '987778899', estado: false, vehiculo: 'Moto · GHI-789', pedidosAsignados: 3 },
  ];

  pedidos: Pedido[] = [
    { numeroPedido: 1042, codigoCliente: 1, cliente: 'María Elena Quispe', fechaPedido: '2026-06-18', estadoPedido: 'Pagado', montoTotal: 64.40, direccionEntrega: 'Av. Grau 521', distrito: 'Huacho', metodoPago: 'Yape',
      detalle: [ { codigoProducto: 1, nombreProducto: 'Paracetamol 500mg', cantidad: 2, precioUnitario: 8.50, subtotal: 17.00 }, { codigoProducto: 13, nombreProducto: 'Vitamina C 1000mg', cantidad: 1, precioUnitario: 29.90, subtotal: 29.90 }, { codigoProducto: 16, nombreProducto: 'Alcohol en Gel 1L', cantidad: 1, precioUnitario: 16.90, subtotal: 16.90 } ] },
    { numeroPedido: 1043, codigoCliente: 2, cliente: 'José Carlos Ramírez', fechaPedido: '2026-06-18', estadoPedido: 'Preparado', montoTotal: 129.00, direccionEntrega: 'Jr. San Martín 188', distrito: 'Huacho', metodoPago: 'Tarjeta',
      detalle: [ { codigoProducto: 7, nombreProducto: 'Tensiómetro Digital de Brazo', cantidad: 1, precioUnitario: 129.00, subtotal: 129.00 } ] },
    { numeroPedido: 1044, codigoCliente: 3, cliente: 'Rosa Isabel Flores', fechaPedido: '2026-06-18', estadoPedido: 'En Ruta', montoTotal: 88.40, direccionEntrega: 'Calle Lima 340', distrito: 'Hualmay', metodoPago: 'PagoEfectivo',
      detalle: [ { codigoProducto: 9, nombreProducto: 'Protector Solar FPS 50+', cantidad: 1, precioUnitario: 68.00, subtotal: 68.00 }, { codigoProducto: 18, nombreProducto: 'Loratadina 10mg', cantidad: 1, precioUnitario: 7.50, subtotal: 7.50 } ] },
    { numeroPedido: 1045, codigoCliente: 4, cliente: 'Luis Alberto Vargas', fechaPedido: '2026-06-17', estadoPedido: 'Entregado', montoTotal: 42.90, direccionEntrega: 'Av. 28 de Julio 712', distrito: 'Huacho', metodoPago: 'Yape',
      detalle: [ { codigoProducto: 11, nombreProducto: 'Pañales Etapa 3 x40', cantidad: 1, precioUnitario: 42.90, subtotal: 42.90 } ] },
    { numeroPedido: 1046, codigoCliente: 5, cliente: 'Carmen Rosa Díaz', fechaPedido: '2026-06-18', estadoPedido: 'Pagado', montoTotal: 113.50, direccionEntrega: 'Urb. Santa Rosa Mz B Lt 14', distrito: 'Santa María', metodoPago: 'Tarjeta',
      detalle: [ { codigoProducto: 15, nombreProducto: 'Colágeno Hidrolizado', cantidad: 1, precioUnitario: 75.00, subtotal: 75.00 }, { codigoProducto: 14, nombreProducto: 'Vitamina D3 2000 UI', cantidad: 1, precioUnitario: 38.50, subtotal: 38.50 } ] },
    { numeroPedido: 1041, codigoCliente: 1, cliente: 'María Elena Quispe', fechaPedido: '2026-06-10', estadoPedido: 'Entregado', montoTotal: 25.90, direccionEntrega: 'Av. Grau 521', distrito: 'Huacho', metodoPago: 'Efectivo',
      detalle: [ { codigoProducto: 6, nombreProducto: 'Termómetro Digital', cantidad: 1, precioUnitario: 25.90, subtotal: 25.90 } ] },
  ];

  entregas: Entrega[] = [
    { codigoEntrega: 1, numeroPedido: 1044, codigoRepartidor: 1, repartidor: 'Pedro Castillo', cliente: 'Rosa Isabel Flores', direccionEntrega: 'Calle Lima 340', distrito: 'Hualmay', estadoEntrega: 'En Ruta', fechaEntrega: '2026-06-18' },
    { codigoEntrega: 2, numeroPedido: 1042, codigoRepartidor: 1, repartidor: 'Pedro Castillo', cliente: 'María Elena Quispe', direccionEntrega: 'Av. Grau 521', distrito: 'Huacho', estadoEntrega: 'Asignado', fechaEntrega: '2026-06-18' },
    { codigoEntrega: 3, numeroPedido: 1043, codigoRepartidor: 2, repartidor: 'Juan Mendoza', cliente: 'José Carlos Ramírez', direccionEntrega: 'Jr. San Martín 188', distrito: 'Huacho', estadoEntrega: 'Asignado', fechaEntrega: '2026-06-18' },
    { codigoEntrega: 4, numeroPedido: 1046, cliente: 'Carmen Rosa Díaz', direccionEntrega: 'Urb. Santa Rosa Mz B Lt 14', distrito: 'Santa María', estadoEntrega: 'Por Asignar' },
  ];

  recetas: RecetaMedica[] = [
    { numeroReceta: 501, numeroPedido: 1047, nombrePaciente: 'María Elena Quispe Huamán', medicoTratante: 'Dr. Hugo Ramírez Paz', cmp: 'CMP 45821', fechaEmision: '2026-06-17', estado: 'Pendiente', producto: 'Amoxicilina 500mg x21', imagen: '📄' },
    { numeroReceta: 502, numeroPedido: 1048, nombrePaciente: 'José Carlos Ramírez Torres', medicoTratante: 'Dra. Ana Lucía Vega', cmp: 'CMP 38112', fechaEmision: '2026-06-18', estado: 'Pendiente', producto: 'Azitromicina 500mg x3', imagen: '📄' },
    { numeroReceta: 503, numeroPedido: 1049, nombrePaciente: 'Carmen Rosa Díaz Salazar', medicoTratante: 'Dr. Hugo Ramírez Paz', cmp: 'CMP 45821', fechaEmision: '2026-06-16', estado: 'Aprobada', producto: 'Amoxicilina 500mg x21', imagen: '📄' },
    { numeroReceta: 500, numeroPedido: 1040, nombrePaciente: 'Luis Alberto Vargas Mendoza', medicoTratante: 'Dr. Pablo Ñañez', cmp: 'CMP 51200', fechaEmision: '2026-06-12', estado: 'Rechazada', producto: 'Receta ilegible', imagen: '📄' },
  ];

  comprobantes: Comprobante[] = [
    { numeroComprobante: 'B001-00004521', codigoPago: 1, tipoComprobante: 'Boleta', fechaEmision: '2026-06-18', subtotal: 54.58, igv: 9.82, total: 64.40, documentoCliente: '45872136', nombreCliente: 'María Elena Quispe Huamán', estadoSunat: 'Aceptado' },
    { numeroComprobante: 'F001-00000218', codigoPago: 2, tipoComprobante: 'Factura', fechaEmision: '2026-06-18', subtotal: 109.32, igv: 19.68, total: 129.00, documentoCliente: '20512345678', nombreCliente: 'Clínica San Pablo S.A.C.', estadoSunat: 'Aceptado' },
    { numeroComprobante: 'B001-00004520', codigoPago: 3, tipoComprobante: 'Boleta', fechaEmision: '2026-06-17', subtotal: 36.36, igv: 6.54, total: 42.90, documentoCliente: '08741259', nombreCliente: 'Luis Alberto Vargas Mendoza', estadoSunat: 'Aceptado' },
  ];

  proveedores: Proveedor[] = [
    { rucProveedor: '20100128056', razonSocial: 'Distribuidora Drokasa S.A.', direccion: 'Av. Argentina 2415, Lima', telefono: '014561200', correoElectronico: 'ventas@drokasa.com.pe' },
    { rucProveedor: '20418108151', razonSocial: 'Química Suiza Comercial S.A.', direccion: 'Av. República de Panamá 2461', telefono: '014119000', correoElectronico: 'contacto@quimicasuiza.com' },
    { rucProveedor: '20512655305', razonSocial: 'Perufarma S.A.', direccion: 'Av. Los Frutales 220, Ate', telefono: '013171800', correoElectronico: 'pedidos@perufarma.com.pe' },
  ];

  ordenes: OrdenCompra[] = [
    { numeroOrden: 3201, rucProveedor: '20100128056', proveedor: 'Distribuidora Drokasa S.A.', fechaEmision: '2026-06-15', montoTotal: 1840.00, estado: 'Pendiente',
      detalle: [ { codigoProducto: 1, nombreProducto: 'Paracetamol 500mg', cantidad: 100, precioUnitario: 6.20, subtotal: 620.00 }, { codigoProducto: 5, nombreProducto: 'Ibuprofeno 400mg', cantidad: 80, precioUnitario: 7.10, subtotal: 568.00 }, { codigoProducto: 18, nombreProducto: 'Loratadina 10mg', cantidad: 120, precioUnitario: 5.43, subtotal: 652.00 } ] },
    { numeroOrden: 3202, rucProveedor: '20418108151', proveedor: 'Química Suiza Comercial S.A.', fechaEmision: '2026-06-16', montoTotal: 2960.00, estado: 'Pendiente',
      detalle: [ { codigoProducto: 17, nombreProducto: 'Mascarillas KN95 x10', cantidad: 200, precioUnitario: 14.80, subtotal: 2960.00 } ] },
    { numeroOrden: 3200, rucProveedor: '20512655305', proveedor: 'Perufarma S.A.', fechaEmision: '2026-06-10', montoTotal: 1290.00, estado: 'Recibida',
      detalle: [ { codigoProducto: 13, nombreProducto: 'Vitamina C 1000mg', cantidad: 60, precioUnitario: 21.50, subtotal: 1290.00 } ] },
  ];

  reclamos: Reclamo[] = [
    { codigo: 81, cliente: 'Rosa Isabel Flores', tipo: 'Reclamo', asunto: 'Producto llegó con empaque dañado', fecha: '2026-06-17', estado: 'En Proceso', canal: 'Web' },
    { codigo: 82, cliente: 'José Carlos Ramírez', tipo: 'Consulta', asunto: 'Disponibilidad de stock para tensiómetro', fecha: '2026-06-18', estado: 'Resuelto', canal: 'WhatsApp' },
    { codigo: 83, cliente: 'Carmen Rosa Díaz', tipo: 'Queja', asunto: 'Demora en la entrega del pedido', fecha: '2026-06-18', estado: 'Abierto', canal: 'Teléfono' },
  ];

  cupones: Cupon[] = [
    { codigo: 'DISC-20-7781', cliente: 'Rosa Isabel Flores', descuento: 20, motivo: 'Reclamo válido — empaque dañado', fechaEmision: '2026-06-17', vencimiento: '2026-07-17', estado: 'Activo' },
    { codigo: 'DISC-15-7720', cliente: 'Luis Alberto Vargas', descuento: 15, motivo: 'Cliente frecuente', fechaEmision: '2026-06-01', vencimiento: '2026-07-01', estado: 'Usado' },
  ];

  // ── Caja (arqueo de turno) ──
  movimientosCaja: MovimientoCaja[] = [
    { hora: '08:15', concepto: 'Venta B001-00004510', metodo: 'Efectivo', tipo: 'Ingreso', monto: 32.40 },
    { hora: '09:02', concepto: 'Venta B001-00004511', metodo: 'Yape', tipo: 'Ingreso', monto: 64.40 },
    { hora: '10:20', concepto: 'Venta F001-00000218', metodo: 'Tarjeta', tipo: 'Ingreso', monto: 129.00 },
    { hora: '11:05', concepto: 'Compra útiles de limpieza', metodo: 'Efectivo', tipo: 'Egreso', monto: 18.50 },
    { hora: '12:30', concepto: 'Venta B001-00004515', metodo: 'Plin', tipo: 'Ingreso', monto: 47.80 },
    { hora: '13:10', concepto: 'Venta B001-00004516', metodo: 'Efectivo', tipo: 'Ingreso', monto: 25.90 },
    { hora: '14:45', concepto: 'Vale de movilidad', metodo: 'Efectivo', tipo: 'Egreso', monto: 12.00 },
  ];

  // ── Reportes (dashboard) ──
  topVendidos: ProductoVendido[] = [
    { nombre: 'Paracetamol 500mg', unidades: 412, ingresos: 3502.00 },
    { nombre: 'Alcohol en Gel 1L', unidades: 286, ingresos: 4833.40 },
    { nombre: 'Vitamina C 1000mg', unidades: 198, ingresos: 5920.20 },
    { nombre: 'Mascarillas KN95 x10', unidades: 154, ingresos: 3064.60 },
    { nombre: 'Ibuprofeno 400mg', unidades: 142, ingresos: 1405.80 },
  ];

  ventasSemana = [
    { dia: 'Lun', web: 1240, fisica: 2100 },
    { dia: 'Mar', web: 980, fisica: 1850 },
    { dia: 'Mié', web: 1560, fisica: 2340 },
    { dia: 'Jue', web: 1320, fisica: 1980 },
    { dia: 'Vie', web: 2010, fisica: 2890 },
    { dia: 'Sáb', web: 2480, fisica: 3450 },
    { dia: 'Dom', web: 1150, fisica: 1620 },
  ];

  // ── Carrito reactivo (compartido tienda) ──
  carrito = signal<ItemCarrito[]>([
    { producto: this.productos[0], cantidad: 2 },
    { producto: this.productos[12], cantidad: 1 },
    { producto: this.productos[15], cantidad: 1 },
  ]);

  cantidadCarrito = computed(() => this.carrito().reduce((s, i) => s + i.cantidad, 0));
  subtotalCarrito = computed(() => this.carrito().reduce((s, i) => s + i.producto.precioVenta * i.cantidad, 0));

  agregarAlCarrito(producto: Producto, cantidad = 1) {
    const items = [...this.carrito()];
    const idx = items.findIndex(i => i.producto.codigoProducto === producto.codigoProducto);
    if (idx >= 0) items[idx] = { ...items[idx], cantidad: items[idx].cantidad + cantidad };
    else items.push({ producto, cantidad });
    this.carrito.set(items);
  }

  cambiarCantidad(codigoProducto: number, cantidad: number) {
    const items = this.carrito()
      .map(i => i.producto.codigoProducto === codigoProducto ? { ...i, cantidad } : i)
      .filter(i => i.cantidad > 0);
    this.carrito.set(items);
  }

  quitarDelCarrito(codigoProducto: number) {
    this.carrito.set(this.carrito().filter(i => i.producto.codigoProducto !== codigoProducto));
  }

  // ── Helpers ──
  getProducto(id: number) { return this.productos.find(p => p.codigoProducto === id); }
  igv(subtotal: number) { return subtotal * IGV_RATE; }
  diasParaVencer(fecha: string): number {
    const hoy = new Date('2026-06-18');
    const venc = new Date(fecha);
    return Math.round((venc.getTime() - hoy.getTime()) / 86400000);
  }
}
