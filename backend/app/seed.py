"""Script de datos semilla para desarrollo local.

Carga categorías, laboratorios, productos, proveedores, un cliente y las
cuentas de usuario de demostración (una por rol), derivados de
frontend/src/app/core/data.service.ts y auth.service.ts para que backend y
frontend compartan las mismas credenciales de referencia. Cada tabla se
siembra solo si está vacía, para poder reejecutar el script sin duplicar
datos.

Uso: python -m app.seed
"""
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.modelos_almacen import Categoria, Laboratorio, Producto
from app.models.modelos_compras import Proveedor
from app.models.modelos_ventas import Cliente
from app.models.modelos_seguridad import Usuario

CATEGORIAS = [
    {"nombre": "Medicamentos", "descripcion": "De marca y genéricos"},
    {"nombre": "Dispositivos Médicos", "descripcion": "Equipos y dispositivos"},
    {"nombre": "Dermocosmética", "descripcion": "Cuidado de la piel"},
    {"nombre": "Infantil", "descripcion": "Productos para bebés y niños"},
    {"nombre": "Vitaminas y Suplementos", "descripcion": "Bienestar y nutrición"},
    {"nombre": "Bioseguridad e Higiene", "descripcion": "Protección y limpieza"},
]

LABORATORIOS = [
    {"nombre": "Bayer", "pais": "Alemania"},
    {"nombre": "Pfizer", "pais": "Estados Unidos"},
    {"nombre": "Genfar", "pais": "Colombia"},
    {"nombre": "Medifarma", "pais": "Perú"},
    {"nombre": "Roche", "pais": "Suiza"},
    {"nombre": "Hersil", "pais": "Perú"},
    {"nombre": "La Roche-Posay", "pais": "Francia"},
    {"nombre": "Abbott", "pais": "Estados Unidos"},
]

# codigoCategoria/codigoLaboratorio se resuelven por nombre al momento de
# sembrar, en vez de hardcodear IDs que dependen del orden de inserción.
PRODUCTOS = [
    {"categoria": "Medicamentos", "laboratorio": "Medifarma", "nombreProducto": "Paracetamol 500mg", "descripcion": "Analgésico y antipirético. Caja x 100 tabletas.", "precioVenta": 8.50, "condicionVenta": "Venta Libre", "stockDisponible": 320},
    {"categoria": "Medicamentos", "laboratorio": "Bayer", "nombreProducto": "Aspirina 100mg", "descripcion": "Ácido acetilsalicílico. Prevención cardiovascular.", "precioVenta": 12.90, "condicionVenta": "Venta Libre", "stockDisponible": 145},
    {"categoria": "Medicamentos", "laboratorio": "Genfar", "nombreProducto": "Amoxicilina 500mg", "descripcion": "Antibiótico de amplio espectro.", "precioVenta": 18.00, "condicionVenta": "Bajo Receta", "stockDisponible": 0},
    {"categoria": "Medicamentos", "laboratorio": "Pfizer", "nombreProducto": "Azitromicina 500mg", "descripcion": "Antibiótico macrólido.", "precioVenta": 24.50, "condicionVenta": "Bajo Receta", "stockDisponible": 62},
    {"categoria": "Medicamentos", "laboratorio": "Hersil", "nombreProducto": "Ibuprofeno 400mg", "descripcion": "Antiinflamatorio no esteroideo.", "precioVenta": 9.90, "condicionVenta": "Venta Libre", "stockDisponible": 210},
    {"categoria": "Dispositivos Médicos", "laboratorio": "Abbott", "nombreProducto": "Termómetro Digital", "descripcion": "Medición rápida y precisa. Punta flexible.", "precioVenta": 25.90, "condicionVenta": "Venta Libre", "stockDisponible": 48},
    {"categoria": "Dispositivos Médicos", "laboratorio": "Abbott", "nombreProducto": "Tensiómetro Digital de Brazo", "descripcion": "Monitor de presión arterial automático.", "precioVenta": 129.00, "condicionVenta": "Venta Libre", "stockDisponible": 12},
    {"categoria": "Dispositivos Médicos", "laboratorio": "Roche", "nombreProducto": "Glucómetro Accu-Chek", "descripcion": "Medidor de glucosa en sangre con 10 tiras.", "precioVenta": 89.90, "condicionVenta": "Venta Libre", "stockDisponible": 9},
    {"categoria": "Dermocosmética", "laboratorio": "La Roche-Posay", "nombreProducto": "Protector Solar FPS 50+", "descripcion": "Anthelios. Protección alta para rostro.", "precioVenta": 68.00, "condicionVenta": "Venta Libre", "stockDisponible": 35},
    {"categoria": "Dermocosmética", "laboratorio": "La Roche-Posay", "nombreProducto": "Gel Limpiador Facial", "descripcion": "Effaclar. Piel grasa y con tendencia acneica.", "precioVenta": 54.50, "condicionVenta": "Venta Libre", "stockDisponible": 28},
    {"categoria": "Infantil", "laboratorio": "Medifarma", "nombreProducto": "Pañales Etapa 3 x40", "descripcion": "Hipoalergénicos, 6 a 10 kg.", "precioVenta": 42.90, "condicionVenta": "Venta Libre", "stockDisponible": 60},
    {"categoria": "Infantil", "laboratorio": "Hersil", "nombreProducto": "Suero Fisiológico Bebé", "descripcion": "Solución para higiene nasal infantil.", "precioVenta": 14.50, "condicionVenta": "Venta Libre", "stockDisponible": 90},
    {"categoria": "Vitaminas y Suplementos", "laboratorio": "Pfizer", "nombreProducto": "Vitamina C 1000mg", "descripcion": "Refuerzo del sistema inmune. Efervescente.", "precioVenta": 29.90, "condicionVenta": "Venta Libre", "stockDisponible": 110},
    {"categoria": "Vitaminas y Suplementos", "laboratorio": "Roche", "nombreProducto": "Vitamina D3 2000 UI", "descripcion": "Salud ósea e inmunológica.", "precioVenta": 38.50, "condicionVenta": "Venta Libre", "stockDisponible": 24},
    {"categoria": "Vitaminas y Suplementos", "laboratorio": "Hersil", "nombreProducto": "Colágeno Hidrolizado", "descripcion": "Con magnesio y vitamina C. Sabor frutos rojos.", "precioVenta": 75.00, "condicionVenta": "Venta Libre", "stockDisponible": 18},
    {"categoria": "Bioseguridad e Higiene", "laboratorio": "Medifarma", "nombreProducto": "Alcohol en Gel 1L", "descripcion": "Antibacterial 70°. Dispensador.", "precioVenta": 16.90, "condicionVenta": "Venta Libre", "stockDisponible": 140},
    {"categoria": "Bioseguridad e Higiene", "laboratorio": "Medifarma", "nombreProducto": "Mascarillas KN95 x10", "descripcion": "Protección respiratoria, 5 capas.", "precioVenta": 19.90, "condicionVenta": "Venta Libre", "stockDisponible": 4},
    {"categoria": "Medicamentos", "laboratorio": "Genfar", "nombreProducto": "Loratadina 10mg", "descripcion": "Antihistamínico para alergias.", "precioVenta": 7.50, "condicionVenta": "Venta Libre", "stockDisponible": 175},
]

PROVEEDORES = [
    {"rucProveedor": "20100128056", "razonSocial": "Distribuidora Drokasa S.A.", "direccion": "Av. Argentina 2415, Lima", "telefono": "014561200", "correoElectronico": "ventas@drokasa.com.pe"},
    {"rucProveedor": "20418108151", "razonSocial": "Química Suiza Comercial S.A.", "direccion": "Av. República de Panamá 2461", "telefono": "014119000", "correoElectronico": "contacto@quimicasuiza.com"},
    {"rucProveedor": "20512655305", "razonSocial": "Perufarma S.A.", "direccion": "Av. Los Frutales 220, Ate", "telefono": "013171800", "correoElectronico": "pedidos@perufarma.com.pe"},
]

CLIENTE_DEMO = {
    "nombres": "María Elena", "apellidos": "Quispe Huamán", "dni": "45872136",
    "telefono": "987654321", "correoElectronico": "cliente@correo.com",
    "direccion": "Av. Grau 521, Huacho",
}

# Contraseña de demostración para las 7 cuentas: "123456" (RS0033 — se
# almacena cifrada con bcrypt, nunca en texto plano).
USUARIOS_DEMO = [
    {"nombres": "María Elena Quispe", "correoElectronico": "cliente@correo.com", "rol": "Cliente", "estado": True, "cliente": True},
    {"nombres": "Téc. José Pérez", "correoElectronico": "tecnico@boticacentral.pe", "rol": "Técnico de Farmacia", "estado": True},
    {"nombres": "Q.F. Andrea Salinas", "correoElectronico": "quimico@boticacentral.pe", "rol": "Químico Farmacéutico", "estado": True},
    {"nombres": "Carlos Mendoza", "correoElectronico": "admin@boticacentral.pe", "rol": "Administrador", "estado": True},
    {"nombres": "Rosa Núñez", "correoElectronico": "almacen@boticacentral.pe", "rol": "Encargado de Almacén", "estado": True},
    {"nombres": "Pedro Castillo", "correoElectronico": "repartidor@boticacentral.pe", "rol": "Repartidor", "estado": True},
    {"nombres": "Luis Torres (cesado)", "correoElectronico": "cesado@boticacentral.pe", "rol": "Técnico de Farmacia", "estado": False},
]
PASSWORD_DEMO = "123456"


def _seed_categorias(db) -> dict[str, int]:
    if db.query(Categoria).count() == 0:
        db.add_all(Categoria(**c) for c in CATEGORIAS)
        db.commit()
        print(f"Categoria: {len(CATEGORIAS)} registros insertados.")
    else:
        print("Categoria ya tiene registros, se omite.")
    return {c.nombre: c.codigoCategoria for c in db.query(Categoria).all()}


def _seed_laboratorios(db) -> dict[str, int]:
    if db.query(Laboratorio).count() == 0:
        db.add_all(Laboratorio(**l) for l in LABORATORIOS)
        db.commit()
        print(f"Laboratorio: {len(LABORATORIOS)} registros insertados.")
    else:
        print("Laboratorio ya tiene registros, se omite.")
    return {l.nombre: l.codigoLaboratorio for l in db.query(Laboratorio).all()}


def _seed_productos(db, categorias: dict[str, int], laboratorios: dict[str, int]) -> None:
    if db.query(Producto).count() > 0:
        print("Producto ya tiene registros, se omite.")
        return
    productos = [
        Producto(
            codigoCategoria=categorias[p["categoria"]],
            codigoLaboratorio=laboratorios[p["laboratorio"]],
            nombreProducto=p["nombreProducto"],
            descripcion=p["descripcion"],
            precioVenta=p["precioVenta"],
            condicionVenta=p["condicionVenta"],
            stockDisponible=p["stockDisponible"],
        )
        for p in PRODUCTOS
    ]
    db.add_all(productos)
    db.commit()
    print(f"Producto: {len(productos)} registros insertados.")


def _seed_proveedores(db) -> None:
    if db.query(Proveedor).count() == 0:
        db.add_all(Proveedor(**p) for p in PROVEEDORES)
        db.commit()
        print(f"Proveedor: {len(PROVEEDORES)} registros insertados.")
    else:
        print("Proveedor ya tiene registros, se omite.")


def _seed_usuarios_demo(db) -> None:
    """Cuentas de demostración (una por rol) — RS5601, CUS502."""
    if db.query(Usuario).count() > 0:
        print("Usuario ya tiene registros, se omite.")
        return

    cliente = db.query(Cliente).filter(Cliente.correoElectronico == CLIENTE_DEMO["correoElectronico"]).first()
    if not cliente:
        cliente = Cliente(**CLIENTE_DEMO, estado=True)
        db.add(cliente)
        db.flush()

    password_hash = hash_password(PASSWORD_DEMO)
    usuarios = [
        Usuario(
            nombres=u["nombres"],
            correoElectronico=u["correoElectronico"],
            passwordHash=password_hash,
            rol=u["rol"],
            estado=u["estado"],
            codigoCliente=cliente.codigoCliente if u.get("cliente") else None,
        )
        for u in USUARIOS_DEMO
    ]
    db.add_all(usuarios)
    db.commit()
    print(f"Usuario: {len(usuarios)} cuentas de demostración insertadas (password: '{PASSWORD_DEMO}').")


def seed() -> None:
    db = SessionLocal()
    try:
        categorias = _seed_categorias(db)
        laboratorios = _seed_laboratorios(db)
        _seed_productos(db, categorias, laboratorios)
        _seed_proveedores(db)
        _seed_usuarios_demo(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
