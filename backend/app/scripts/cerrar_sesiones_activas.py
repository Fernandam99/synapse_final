# Script para limpiar sesiones activas de Pomodoro y Meditación
from app import create_app, db
from app.models import Sesion

app = create_app()

with app.app_context():
    sesiones = Sesion.query.filter(Sesion.estado=='EnEjecucion').all()
    for sesion in sesiones:
        print(f"Cerrando sesión {sesion.id_sesion} de usuario {sesion.usuario_id} (técnica {sesion.tecnica_id})")
        sesion.estado = 'Cancelado'
        sesion.fecha_fin = db.func.now()
    db.session.commit()
    print(f"{len(sesiones)} sesiones activas cerradas.")
