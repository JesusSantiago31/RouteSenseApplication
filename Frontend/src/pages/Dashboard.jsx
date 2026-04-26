import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import MapDashboard from './MapDashboard';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('routesense_admin_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('routesense_admin_token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'var(--glass-bg)', borderRadius: '12px', marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>RouteSense Maps</h1>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px 16px' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MapDashboard />
      </div>
    </div>
  );
}
