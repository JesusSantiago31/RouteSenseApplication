import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Navigation, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { userService } from '../../services/userService';
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
    <div className="auth-user-page">
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={logo} alt="RouteSense" className="w-full h-full object-contain" />
            </div>
            <h1>Únete a RouteSense</h1>
            <p>Crea tu cuenta para empezar a viajar mejor</p>
          </div>

          {error && (
            <div className="auth-error animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-row">
              <div className="auth-input-group">
                <label>Nombre</label>
                <div className="auth-input-wrapper">
                  <User size={18} />
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
              <div className="auth-input-group">
                <label>Apellido</label>
                <div className="auth-input-wrapper">
                  <User size={18} />
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

            <div className="auth-input-group">
              <label>Correo Electrónico</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input 
                  name="email"
                  type="email" 
                  placeholder="ejemplo@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Contraseña</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
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

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <div className="loader-small"></div>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿Ya tienes cuenta?</p>
            <Link to="/login/user" className="auth-link">
              <span>Inicia Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
