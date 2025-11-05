from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Tarea, Usuario, Sala, UsuarioSala
from datetime import datetime, date

tarea_bp = Blueprint('tarea', __name__)

@tarea_bp.route('', methods=['GET'])
@jwt_required()
def get_tareas():
    try:
        usuario_id = get_jwt_identity()
        
        # Parámetros de filtro opcionales
        sala_id = request.args.get('sala_id')
        estado = request.args.get('estado')
        prioridad = request.args.get('prioridad')
        
        # Consulta base: tareas del usuario actual
        query = Tarea.query.filter_by(usuario_id=usuario_id)
        
        # Aplicar filtros
        if sala_id:
            query = query.filter_by(sala_id=sala_id)
        if estado:
            query = query.filter_by(estado=estado)
        if prioridad:
            query = query.filter_by(prioridad=prioridad)
        
        # Ordenar por fecha de creación (más recientes primero)
        tareas = query.order_by(Tarea.fecha_creacion.desc()).all()
        
        return jsonify([tarea.to_dict() for tarea in tareas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tarea_bp.route('/<string:id_tarea>', methods=['GET'])
@jwt_required()
def get_tarea(id_tarea):
    try:
        usuario_id = get_jwt_identity()

        tarea = Tarea.query.filter_by(id_tarea=id_tarea, usuario_id=usuario_id).first()
        if not tarea:
            return jsonify({'error': 'Tarea no encontrada'}), 404

        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@tarea_bp.route('', methods=['POST'])  
@jwt_required()
def create_tarea():
    try:
        usuario_id = get_jwt_identity()
        data = request.get_json()

        print(f"usuario_id: {usuario_id}, sala_id: {data.get('sala_id')}")

        # Validar datos requeridos
        if not data.get('titulo'):
            return jsonify({'error': 'El título es requerido'}), 400

        sala_id = data.get('sala_id')
        if sala_id:
            # Verificar que el usuario pertenece a la sala
            usuario_sala = UsuarioSala.query.filter_by(
                id_usuario=usuario_id,
                id_sala=sala_id,
                activo=True
            ).first()

            print(f"usuario_sala: {usuario_sala}")  # Para ver si la relación existe

            if not usuario_sala:
                return jsonify({'error': 'No perteneces a esta sala'}), 403

        # Parsear fecha de vencimiento si se proporciona
        fecha_vencimiento = None
        if data.get('fecha_vencimiento'):
            try:
                fecha_vencimiento = datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha inválido (YYYY-MM-DD)'}), 400

        # Crear nueva tarea
        nueva_tarea = Tarea(
            usuario_id=usuario_id,
            sala_id=sala_id,
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            fecha_vencimiento=fecha_vencimiento,
            prioridad=data.get('prioridad', 'baja'),
            estado=data.get('estado', 'Pendiente'),
            comentario=data.get('comentario')
        )

        db.session.add(nueva_tarea)
        db.session.commit()

        # Debug log: confirmar creación en servidor
        try:
            print(f"[CREATE TAREA] usuario={usuario_id} id={nueva_tarea.id_tarea} estado={nueva_tarea.estado} fecha_vencimiento={nueva_tarea.fecha_vencimiento}")
        except Exception:
            pass

        return jsonify(nueva_tarea.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tarea_bp.route('/<string:id_tarea>', methods=['PUT'])
@jwt_required()
def update_tarea(id_tarea):
    try:
        usuario_id = get_jwt_identity()

        # Usamos 'id_usuario' en lugar de 'usuario_id'
        tarea = Tarea.query.filter_by(id_tarea=id_tarea, usuario_id=usuario_id).first()
        if not tarea:
            return jsonify({'error': 'Tarea no encontrada'}), 404

        data = request.get_json()

        # Actualizar campos permitidos
        if 'titulo' in data:
            tarea.titulo = data['titulo']
        if 'descripcion' in data:
            tarea.descripcion = data['descripcion']
        if 'prioridad' in data and data['prioridad'] in ['baja', 'media', 'alta']:
            tarea.prioridad = data['prioridad']
        if 'estado' in data and data['estado'] in ['Pendiente', 'EnProgreso', 'EnEspera', 'Completado']:
            tarea.estado = data['estado']
        if 'comentario' in data:
            tarea.comentario = data['comentario']

        # Actualizar fecha de vencimiento
        if 'fecha_vencimiento' in data:
            if data['fecha_vencimiento']:
                try:
                    tarea.fecha_vencimiento = datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Formato de fecha inválido (YYYY-MM-DD)'}), 400
            else:
                tarea.fecha_vencimiento = None

        # Validar cambio de sala
        if 'sala_id' in data:
            nueva_sala_id = data['sala_id']
            if nueva_sala_id:
                # Verificar que el usuario pertenece a la nueva sala
                usuario_sala = UsuarioSala.query.filter_by(
                    id_usuario=usuario_id,  # Cambié 'usuario_id' por 'id_usuario'
                    id_sala=nueva_sala_id,
                    activo=True
                ).first()
                if not usuario_sala:
                    return jsonify({'error': 'No perteneces a esta sala'}), 403
            tarea.sala_id = nueva_sala_id

        db.session.commit()

        return jsonify(tarea.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tarea_bp.route('/<string:id_tarea>', methods=['DELETE'])
@jwt_required()
def delete_tarea(id_tarea):
    try:
        usuario_id = get_jwt_identity()

        tarea = Tarea.query.filter_by(id_tarea=id_tarea, usuario_id=usuario_id).first()  # Cambié 'tarea_id' a 'id_tarea'
        if not tarea:
            return jsonify({'error': 'Tarea no encontrada'}), 404

        db.session.delete(tarea)
        db.session.commit()

        return jsonify({'message': 'Tarea eliminada exitosamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@tarea_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def get_estadisticas_tareas():
    try:
        usuario_id = get_jwt_identity()

        
        # Contar tareas por estado
        stats = {
            'total': Tarea.query.filter_by(usuario_id=usuario_id).count(),
            'pendientes': Tarea.query.filter_by(usuario_id=usuario_id, estado='Pendiente').count(),
            'en_progreso': Tarea.query.filter_by(usuario_id=usuario_id, estado='EnProgreso').count(),
            'en_espera': Tarea.query.filter_by(usuario_id=usuario_id, estado='EnEspera').count(),
            'completadas': Tarea.query.filter_by(usuario_id=usuario_id, estado='Completado').count()
        }
        
        # Tareas por prioridad
        stats['por_prioridad'] = {

        print(f"[GET ESTAD TAREAS] llamada para usuario={usuario_id}")
        hoy = date.today()
        primer_dia_mes = hoy.replace(day=1)
        if hoy.month == 12:
            ultimo_dia_mes = hoy.replace(year=hoy.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            ultimo_dia_mes = hoy.replace(month=hoy.month + 1, day=1) - timedelta(days=1)

        # Conteo básico por estado
        total = Tarea.query.filter_by(usuario_id=usuario_id).count()
        pendientes = Tarea.query.filter_by(usuario_id=usuario_id, estado='Pendiente').count()
        en_progreso = Tarea.query.filter_by(usuario_id=usuario_id, estado='EnProgreso').count()
        en_espera = Tarea.query.filter_by(usuario_id=usuario_id, estado='EnEspera').count()
        completadas = Tarea.query.filter_by(usuario_id=usuario_id, estado='Completado').count()

        # Por prioridad
        por_prioridad = {

            'alta': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='alta').count(),
            'media': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='media').count(),
            'baja': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='baja').count()
        }
        
        # Tareas vencidas (solo las no completadas)
        hoy = date.today()
        stats['vencidas'] = Tarea.query.filter(
            Tarea.usuario_id == usuario_id,
            Tarea.estado != 'Completado',
            Tarea.fecha_vencimiento < hoy
        ).count()
        
        # Tareas de hoy
        stats['hoy'] = Tarea.query.filter(
            Tarea.usuario_id == usuario_id,
            Tarea.fecha_vencimiento == hoy
        ).count()

        
        return jsonify(stats), 200
        


        # Tareas recientes (últimos 5 días, ordenadas por fecha_creacion DESC)
        hace_5_dias = hoy - timedelta(days=5)
        recientes = Tarea.query.filter(
            Tarea.usuario_id == usuario_id,
            Tarea.fecha_creacion >= datetime.combine(hace_5_dias, datetime.min.time())
        ).order_by(Tarea.fecha_creacion.desc()).limit(5).all()

        # Actividad mensual (últimos 3 meses)
        monthly = []
        for i in range(3):
            # Mes a analizar
            if hoy.month - i <= 0:
                mes = 12 + (hoy.month - i)
                año = hoy.year - 1
            else:
                mes = hoy.month - i
                año = hoy.year

            # Primer y último día del mes
            primer_dia = date(año, mes, 1)
            if mes == 12:
                ultimo_dia = date(año + 1, 1, 1) - timedelta(days=1)
            else:
                ultimo_dia = date(año, mes + 1, 1) - timedelta(days=1)

            # Contar tareas creadas en ese mes
            creadas = Tarea.query.filter(
                Tarea.usuario_id == usuario_id,
                Tarea.fecha_creacion >= datetime.combine(primer_dia, datetime.min.time()),
                Tarea.fecha_creacion <= datetime.combine(ultimo_dia, datetime.max.time())
            ).count()

            # Contar tareas completadas en ese mes
            completadas_mes = Tarea.query.filter(
                Tarea.usuario_id == usuario_id,
                Tarea.estado == 'Completado',
                Tarea.fecha_creacion >= datetime.combine(primer_dia, datetime.min.time()),
                Tarea.fecha_creacion <= datetime.combine(ultimo_dia, datetime.max.time())
            ).count()

            monthly.append({
                'year': año,
                'month': mes,
                'creadas': creadas,
                'completadas': completadas_mes
            })

        # Serializar recientes
        recientes_data = [t.to_dict() for t in recientes]

        # Debug log: mostrar conteos
        try:
            print(f"[ESTADISTICAS VALORES] total={total} pendientes={pendientes} en_progreso={en_progreso} en_espera={en_espera} completadas={completadas}")
        except Exception:
            pass

        return jsonify({
            'total': total,
            'pendientes': pendientes,
            'en_progreso': en_progreso,
            'en_espera': en_espera,
            'completadas': completadas,
            'por_prioridad': por_prioridad,
            'vencidas': vencidas,
            'hoy': hoy_count,
            'recientes': recientes_data,
            'monthly': monthly
        }), 200


    except Exception as e:
        return jsonify({'error': str(e)}), 500
@tarea_bp.route('/sala/<string:sala_id>', methods=['GET'])
@jwt_required()
def get_tareas_sala(sala_id):
    try:
        usuario_id = get_jwt_identity()

        # Verificar que el usuario pertenece a la sala
        usuario_sala = UsuarioSala.query.filter_by(
            id_usuario=usuario_id,  # Cambié 'usuario_id' a 'id_usuario'
            id_sala=sala_id,
            activo=True
        ).first()

        if not usuario_sala:
            return jsonify({'error': 'No tienes acceso a esta sala'}), 403

        # Obtener tareas de la sala (de todos los usuarios)
        tareas = Tarea.query.filter_by(sala_id=sala_id).order_by(Tarea.fecha_creacion.desc()).all()

        # Incluir información del usuario para cada tarea
        tareas_con_usuario = []
        for tarea in tareas:
            tarea_dict = tarea.to_dict()
            usuario = Usuario.query.get(tarea.usuario_id)
            tarea_dict['usuario'] = {
                'id_usuario': usuario.id_usuario,
                'Username': usuario.Username,
                'correo': usuario.correo
            } if usuario else None
            tareas_con_usuario.append(tarea_dict)

        return jsonify(tareas_con_usuario), 200

    except Exception as e:
        print(f"[ERROR TAREAS SALA] {str(e)}")
        return jsonify({'error': 'Error interno al obtener tareas de la sala'}), 500


# Endpoint temporal de depuración: devuelve últimas tareas y estadísticas calculadas
# Útil para verificar en una sola petición si la creación persiste y cómo se computan las stats
@tarea_bp.route('/debug', methods=['GET'])
@jwt_required()
def debug_tareas():
    try:
        usuario_id = get_jwt_identity()

        # Últimas 10 tareas del usuario
        ultimas = Tarea.query.filter_by(usuario_id=usuario_id).order_by(Tarea.fecha_creacion.desc()).limit(10).all()
        ultimas_data = [t.to_dict() for t in ultimas]

        # Reusar la lógica de estadísticas existente (llamando internamente)
        # Conteo básico por estado
        total = Tarea.query.filter_by(usuario_id=usuario_id).count()
        pendientes = Tarea.query.filter_by(usuario_id=usuario_id, estado='Pendiente').count()
        en_progreso = Tarea.query.filter_by(usuario_id=usuario_id, estado='EnProgreso').count()
        en_espera = Tarea.query.filter_by(usuario_id=usuario_id, estado='EnEspera').count()
        completadas = Tarea.query.filter_by(usuario_id=usuario_id, estado='Completado').count()

        por_prioridad = {
            'alta': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='alta').count(),
            'media': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='media').count(),
            'baja': Tarea.query.filter_by(usuario_id=usuario_id, prioridad='baja').count()
        }

        return jsonify({
            'ultimas': ultimas_data,
            'estadisticas': {
                'total': total,
                'pendientes': pendientes,
                'en_progreso': en_progreso,
                'en_espera': en_espera,
                'completadas': completadas,
                'por_prioridad': por_prioridad
            }
        }), 200
    except Exception as e:
        print(f"[DEBUG TAREAS ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500
