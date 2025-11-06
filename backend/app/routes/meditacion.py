from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Usuario, db
from ..utils.validators import validate_meditation_duration

meditacion_bp = Blueprint('meditacion', __name__)

@meditacion_bp.route('/iniciar', methods=['POST'])
@jwt_required()
def iniciar_meditacion():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        data = request.get_json()
        duracion = data.get('duracion', 10)
        tipo = data.get('tipo', 'mindfulness')

        # Validar duración
        duracion_valid, duracion_msg = validate_meditation_duration(duracion)
        if not duracion_valid:
            return jsonify({'error': duracion_msg}), 400

        # Validar tipo de meditación
        tipos_validos = ['mindfulness', 'guiada', 'zen', 'trascendental']
        if tipo not in tipos_validos:
            return jsonify({'error': f'Tipo de meditación inválido. Debe ser uno de: {", ".join(tipos_validos)}'}), 400

        # Aquí iría la lógica de iniciar una sesión de meditación
        session_data = {
            'usuario_id': usuario_id,
            'tipo': tipo,
            'duracion': duracion,
            'estado': 'iniciada',
            'timestamp': datetime.utcnow()
        }

        return jsonify({
            'message': 'Sesión de meditación iniciada',
            'session': session_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meditacion_bp.route('/finalizar', methods=['POST'])
@jwt_required()
def finalizar_meditacion():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        data = request.get_json()
        completada = data.get('completada', True)
        tiempo_real = data.get('tiempo_real')

        if tiempo_real is not None:
            # Validar tiempo real
            tiempo_valid, tiempo_msg = validate_meditation_duration(tiempo_real)
            if not tiempo_valid:
                return jsonify({'error': tiempo_msg}), 400

        resultado = {
            'usuario_id': usuario_id,
            'completada': completada,
            'tiempo_real': tiempo_real,
            'timestamp_fin': datetime.utcnow()
        }

        return jsonify({
            'message': 'Sesión de meditación finalizada exitosamente',
            'resultado': resultado
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meditacion_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def obtener_estadisticas():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Aquí iría la lógica para obtener estadísticas de meditación
        estadisticas = {
            'total_sesiones': 0,
            'tiempo_total': 0,
            'sesiones_completadas': 0,
            'racha_actual': 0,
            'ultima_sesion': None
        }

        return jsonify(estadisticas), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500