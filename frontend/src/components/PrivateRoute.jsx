// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUsuario } from '../services/auth'; // Función que obtiene el usuario autenticado

// PrivateRoute now uses children so it works with <PrivateRoute><Page/></PrivateRoute>
const PrivateRoute = ({ children }) => {
  const usuario = getUsuario(); // Verifica si el usuario está autenticado

  // Si no está autenticado, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los children
  return children;
};

export default PrivateRoute;
