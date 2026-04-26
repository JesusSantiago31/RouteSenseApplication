import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay token, lo mandamos a login
    if (!localStorage.getItem('routesense_admin_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('routesense_admin_token');
    navigate('/login');
  };

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Panel Principal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bienvenido, administrador de RouteSense.</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>

      <div className="glass-card slide-up" style={{ padding: '40px', textAlign: 'center' }}>
        <Activity size={48} color="var(--accent)" style={{ marginBottom: '20px', opacity: 0.8 }} />
        <h2>Autenticación Exitosa</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          El enlace con tu API de <strong>Render</strong> está funcionando de maravilla.
          Pronto construiremos aquí el panel de control de Autobuses, Conductores y Rutas.
        </p>
      </div>
      
    </div>
  );
}
