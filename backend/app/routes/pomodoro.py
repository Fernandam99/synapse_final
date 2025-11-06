from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Usuario, db
from ..utils.validators import validate_duration, validate_pomodoro_cycles

pomodoro_bp = Blueprint('pomodoro', __name__)

@pomodoro_bp.route('/iniciar', methods=['POST'])
@jwt_required()
def iniciar_pomodoro():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        data = request.get_json()
        duracion_trabajo = data.get('duracion_trabajo', 25)
        duracion_descanso = data.get('duracion_descanso', 5)
        ciclos_objetivo = data.get('ciclos_objetivo', 4)

        # Validar duraciones
        trabajo_valid, trabajo_msg = validate_duration(duracion_trabajo)
        if not trabajo_valid:
            return jsonify({'error': f'Duración de trabajo inválida: {trabajo_msg}'}), 400

        descanso_valid, descanso_msg = validate_duration(duracion_descanso)
        if not descanso_valid:
            return jsonify({'error': f'Duración de descanso inválida: {descanso_msg}'}), 400

        # Validar ciclos
        ciclos_valid, ciclos_msg = validate_pomodoro_cycles(ciclos_objetivo)
        if not ciclos_valid:
            return jsonify({'error': ciclos_msg}), 400

        # Iniciar sesión pomodoro
        session_data = {
            'usuario_id': usuario_id,
            'duracion_trabajo': duracion_trabajo,
            'duracion_descanso': duracion_descanso,
            'ciclos_objetivo': ciclos_objetivo,
            'ciclos_completados': 0,
            'estado': 'iniciado',
            'timestamp': datetime.utcnow()
        }

        return jsonify({
            'message': 'Sesión pomodoro iniciada',
            'session': session_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pomodoro_bp.route('/finalizar', methods=['POST'])
@jwt_required()
def finalizar_pomodoro():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        data = request.get_json()
        ciclos_completados = data.get('ciclos_completados', 0)
        tiempo_total = data.get('tiempo_total', 0)
        completada = data.get('completada', True)

        # Validar ciclos completados
        if ciclos_completados:
            ciclos_valid, ciclos_msg = validate_pomodoro_cycles(ciclos_completados)
            if not ciclos_valid:
                return jsonify({'error': ciclos_msg}), 400

        # Validar tiempo total
        if tiempo_total:
            tiempo_valid, tiempo_msg = validate_duration(tiempo_total)
            if not tiempo_valid:
                return jsonify({'error': tiempo_msg}), 400

        resultado = {
            'usuario_id': usuario_id,
            'ciclos_completados': ciclos_completados,
            'tiempo_total': tiempo_total,
            'completada': completada,
            'timestamp_fin': datetime.utcnow()
        }

        return jsonify({
            'message': 'Sesión pomodoro finalizada exitosamente',
            'resultado': resultado
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pomodoro_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def obtener_estadisticas():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Aquí iría la lógica para obtener estadísticas de pomodoro
        estadisticas = {
            'total_sesiones': 0,
            'ciclos_totales': 0,
            'tiempo_total': 0,
            'sesiones_completadas': 0,
            'racha_actual': 0,
            'ultima_sesion': None
        }

        return jsonify(estadisticas), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500