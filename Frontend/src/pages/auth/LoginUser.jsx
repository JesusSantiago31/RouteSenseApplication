import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Navigation, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { userService } from '../../services/userService';
import logo from '../../assets/logo.png';
import './AuthUser.css';

export default function LoginUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await userService.login(email, password);
      localStorage.setItem('routesense_user_token', data.access_token);
      navigate('/app/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-user-page">
      {/* Background Decor */}
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={logo} alt="RouteSense" className="w-full h-full object-contain" />
            </div>
            <h1>Bienvenido a RouteSense</h1>
            <p>Tu viaje inteligente comienza aquí</p>
          </div>

          {error && (
            <div className="auth-error animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-input-group">
              <label>Correo Electrónico</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input 
                  type="email" 
                  placeholder="ejemplo@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Contraseña</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <div className="loader-small"></div>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿No tienes cuenta?</p>
            <Link to="/register" className="auth-link">
              <UserPlus size={16} />
              <span>Regístrate gratis</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
