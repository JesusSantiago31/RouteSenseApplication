import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, MapPin, Activity, AlertCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import './LoginAdmin.css';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await adminService.login(email, password);
      // Guardar token y tipo en local storage
      localStorage.setItem('routesense_admin_token', data.access_token);
      
      // Simular delay visual premium
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="glass-card login-card slide-up">
        
        <div className="login-content">
          <div className="brand-icon">
            <Route color="white" size={32} />
          </div>
          
          <h1 className="login-title">RouteSense Admin</h1>
          <p className="login-subtitle">Ingresa a tu centro de control.</p>

          {error && (
            <div className="login-error fade-in">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Correo Institucional</label>
              <input 
                id="email"
                type="email" 
                className="input-field" 
                placeholder="admin@routesense.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Contraseña de Acceso</label>
              <input 
                id="password"
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn-primary btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loader"></div>
                  Autenticando...
                </>
              ) : (
                <>
                  Iniciar Sesión <Activity size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
