import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import db, Usuario, Rol
from werkzeug.security import generate_password_hash

def create_admin():
    app = create_app()
    with app.app_context():
        # Buscar rol 'admin' o 'administrador'
        rol = Rol.query.filter(Rol.nombre.in_(['admin','administrador'])).first()
        if not rol:
            print("No se encontró el rol 'admin' ni 'administrador'. Ejecuta seed_roles primero o crea el rol manualmente.")
            return

        # Verificar si ya existe un admin con ese rol
        admin = Usuario.query.filter_by(rol_id=rol.id).first()
        if admin:
            print(f"Ya existe un administrador: {admin.username} ({admin.correo})")
            return

        admin_user = Usuario(
            username='admin',
            correo='admin@synapse.com',
            password=generate_password_hash('admin123'),
            rol_id=rol.id,
            activo=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print('Administrador creado:')
        print(f"  Usuario: {admin_user.username}")
        print(f"  Correo: {admin_user.correo}")
        print('  Contraseña: admin123')

if __name__ == '__main__':
    create_admin()
