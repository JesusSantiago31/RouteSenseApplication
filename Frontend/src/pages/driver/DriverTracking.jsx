import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { trackingService } from '../../services/trackingService';
import { fleetService } from '../../services/fleetService';
import { routeService } from '../../services/routeService';
import { MapPin, Navigation, Bus, AlertCircle, Play, Square, User as UserIcon, Clock, MapPinned } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{"color": "#7c93a3"}] },
    { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{"visibility": "off"}] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#f5f7f9"}] }
  ]
};

// Función para calcular distancia entre dos coordenadas (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function DriverTracking() {
  const [driver, setDriver] = useState(null);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

  useEffect(() => {
    const initData = async () => {
      const driverData = JSON.parse(localStorage.getItem('routesense_driver_data'));
      if (!driverData) return;
      setDriver(driverData);
      
      try {
        // 1. Obtener Bus asignado al conductor
        const busData = await fleetService.getBusByConductor(driverData.id);
        if (busData) {
          setBus(busData);
          
          // 2. Obtener la ruta asignada a ese bus
          // El objeto busData ya trae el campo ruta_id
          if (busData.ruta_id) {
            const details = await routeService.getRouteDetails(busData.ruta_id);
            setRoute(details);
          }
        }
      } catch (err) { 
        console.error("Error initData:", err);
        setError("No se pudo cargar la información de tu unidad."); 
      }
      finally { setLoading(false); }
    };
    initData();
  }, []);

  useEffect(() => {
    let watchId = null;
    if (isTracking && bus && driver) {
      watchId = navigator.geolocation.watchPosition(
        (p) => {
          const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          setCurrentPos(newPos);
          trackingService.updateLocation(bus.bus_id, driver.id, newPos.lat, newPos.lng, p.coords.speed || 0);
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true }
      );
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, [isTracking, bus, driver]);

  // Cálculo de próxima parada
  const nextStopInfo = useMemo(() => {
    if (!currentPos || !route || !route.paradas || route.paradas.length === 0) return null;
    
    const distances = route.paradas.map(stop => ({
      ...stop,
      dist: calculateDistance(currentPos.lat, currentPos.lng, stop.latitud, stop.longitud)
    }));
    
    // Filtramos paradas que estén a menos de 50 metros para considerarlas "pasadas" o simplemente buscamos la más cercana hacia adelante
    // Por simplicidad, tomamos la más cercana
    const closest = distances.sort((a, b) => a.dist - b.dist)[0];
    const eta = Math.round(closest.dist / 0.3); // Estimación simple (18km/h prom)
    
    return { ...closest, eta };
  }, [currentPos, route]);

  if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="h-screen w-screen bg-slate-900 relative flex flex-col overflow-hidden">
      {/* Cabecera Superior - Restaurada */}
      <header className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl flex items-center gap-4 border border-white pointer-events-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
             <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Conductor</p>
            <h1 className="text-sm font-bold text-slate-800">{driver?.nombre}</h1>
          </div>
        </div>
      </header>

      {/* Mapa */}
      <main className="flex-1">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPos || { lat: 20.6597, lng: -103.3496 }}
            zoom={16}
            options={mapOptions}
          >
            {route?.google_polyline && (
              <Polyline path={google.maps.geometry.encoding.decodePath(route.google_polyline)} options={{ strokeColor: route.color || '#005cc8', strokeWeight: 6 }} />
            )}
            {currentPos && (
              <Marker position={currentPos} icon={{ path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, fillColor: '#005cc8', fillOpacity: 1, strokeColor: '#FFF', strokeWeight: 2, scale: 8 }} />
            )}
          </GoogleMap>
        )}

        {/* Panel de Navegación Inferior */}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="bg-white rounded-[40px] p-6 shadow-2xl border border-slate-100 max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
            
            {/* Info Unidad y Ruta */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-500"><Bus size={20} /></div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase">{bus?.placa || 'Sin Unidad'}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bus?.empresa || 'Rutasense'}</p>
                  </div>
                </div>
                <button onClick={() => setIsTracking(!isTracking)} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isTracking ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                  {isTracking ? 'Detener' : 'Iniciar'}
                </button>
              </div>
              <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ruta Actual</p>
                <h4 className="font-bold text-slate-800 truncate">{route?.nombre || 'Buscando Ruta...'}</h4>
              </div>
            </div>

            {/* Divisor */}
            <div className="hidden md:block w-px bg-slate-100" />

            {/* Info Próxima Parada */}
            <div className="flex-1 flex flex-col justify-center gap-4">
              {nextStopInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary"><MapPinned size={20} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Próxima Parada</p>
                        <h4 className="font-bold text-slate-800">{nextStopInfo.nombre}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                       <Navigation size={16} className="text-primary" />
                       <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase">Distancia</p>
                         <p className="font-bold text-xs">{nextStopInfo.dist.toFixed(2)} KM</p>
                       </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                       <Clock size={16} className="text-primary" />
                       <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase">Tiempo Est.</p>
                         <p className="font-bold text-xs">{nextStopInfo.eta} MIN</p>
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase italic">
                  Esperando señal GPS...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
