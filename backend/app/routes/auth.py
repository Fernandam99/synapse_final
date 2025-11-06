from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import db, Usuario, Rol
from ..models.tarea import Tarea
from ..models.sesion import Sesion
from ..models.usuario_sala import UsuarioSala
from ..models.recompensa_usuario import RecompensaUsuario
from ..models.progreso import Progreso
from ..utils.validators import validate_email, validate_password
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validar campos requeridos
        if not data.get('username') or not data.get('correo') or not data.get('password'):
            return jsonify({'error': 'Username, email y contraseña son requeridos'}), 400

        # Validar formato de email
        email_valid, email_msg =validate_email(data['correo'])
        if not email_valid:
            return jsonify({'error': email_msg}), 400
        
        # Validar fortaleza de contraseña
        password_valid, password_msg = validate_password(data['password'])
        if not password_valid:
            return jsonify({'error': password_msg}), 400
        
        # Verificar si el email ya existe
        existing_email_user = Usuario.query.filter_by(correo=data['correo']).first()
        if existing_email_user:
            # Si la cuenta existe y está activa, impedimos el registro
            if existing_email_user.activo:
                return jsonify({'error': 'El email ya está registrado'}), 400
            # Si la cuenta existe pero está desactivada (soft-deleted), intentamos limpiar todos los datos asociados
            try:
                # Borrar datos dependientes del usuario para evitar problemas de FK
                db.session.query(Tarea).filter(Tarea.usuario_id == existing_email_user.id_usuario).delete(synchronize_session=False)
                db.session.query(Sesion).filter(Sesion.usuario_id == existing_email_user.id_usuario).delete(synchronize_session=False)
                db.session.query(UsuarioSala).filter(UsuarioSala.id_usuario == existing_email_user.id_usuario).delete(synchronize_session=False)
                db.session.query(RecompensaUsuario).filter(RecompensaUsuario.id_usuario == existing_email_user.id_usuario).delete(synchronize_session=False)
                db.session.query(Progreso).filter(Progreso.usuario_id == existing_email_user.id_usuario).delete(synchronize_session=False)
                # Finalmente eliminar el registro de usuario antiguo
                db.session.delete(existing_email_user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'Error al limpiar cuenta previa: {str(e)}'}), 500

        # Verificar si el username ya existe
        existing_username_user = Usuario.query.filter_by(username=data['username']).first()
        if existing_username_user:
            if existing_username_user.activo:
                return jsonify({'error': 'El username ya está registrado'}), 400
            try:
                db.session.query(Tarea).filter(Tarea.usuario_id == existing_username_user.id_usuario).delete(synchronize_session=False)
                db.session.query(Sesion).filter(Sesion.usuario_id == existing_username_user.id_usuario).delete(synchronize_session=False)
                db.session.query(UsuarioSala).filter(UsuarioSala.id_usuario == existing_username_user.id_usuario).delete(synchronize_session=False)
                db.session.query(RecompensaUsuario).filter(RecompensaUsuario.id_usuario == existing_username_user.id_usuario).delete(synchronize_session=False)
                db.session.query(Progreso).filter(Progreso.usuario_id == existing_username_user.id_usuario).delete(synchronize_session=False)
                db.session.delete(existing_username_user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'Error al limpiar cuenta previa: {str(e)}'}), 500

        # Obtener rol por defecto (usuario)
        rol_usuario = Rol.query.filter_by(nombre='usuario').first()
        if not rol_usuario:
            return jsonify({'error': 'Rol de usuario no encontrado'}), 500

        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            username=data['username'],
            correo=data['correo'],
            password=generate_password_hash(data['password']),
            rol_id=rol_usuario.id
        )

        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'usuario': nuevo_usuario.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('correo') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        # Buscar usuario
        usuario = Usuario.query.filter_by(correo=data['correo']).first()

        # Si el usuario no existe o está desactivado, informamos que la cuenta no existe
        if not usuario:
            return jsonify({'error': 'Esta Cuenta no existe, registrate'}), 404

        if not usuario.activo:
            return jsonify({'error': 'sta Cuenta no existe, registrate'}), 404

        # Verificamos la contraseña
        if not check_password_hash(usuario.password, data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Actualizar último acceso
        usuario.ultimo_acceso = datetime.utcnow()
        db.session.commit()
        
        # Crear token JWT
        access_token = create_access_token(identity=usuario.id_usuario)
        
        return jsonify({
            'access_token': access_token,
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify(usuario.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        usuario_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Contraseña actual y nueva son requeridas'}), 400
        
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar contraseña actual
        if not check_password_hash(usuario.password, data['current_password']):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 400
        
        # Actualizar contraseña
        usuario.password = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500