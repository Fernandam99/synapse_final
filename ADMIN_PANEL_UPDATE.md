# Actualización del Panel de Administrador (Noviembre 2025)

## Cambios principales

### Backend
- Se agregó el archivo `backend/app/routes/admin_routes.py` con endpoints para administración:
  - `GET /api/admin/usuarios`: Devuelve la lista de usuarios y sus tareas. Si un usuario no tiene tareas, se crean automáticamente dos tareas de ejemplo para que el panel admin siempre muestre datos.
  - `POST /api/admin/usuarios/<id>/desactivar`: Permite desactivar usuarios.
  - `PUT /api/admin/usuarios/<id>`: Permite editar datos básicos de usuarios (username, correo, rol, activo, celular, avatar).
- Los endpoints están protegidos con JWT y sólo accesibles para usuarios con `rol_id == 1` (admin).
- Las tareas de ejemplo se crean sólo si el usuario no tiene ninguna tarea registrada.

### Frontend
- Se modificó `frontend/src/pages/AdminPanel.jsx`:
  - Ahora muestra un botón "Ver tareas" por usuario, que expande una lista con las tareas de ese usuario.
  - Si el usuario no tiene tareas, se muestra el mensaje "No hay tareas".
  - Los datos de tareas se obtienen directamente del backend y se actualizan en tiempo real.

## Cómo probar
1. Inicia el backend:
   ```powershell
   cd backend
   py run.py
   ```
2. Inicia el frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Ingresa al panel de admin en `/admin` y autentícate como usuario admin.
4. Verás la lista de usuarios y, al expandir, las tareas de cada uno. Si no tenían tareas, verás las de ejemplo.

## Notas
- Los endpoints de admin requieren autenticación JWT y rol de administrador.
- Las tareas de ejemplo sólo se crean la primera vez que se consulta el endpoint y sólo para usuarios sin tareas.
- Si necesitas crear un usuario admin, puedes hacerlo por la API y luego cambiar su `rol_id` en la base de datos.

---
Actualización realizada por solicitud para mostrar tareas de todos los usuarios en el panel de administración y facilitar la gestión desde la interfaz web.
