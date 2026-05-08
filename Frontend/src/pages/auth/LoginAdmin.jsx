import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Navigation, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import './LoginAdmin.css';

export default function LoginAdmin() {
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
      const data = await adminService.login(email, password);
      // Guardamos el token con una clave consistente
      localStorage.setItem('routesense_admin_token', data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas o error en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <Navigation size={32} />
        </div>
        
        <div className="login-header">
          <h2>RouteSense Admin</h2>
          <p>Ingrese sus credenciales de despacho</p>
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
              <User size={20} />
              <input 
                type="email" 
                placeholder="admin@routesense.com" 
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
            {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
          </button>
        </form>
        
        <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#cbd5e0' }}>
          &copy; Desarrollado por Jesus Santiago | 3801 | Sistemas Distribuidos
        </p>
      </div>
    </div>
  );
}
