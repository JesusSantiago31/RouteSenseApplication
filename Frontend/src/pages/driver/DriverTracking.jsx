import React, { useState, useEffect } from 'react';
import { trackingService } from '../../services/trackingService';
import { fleetService } from '../../services/fleetService';
import { MapPin, Navigation, Bus, AlertCircle } from 'lucide-react';

export default function DriverTracking() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuses = async () => {
      const data = await fleetService.getBuses();
      setBuses(data);
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    let watchId = null;

    if (isTracking && selectedBus) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            setCurrentPos({ lat: latitude, lng: longitude });
            
            // Enviar al backend
            const busData = buses.find(b => String(b.bus_id) === String(selectedBus));
            if (busData) {
                trackingService.updateLocation(
                  selectedBus, 
                  busData.conductor_id || '00000000-0000-0000-0000-000000000000', 
                  latitude, 
                  longitude, 
                  speed || 0
                ).catch(err => console.error("Error sending location:", err));
            }
          },
          (err) => setError(err.message),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        setError("Geolocalización no soportada");
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, selectedBus, buses]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-primary/20 rounded-2xl text-primary">
            <Bus size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Modo Conductor</h1>
            <p className="text-slate-400 text-sm">Transmisión en tiempo real</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Selecciona tu Autobús</label>
            <select 
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              disabled={isTracking}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="">-- Elige una unidad --</option>
              {buses.map(bus => (
                <option key={bus.bus_id} value={bus.bus_id}>
                  {bus.placa} - {bus.empresa}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsTracking(!isTracking)}
            disabled={!selectedBus}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' 
                : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale'
            }`}
          >
            {isTracking ? (
              <>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                Detener Transmisión
              </>
            ) : (
              <>
                <Navigation size={22} />
                Iniciar Recorrido
              </>
            )}
          </button>

          {isTracking && currentPos && (
            <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ubicación Actual</p>
                  <p className="text-sm font-mono text-slate-300">
                    {currentPos.lat.toFixed(6)}, {currentPos.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Estado</p>
                <p className="text-sm text-green-400 font-bold">En Línea</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-slate-500 text-sm text-center max-w-xs">
        Mantén esta pantalla abierta durante tu recorrido para que los pasajeros puedan ver tu ubicación.
      </p>
    </div>
  );
}
