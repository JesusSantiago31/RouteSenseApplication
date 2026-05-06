import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginAdmin from './pages/auth/LoginAdmin';
import LoginConductor from './pages/auth/LoginConductor';
import Dashboard from './pages/admin/Dashboard';
import UserHome from './pages/user/Home';
import DriverTracking from './pages/driver/DriverTracking';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  // Simulación de estado de autenticación (esto lo conectarás a tu context/store después)
  const isAdmin = !!localStorage.getItem('routesense_admin_token');
  const isUser = true; // Por ahora permitimos usuario para pruebas

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas Públicas/Auth */}
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/login/driver" element={<LoginConductor />} />

        {/* Rutas de Administrador Protegidas */}
        <Route element={<ProtectedRoute isAllowed={isAdmin} redirectTo="/login" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          {/* Agrega más rutas de admin aquí */}
        </Route>

        {/* Rutas de Usuario Protegidas */}
        <Route element={<ProtectedRoute isAllowed={isUser} redirectTo="/login" />}>
          <Route path="/app/home" element={<UserHome />} />
          <Route path="/driver/tracking" element={<DriverTracking />} />
        </Route>

        {/* 404 - Opcional */}
        <Route path="*" element={<div style={{ padding: '2rem' }}>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
