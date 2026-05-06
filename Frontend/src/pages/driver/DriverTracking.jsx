import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { trackingService } from '../../services/trackingService';
import { fleetService } from '../../services/fleetService';
import { routeService } from '../../services/routeService';
import { MapPin, Navigation, Bus, AlertCircle, Play, Square, User as UserIcon, Clock, MapPinned, LocateFixed } from 'lucide-react';

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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
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
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const initData = async () => {
      const driverData = JSON.parse(localStorage.getItem('routesense_driver_data'));
      if (!driverData) return;
      setDriver(driverData);
      
      try {
        const busData = await fleetService.getBusByConductor(driverData.id);
        if (busData) {
          setBus(busData);
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
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (p) => {
            const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
            setCurrentPos(newPos);
            // Centrar mapa suavemente si es la primera vez o si el conductor quiere
            if (mapRef.current && !currentPos) {
              mapRef.current.panTo(newPos);
            }
            trackingService.updateLocation(bus.bus_id, driver.id, newPos.lat, newPos.lng, p.coords.speed || 0);
          },
          (err) => setError("Error GPS: " + err.message),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        setError("Geolocalización no soportada.");
      }
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, [isTracking, bus, driver]);

  const recenterMap = () => {
    if (mapRef.current && currentPos) {
      mapRef.current.panTo(currentPos);
      mapRef.current.setZoom(17);
    }
  };

  const nextStopInfo = useMemo(() => {
    if (!currentPos || !route || !route.paradas || route.paradas.length === 0) return null;
    const distances = route.paradas.map(stop => ({
      ...stop,
      dist: calculateDistance(currentPos.lat, currentPos.lng, stop.latitud, stop.longitud)
    }));
    const closest = [...distances].sort((a, b) => a.dist - b.dist)[0];
    const eta = Math.max(1, Math.round(closest.dist / 0.3));
    return { ...closest, eta };
  }, [currentPos, route]);

  if (loading) return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Sincronizando Sistema...</p>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-900 relative flex flex-col overflow-hidden font-sans">
      
      {/* Header Conductor */}
      <header className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white pointer-events-auto">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: route?.ruta?.color || '#005cc8' }}>
             <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Operador</p>
            <h1 className="text-sm font-bold text-slate-800">{driver?.nombre}</h1>
          </div>
        </div>
      </header>

      {/* Mapa Principal */}
      <main className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPos || { lat: 20.6597, lng: -103.3496 }}
            zoom={16}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {route?.google_polyline && (
              <Polyline 
                path={google.maps.geometry.encoding.decodePath(route.google_polyline)} 
                options={{ 
                  strokeColor: route?.ruta?.color || '#005cc8', 
                  strokeWeight: 8,
                  strokeOpacity: 0.8
                }} 
              />
            )}

            {route?.paradas?.map((stop, idx) => (
              <Marker
                key={stop.parada_id}
                position={{ lat: parseFloat(stop.latitud), lng: parseFloat(stop.longitud) }}
                label={{ text: (idx + 1).toString(), color: 'white', fontSize: '10px', fontWeight: 'bold' }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: stop.color || route?.ruta?.color || '#3498db',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                  scale: 12,
                }}
              />
            ))}

            {currentPos && (
              <Marker 
                position={currentPos} 
                zIndex={1000}
                icon={{ 
                  path: window.google ? google.maps.SymbolPath.FORWARD_CLOSED_ARROW : 0, 
                  fillColor: '#005cc8', 
                  fillOpacity: 1, 
                  strokeColor: '#FFF', 
                  strokeWeight: 3, 
                  scale: 12,
                  rotation: 0 
                }} 
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <p className="text-slate-300 font-black uppercase text-xs">Cargando Mapas...</p>
          </div>
        )}

        {/* Botón Recapitular Ubicación */}
        <button 
          onClick={recenterMap}
          className="absolute right-6 top-6 z-10 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 border border-slate-100"
        >
          <LocateFixed size={24} />
        </button>

        {/* Panel Inferior de Navegación */}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-[45px] p-7 shadow-2xl border border-white/50 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
            
            {/* Lado Izquierdo: Bus y Estado */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: bus?.color || '#e67e22' }}>
                    <Bus size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg uppercase leading-none mb-1">{bus?.placa || 'Cargando...'}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{bus?.empresa || 'Rutasense Fleet'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTracking(!isTracking)} 
                  className={`px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.15em] transition-all transform active:scale-95 shadow-2xl ${
                    isTracking 
                      ? 'bg-red-500 text-white shadow-red-500/30' 
                      : 'bg-primary text-white shadow-primary/30 hover:scale-105'
                  }`}
                >
                  {isTracking ? 'Finalizar' : 'Iniciar'}
                </button>
              </div>
              
              <div className="p-5 rounded-[30px] border border-slate-100 relative overflow-hidden bg-slate-50/50">
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: route?.ruta?.color || '#005cc8' }}></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Servicio Activo</p>
                <h4 className="font-black text-slate-800 text-base truncate ml-2">{route?.ruta?.nombre || 'Buscando Ruta Asignada...'}</h4>
              </div>
            </div>

            {/* Divisor Visual */}
            <div className="hidden lg:block w-px bg-slate-100/80" />

            {/* Lado Derecho: Próxima Parada y Destino */}
            <div className="flex-[1.5] grid grid-cols-1 md:grid-cols-2 gap-6">
              {nextStopInfo ? (
                <>
                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shadow-inner"><MapPinned size={22} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próxima Parada</p>
                        <h4 className="font-black text-slate-800 text-base leading-tight">{nextStopInfo.nombre}</h4>
                      </div>
                    </div>
                    <div className="flex gap-6 pl-2">
                       <div className="flex items-center gap-2.5">
                         <Navigation size={16} className="text-slate-300" />
                         <p className="font-black text-sm text-slate-600">{nextStopInfo.dist.toFixed(1)} <span className="text-[10px] text-slate-400">KM</span></p>
                       </div>
                       <div className="flex items-center gap-2.5">
                         <Clock size={16} className="text-slate-300" />
                         <p className="font-black text-sm text-primary">{nextStopInfo.eta} <span className="text-[10px] text-primary/60">MIN</span></p>
                       </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[35px] p-6 text-white flex flex-col justify-center relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 relative z-10">Destino Final</p>
                    <h4 className="font-black text-sm tracking-tight relative z-10">
                      {route?.paradas && route.paradas.length > 0 
                        ? route.paradas[route.paradas.length - 1].nombre 
                        : 'Fin de Trayecto'}
                    </h4>
                    <div className="mt-3 w-12 h-1 rounded-full bg-white/20 relative z-10" style={{ backgroundColor: (route?.ruta?.color || '#005cc8') + '50' }}>
                       <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: route?.ruta?.color || '#005cc8' }}></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center text-slate-300 p-8 border-2 border-dashed border-slate-100 rounded-[35px]">
                  <AlertCircle size={32} className="mb-3 opacity-20" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center italic">
                    {isTracking ? "Calculando ruta..." : "Inicia el servicio para ver tu trayecto"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
