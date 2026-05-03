import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente para proteger rutas basado en roles o autenticación.
 * Por ahora es un ejemplo básico que puedes expandir.
 */
const ProtectedRoute = ({ isAllowed, redirectTo = "/login", children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
