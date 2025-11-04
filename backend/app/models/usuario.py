from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db
from app.models.rol import Rol    
import uuid


def generate_uuid():
    return str(uuid.uuid4())

# Modelo Usuario
class Usuario(db.Model):
    __tablename__ = 'usuario'

    id_usuario = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(100), unique=True, nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    celular = db.Column(db.String(15), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    fecha_registro = db.Column(db.DateTime(6), default=datetime.utcnow, nullable=False)
    ultimo_acceso = db.Column(db.DateTime(6), nullable=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    tareas = db.relationship('Tarea', backref='usuario_tarea', lazy=True)
    sesiones = db.relationship('Sesion', backref='usuario_sesion', lazy=True)
    salas = db.relationship('UsuarioSala', backref='usuario_sala', lazy=True)
    recompensas = db.relationship('RecompensaUsuario', backref='usuario_recompensa', lazy=True)
    progreso = db.relationship('Progreso', backref='usuario_progreso', lazy=True)


    def to_dict(self):
            return {
                'id_usuario': self.id_usuario,
                'username': self.username,
                'correo': self.correo,
                'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
                'ultimo_acceso': self.ultimo_acceso.isoformat() if self.ultimo_acceso else None,
                'rol_id': self.rol_id,
                'activo': self.activo,
                'tareas': [tarea.to_dict() for tarea in self.tareas]
            }
