from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Usuario, Tarea
from datetime import date

admin_bp = Blueprint('admin', __name__)


def _is_admin(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    return usuario and getattr(usuario, 'rol_id', None) == 1


@admin_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def list_usuarios():
    current_id = get_jwt_identity()
    if not _is_admin(current_id):
        return jsonify({'error': 'Acceso denegado'}), 403

    usuarios = Usuario.query.order_by(Usuario.fecha_registro.desc()).all()
    created_any = False

    users_out = []
    for u in usuarios:
        # si el usuario no tiene tareas, crear 2 tareas de ejemplo
        tareas = Tarea.query.filter_by(usuario_id=u.id_usuario).all()
        if not tareas:
            t1 = Tarea(
                usuario_id=u.id_usuario,
                titulo=f'Tarea de ejemplo 1 - {u.username or u.id_usuario}',
                descripcion='Tarea creada automáticamente para el panel de admin',
                fecha_vencimiento=None,
                prioridad='baja',
                estado='Pendiente',
            )
            t2 = Tarea(
                usuario_id=u.id_usuario,
                titulo=f'Tarea de ejemplo 2 - {u.username or u.id_usuario}',
                descripcion='Tarea creada automáticamente para el panel de admin',
                fecha_vencimiento=None,
                prioridad='baja',
                estado='Pendiente',
            )
            db.session.add(t1)
            db.session.add(t2)
            created_any = True
            db.session.commit()
            tareas = [t1, t2]

        users_out.append({
            'id_usuario': u.id_usuario,
            'Username': getattr(u, 'username', None) or getattr(u, 'Username', None),
            'username': getattr(u, 'username', None),
            'correo': u.correo,
            'rol_id': u.rol_id,
            'activo': u.activo,
            'telefono': getattr(u, 'celular', None),
            'avatar_url': getattr(u, 'avatar_url', None),
            'fecha_registro': u.fecha_registro.isoformat() if getattr(u, 'fecha_registro', None) else None,
            'tareas': [t.to_dict() for t in tareas]
        })

    return jsonify(users_out), 200


@admin_bp.route('/usuarios/<string:user_id>/desactivar', methods=['POST'])
@jwt_required()
def desactivar_usuario(user_id):
    current_id = get_jwt_identity()
    if not _is_admin(current_id):
        return jsonify({'error': 'Acceso denegado'}), 403

    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    usuario.activo = False
    db.session.commit()
    return jsonify({'message': 'Usuario desactivado'}), 200


@admin_bp.route('/usuarios/<string:user_id>', methods=['PUT'])
@jwt_required()
def editar_usuario(user_id):
    current_id = get_jwt_identity()
    if not _is_admin(current_id):
        return jsonify({'error': 'Acceso denegado'}), 403

    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}

    # Campos permitidos a editar por el admin
    allowed = ['username', 'correo', 'rol_id', 'activo', 'celular', 'avatar_url']
    try:
        if 'username' in data and data['username']:
            # verificar unicidad
            exists = Usuario.query.filter(Usuario.username == data['username'], Usuario.id_usuario != usuario.id_usuario).first()
            if exists:
                return jsonify({'error': 'El username ya está en uso'}), 400
            usuario.username = data['username']

        if 'correo' in data and data['correo']:
            exists = Usuario.query.filter(Usuario.correo == data['correo'], Usuario.id_usuario != usuario.id_usuario).first()
            if exists:
                return jsonify({'error': 'El correo ya está en uso'}), 400
            usuario.correo = data['correo']

        if 'rol_id' in data:
            usuario.rol_id = int(data['rol_id'])
        if 'activo' in data:
            usuario.activo = bool(data['activo'])
        if 'celular' in data:
            usuario.celular = data.get('celular')
        if 'avatar_url' in data:
            usuario.avatar_url = data.get('avatar_url')

        db.session.commit()

        return jsonify({'message': 'Usuario actualizado', 'usuario': usuario.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Usuario, Rol

admin_bp = Blueprint('admin', __name__)


def is_admin(usuario_id):
    user = Usuario.query.get(usuario_id)
    return user and getattr(user, 'rol_id', None) == 1


@admin_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def list_users():
    try:
        usuario_id = get_jwt_identity()
        if not is_admin(usuario_id):
            return jsonify({'error': 'Acceso denegado'}), 403

        usuarios = Usuario.query.order_by(Usuario.fecha_registro.desc()).all()
        result = []
        for u in usuarios:
            ud = u.to_dict()
            # Compatibilidad con frontend (usa 'Username')
            ud['Username'] = getattr(u, 'username', None)
            # Mapear campos adicionales si existen en el modelo
            ud['nombre_completo'] = getattr(u, 'nombre_completo', None)
            ud['telefono'] = getattr(u, 'celular', None)
            ud['ubicacion'] = getattr(u, 'ubicacion', None)
            ud['fecha_nacimiento'] = getattr(u, 'fecha_nacimiento', None)
            ud['descripcion'] = getattr(u, 'descripcion', None)
            result.append(ud)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/usuarios/<string:user_id>/desactivar', methods=['POST'])
@jwt_required()
def deactivate_user(user_id):
    try:
        usuario_id = get_jwt_identity()
        if not is_admin(usuario_id):
            return jsonify({'error': 'Acceso denegado'}), 403

        user = Usuario.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        user.activo = False
        db.session.commit()

        return jsonify({'message': 'Usuario desactivado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/usuarios/<string:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        usuario_id = get_jwt_identity()
        if not is_admin(usuario_id):
            return jsonify({'error': 'Acceso denegado'}), 403

        user = Usuario.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        data = request.get_json() or {}

        # Campos permitidos a actualizar
        allowed = ['username', 'correo', 'nombre_completo', 'celular', 'ubicacion', 'descripcion', 'fecha_nacimiento', 'rol_id', 'activo']
        for k in allowed:
            if k in data:
                # Map frontend names to model fields
                if k == 'telefono':
                    user.celular = data[k]
                else:
                    setattr(user, k if hasattr(user, k) else k, data[k])

        # Si rol_id cambia, validar que exista
        if 'rol_id' in data:
            rol = Rol.query.get(data['rol_id'])
            if not rol:
                return jsonify({'error': 'Rol no válido'}), 400
            user.rol_id = data['rol_id']

        # Asegurar unicidad básica para username y correo
        if 'username' in data:
            existing = Usuario.query.filter(Usuario.username == data['username'], Usuario.id_usuario != user_id).first()
            if existing:
                return jsonify({'error': 'Username ya en uso'}), 400
            user.username = data['username']
        if 'correo' in data:
            existing = Usuario.query.filter(Usuario.correo == data['correo'], Usuario.id_usuario != user_id).first()
            if existing:
                return jsonify({'error': 'Correo ya en uso'}), 400
            user.correo = data['correo']

        # Activar/desactivar
        if 'activo' in data:
            user.activo = bool(data['activo'])

        db.session.commit()

        ud = user.to_dict()
        ud['Username'] = getattr(user, 'username', None)
        return jsonify(ud), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
