import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUsuario } from '../services/auth';

// PublicRoute: if the user is authenticated, redirect to /dashboard
export default function PublicRoute({ children }) {
  const usuario = getUsuario();

  if (usuario) {
    // If logged in, redirect to dashboard and replace history entry so Back won't return here
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
