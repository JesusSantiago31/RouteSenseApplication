import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapDashboard from './MapDashboard';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('routesense_admin_token')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-white/40">
      <MapDashboard />
    </div>
  );
}
