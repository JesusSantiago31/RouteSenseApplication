import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bus, IdCard, AlertCircle } from 'lucide-react';
import { fleetService } from '../../services/fleetService';
import './LoginAdmin.css';

export default function LoginConductor() {
  const [formData, setFormData] = useState({ matricula: '', nombre: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await fleetService.loginDriver(formData.matricula, formData.nombre, formData.password);
      localStorage.setItem('routesense_driver_token', data.access_token);
      localStorage.setItem('routesense_driver_data', JSON.stringify(data.conductor));
      navigate('/driver/tracking');
    } catch (err) {
      setError(err.message || 'Error al autenticar. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo" style={{ background: '#e67e22' }}>
          <Bus size={32} />
        </div>
        
        <div className="login-header">
          <h2>RouteSense Conductor</h2>
          <p>Ingrese sus credenciales de servicio</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Número de Matrícula</label>
            <div className="input-wrapper">
              <IdCard size={20} />
              <input 
                type="text" 
                placeholder="LIC-123456" 
                value={formData.matricula}
                onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Nombre Completo</label>
            <div className="input-wrapper">
              <User size={20} />
              <input 
                type="text" 
                placeholder="Juan Pérez" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" style={{ background: 'linear-gradient(90deg, #e67e22, #f39c12)' }} disabled={loading}>
            {loading ? 'Validando...' : 'Iniciar Recorrido'}
          </button>
        </form>
        
        <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#cbd5e0' }}>
           &copy; Desarrollado por Jesus Santiago | 3801 | Sistemas Distribuidos
        </p>
      </div>
    </div>
  );
}
