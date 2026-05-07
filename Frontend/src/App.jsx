import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginAdmin from './pages/auth/LoginAdmin';
import LoginConductor from './pages/auth/LoginConductor';
import LoginUser from './pages/auth/LoginUser';
import RegisterUser from './pages/auth/RegisterUser';
import Dashboard from './pages/admin/Dashboard';
import UserHome from './pages/user/Home';
import DriverTracking from './pages/driver/DriverTracking';
import ProtectedRoute from './routes/ProtectedRoute';

import { Toaster } from 'react-hot-toast';

export default function App() {
  const isAdmin = !!localStorage.getItem('routesense_admin_token');
  const isUser = !!localStorage.getItem('routesense_user_token');
  const isDriver = !!localStorage.getItem('routesense_driver_token');

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login/user" replace />} />

        {/* Rutas Públicas/Auth */}
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/login/user" element={<LoginUser />} />
        <Route path="/login/driver" element={<LoginConductor />} />
        <Route path="/register" element={<RegisterUser />} />

        {/* Rutas de Administrador Protegidas */}
        <Route element={<ProtectedRoute isAllowed={isAdmin} redirectTo="/login" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>

        {/* Rutas de Usuario Protegidas */}
        <Route element={<ProtectedRoute isAllowed={isUser} redirectTo="/login/user" />}>
          <Route path="/app/home" element={<UserHome />} />
        </Route>

        {/* Rutas de Conductor Protegidas */}
        <Route element={<ProtectedRoute isAllowed={true} redirectTo="/login/driver" />}>
           <Route path="/driver/tracking" element={<DriverTracking />} />
        </Route>

        {/* 404 - Opcional */}
        <Route path="*" element={<div style={{ padding: '2rem' }}>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
