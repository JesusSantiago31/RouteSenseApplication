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
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="RouteSense" className="w-full h-full object-contain" />
        </div>
        
        <div className="login-header">
          <h2>Bienvenido a RouteSense</h2>
          <p>Tu viaje inteligente comienza aquí</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input 
                type="email" 
                placeholder="usuario@routesense.app" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-switch-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>¿No tienes cuenta? <Link to="/register" style={{ color: '#005cc8', fontWeight: 'bold' }}>Regístrate gratis</Link></p>
        </div>
        
        <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#cbd5e0', textAlign: 'center' }}>
          &copy; Desarrollado por Jesus Santiago | 3801 | Sistemas Distribuidos
        </p>
      </div>
    </div>
  );
}
