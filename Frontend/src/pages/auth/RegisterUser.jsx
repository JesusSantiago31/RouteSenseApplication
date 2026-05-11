import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Navigation, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { userService } from '../../services/userService';
import logo from '../../assets/logo.png';
import './AuthUser.css';

export default function RegisterUser() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await userService.register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login/user'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la cuenta. Intente con otro correo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-user-page">
        <div className="auth-container">
          <div className="auth-card success-card">
            <div className="success-icon animate-bounce">
              <CheckCircle2 size={64} className="text-emerald-500" />
            </div>
            <h2>¡Registro Exitoso!</h2>
            <p>Tu cuenta ha sido creada. Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-logo">
          <img src={logo} alt="RouteSense" className="w-full h-full object-contain" />
        </div>
        
        <div className="login-header">
          <h2>Únete a RouteSense</h2>
          <p>Crea tu cuenta para empezar a viajar mejor</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="auth-row">
            <div className="input-group">
              <label>Nombre</label>
              <div className="input-wrapper">
                <User size={20} />
                <input 
                  name="nombre"
                  type="text" 
                  placeholder="Juan" 
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <div className="input-wrapper">
                <User size={20} />
                <input 
                  name="apellido"
                  type="text" 
                  placeholder="Pérez" 
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input 
                name="email"
                type="email" 
                placeholder="usuario@routesense.app" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input 
                name="password"
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-switch-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>¿Ya tienes cuenta? <Link to="/login/user" style={{ color: '#005cc8', fontWeight: 'bold' }}>Inicia Sesión</Link></p>
        </div>
        
        <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#cbd5e0', textAlign: 'center' }}>
          &copy; Desarrollado por Jesus Santiago | 3801 | Sistemas Distribuidos
        </p>
      </div>
    </div>
  );
}
