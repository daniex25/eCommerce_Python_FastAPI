// Modelos del dominio — nombres de campos alineados con el backend FastAPI
// para facilitar la conexión real (codigoProducto, nombreProducto, etc.)

export interface Categoria {
  codigoCategoria: number;
  nombre: string;
  descripcion?: string;
}

export interface Laboratorio {
  codigoLaboratorio: number;
  nombre: string;
  pais?: string;
}

export interface Producto {
  codigoProducto: number;
  codigoCategoria: number;
  codigoLaboratorio: number;
  nombreProducto: string;
  descripcion?: string;
  precioVenta: number;
  condicionVenta: 'Venta Libre' | 'Bajo Receta';
  stockDisponible: number;
  // Solo frontend (no existe en backend):
  categoria?: string;
  laboratorio?: string;
  icono?: string;
  presentacion?: string;
  stockMinimo?: number;
}

export interface Lote {
  codigoLote: number;
  codigoProducto: number;
  numeroLote: string;
  fechaVencimiento: string;
  stockDisponible: number;
  estado: 'Vigente' | 'Por Vencer' | 'Vencido' | 'Cuarentena';
  producto?: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  // Solo para productos "Bajo Receta": receta ya aprobada que respalda
  // este ítem (RN1101). El checkout la envía al backend para consumirla.
  numeroReceta?: number;
}

export interface Cliente {
  codigoCliente: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correoElectronico?: string;
  direccion?: string;
  estado: boolean;
}

export interface DetallePedido {
  codigoProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoPedido = 'Pendiente' | 'Pagado' | 'Preparado' | 'En Ruta' | 'Entregado' | 'Incidencia';

export interface Pedido {
  numeroPedido: number;
  codigoCliente: number;
  cliente?: string;
  fechaPedido: string;
  estadoPedido: EstadoPedido;
  montoTotal: number;
  direccionEntrega: string;
  distrito?: string;
  metodoPago?: string;
  detalle?: DetallePedido[];
}

export interface Repartidor {
  codigoRepartidor: number;
  nombre: string;
  telefono?: string;
  estado: boolean; // disponible
  vehiculo?: string;
  pedidosAsignados?: number;
}

export interface Entrega {
  codigoEntrega: number;
  numeroPedido: number;
  codigoRepartidor?: number;
  repartidor?: string;
  cliente?: string;
  fechaEntrega?: string;
  direccionEntrega: string;
  distrito?: string;
  estadoEntrega: 'Por Asignar' | 'Asignado' | 'En Ruta' | 'Entregado' | 'Incidencia';
}

export interface RecetaMedica {
  numeroReceta: number;
  numeroPedido: number | null;
  codigoProducto: number | null;
  nombrePaciente: string;
  medicoTratante: string;
  cmpMedico?: string;
  fechaEmision: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  imagenUrl?: string;
  // Solo frontend: nombre del producto, resuelto por codigoProducto.
  icono?: string;
  producto?: string;
}

export interface Pago {
  codigoPago: number;
  numeroPedido: number;
  fechaPago: string;
  monto: number;
  metodoPago: string;
  estadoPago: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export interface Comprobante {
  numeroComprobante: string;
  codigoPago: number;
  tipoComprobante: 'Boleta' | 'Factura';
  fechaEmision: string;
  subtotal: number;
  igv: number;
  total: number;
  documentoCliente?: string;
  nombreCliente?: string;
  estadoSunat?: 'Aceptado' | 'Pendiente' | 'Rechazado';
}

export interface Proveedor {
  rucProveedor: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  correoElectronico?: string;
}

export interface DetalleOrden {
  codigoProducto: number;
  nombreProducto: string;
  cantidad: number;
  cantidadRecibida?: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenCompra {
  numeroOrden: number;
  rucProveedor: string;
  proveedor?: string;
  fechaEmision: string;
  montoTotal: number;
  estado: 'Pendiente' | 'Recibida' | 'Parcial' | 'Anulada';
  detalle?: DetalleOrden[];
}

export interface Reclamo {
  codigo: number;
  cliente: string;
  tipo: 'Reclamo' | 'Consulta' | 'Queja';
  asunto: string;
  fecha: string;
  estado: 'Abierto' | 'En Proceso' | 'Resuelto';
  canal: string;
}

export interface Cupon {
  codigo: string;
  cliente: string;
  descuento: number;
  motivo: string;
  fechaEmision: string;
  vencimiento: string;
  estado: 'Activo' | 'Usado' | 'Vencido';
}

export interface MovimientoCaja {
  hora: string;
  concepto: string;
  metodo: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
}

export interface ProductoVendido {
  nombre: string;
  unidades: number;
  ingresos: number;
}
