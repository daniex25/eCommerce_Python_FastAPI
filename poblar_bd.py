from database import SessionLocal
from models.modelos_seguridad import Rol, Usuario, Empleado
from models.modelos_almacen import Categoria, Proveedor, Producto, Lote
from datetime import date

def poblar_datos():
    db = SessionLocal()
    
    try:
        # 1. Crear Roles
        rol_admin = Rol(nombre="Administrador")
        rol_cajero = Rol(nombre="Cajero")
        rol_cliente = Rol(nombre="Cliente")
        db.add_all([rol_admin, rol_cajero, rol_cliente])
        db.commit()

        # 2. Crear un Usuario y Empleado de prueba
        user_admin = Usuario(id_rol=rol_admin.id_rol, email="admin@boticacentral.com", password_hash="123456", estado=True)
        db.add(user_admin)
        db.commit()

        empleado_admin = Empleado(id_usuario=user_admin.id_usuario, nombres="Steven", apellidos="Admin", turno="Mañana")
        db.add(empleado_admin)
        db.commit()

        # 3. Crear Proveedor y Categorías
        prov = Proveedor(ruc="20123456789", razon_social="FarmaPeru S.A.", contacto="Juan Pérez - 987654321")
        cat_analgesico = Categoria(nombre="Analgésicos")
        cat_antibiotico = Categoria(nombre="Antibióticos")
        db.add_all([prov, cat_analgesico, cat_antibiotico])
        db.commit()

        # 4. Crear Productos
        prod_paracetamol = Producto(
            id_categoria=cat_analgesico.id_categoria, 
            codigo_barras="7751234567890", 
            nombre="Paracetamol 500mg", 
            descripcion="Caja x 100 tabletas", 
            precio_venta=15.50, 
            requiere_receta=False, 
            stock_total=50
        )
        db.add(prod_paracetamol)
        db.commit()

        # 5. Crear Lote para el producto
        lote_1 = Lote(
            id_producto=prod_paracetamol.id_producto, 
            codigo_lote="LOTE-2026-A1", 
            fecha_vencimiento=date(2028, 12, 31), 
            stock_lote=50
        )
        db.add(lote_1)
        db.commit()

        print("✅ ¡Base de datos poblada con éxito! Los datos de prueba ya están en MariaDB/PostgreSQL.")

    except Exception as e:
        print(f"❌ Error al poblar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando la carga de datos de prueba...")
    poblar_datos()