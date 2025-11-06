import re
from datetime import datetime, date


def validate_email(email):
    pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    if re.match(pattern, email):
        return True, "Email válido"
    return False, "Email inválido"

def validate_password(password):
    errores = []
    if len(password) < 8:
        errores.append("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", password):
        errores.append("La contraseña debe contener al menos una letra mayúscula")
    if not re.search(r"[a-z]", password):
        errores.append("La contraseña debe contener al menos una letra minúscula")
    if not re.search(r"[0-9]", password):
        errores.append("La contraseña debe contener al menos un número")
    # Acepta cualquier carácter que NO sea letra ni número
    if not re.search(r"[^a-zA-Z0-9]", password):
        errores.append("La contraseña debe contener al menos un carácter especial")
    if errores:
        return False, errores
    return True, ["Contraseña válida y segura"]

def validate_duration(duration):
    try:
        duration = int(duration)
        if duration <= 0 or duration > 480:
            return False, "La duración debe estar entre 1 y 480 minutos"
        return True, "Duración válida"
    except (ValueError, TypeError):
        return False, "La duración debe ser un número entero"

def validate_date(date_string, format='%Y-%m-%d'):
    try:
        datetime.strptime(date_string, format)
        return True, "Fecha válida"
    except ValueError:
        return False, f"Formato de fecha inválido. Use {format}"

def validate_priority(priority):
    valid_priorities = ['baja', 'media', 'alta']
    if priority.lower() not in valid_priorities:
        return False, f"Prioridad debe ser una de: {', '.join(valid_priorities)}"
    return True, "Prioridad válida"

def validate_pomodoro_cycles(cycles):
    try:
        cycles = int(cycles)
        if cycles < 1 or cycles > 12:
            return False, "Los ciclos deben estar entre 1 y 12"
        return True, "Número de ciclos válido"
    except (ValueError, TypeError):
        return False, "Los ciclos deben ser un número entero"

def validate_username(username):
    if not username or len(username) < 3:
        return False, "El nombre de usuario debe tener al menos 3 caracteres"
    if not re.match(r"^[a-zA-Z0-9_-]+$", username):
        return False, "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos"
    return True, "Nombre de usuario válido"

def validate_meditation_duration(duration):
    try:
        duration = int(duration)
        if duration < 5 or duration > 120:
            return False, "La duración de meditación debe estar entre 5 y 120 minutos"
        return True, "Duración de meditación válida"
    except (ValueError, TypeError):
        return False, "La duración debe ser un número entero"
