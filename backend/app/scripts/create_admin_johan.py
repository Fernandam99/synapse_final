import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import db, Usuario, Rol
from werkzeug.security import generate_password_hash


def create_admin_johan():
    app = create_app()
    with app.app_context():
        # Asegurar que exista rol 'admin'
        rol = Rol.query.filter(Rol.nombre.in_(['admin','administrador'])).first()
        if not rol:
            rol = Rol(nombre='admin')
            db.session.add(rol)
            db.session.commit()
            print("Rol 'admin' creado.")

        # Verificar si ya existe el usuario por correo
        correo = 'johan@gmail.com'
        existing = Usuario.query.filter_by(correo=correo).first()
        if existing:
            print(f"Ya existe un usuario con correo {correo}: {existing.username}")
            return

        user = Usuario(
            username='johan',
            correo=correo,
            password=generate_password_hash('Holaivan1234'),
            rol_id=rol.id,
            activo=True
        )
        db.session.add(user)
        db.session.commit()
        print('Administrador creado:')
        print(f"  Usuario: {user.username}")
        print(f"  Correo: {user.correo}")
        print('  Contraseña: Holaivan1234')


if __name__ == '__main__':
    create_admin_johan()
