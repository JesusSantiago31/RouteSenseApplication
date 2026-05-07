import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { trackingService } from '../../services/trackingService';
import { fleetService } from '../../services/fleetService';
import { routeService } from '../../services/routeService';
import { MapPin, Navigation, Bus, AlertCircle, Play, Square, User as UserIcon, Clock, MapPinned, LocateFixed } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false, // Quitamos zoom control nativo para limpiar la UI móvil
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
      
      // Ubicación inicial inmediata
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
            setCurrentPos(pos);
            if (mapRef.current) mapRef.current.panTo(pos);
          },
          (err) => console.log("GPS inicial denegado:", err),
          { enableHighAccuracy: true }
        );
      }

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
        setError("Error al sincronizar con tu unidad."); 
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
            trackingService.updateLocation(bus.bus_id, driver.id, newPos.lat, newPos.lng, p.coords.speed || 0);
          },
          (err) => setError("Error GPS: " + err.message),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
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

  const createBusIcon = (color) => {
    const svg = `
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 48C20 48 40 32.5 40 18C40 8.05888 31.0457 0 20 0C8.9543 0 0 8.05888 0 18C0 32.5 20 48 20 48Z" fill="${color}"/>
        <circle cx="20" cy="18" r="15" fill="white"/>
        <path d="M27,16H13c-1.1,0-2,0.9-2,2v7c0,1.1,0.9,2,2,2h1v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1h4v1c0,0.6,0.4,1,1,1h1 c0.6,0,1-0.4,1-1v-1h1c1.1,0,2-0.9,2-2v-7C29,16.9,28.1,16,27,16z M17,24c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1s1,0.4,1,1 C18,23.6,17.6,24,17,24z M23,24c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1s1,0.4,1,1C24,23.6,23.6,24,23,24z M27,21H13v-3h14V21z" fill="${color}"/>
      </svg>
    `.replace(/\s+/g, ' ');
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const nextStopInfo = useMemo(() => {
    if (!currentPos || !route || !route.paradas || route.paradas.length === 0) return null;
    const distances = route.paradas.map(stop => ({
      ...stop,
      dist: calculateDistance(currentPos.lat, currentPos.lng, parseFloat(stop.latitud), parseFloat(stop.longitud))
    }));
    const closest = [...distances].sort((a, b) => a.dist - b.dist)[0];
    const eta = Math.max(1, Math.round(closest.dist / 0.3));
    return { ...closest, eta };
  }, [currentPos, route]);

  if (loading) return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Iniciando Sistemas de Navegación...</p>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-900 relative flex flex-col overflow-hidden font-sans">
      
      {/* Header Conductor - Responsivo */}
      <header className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-2xl flex items-center gap-3 md:gap-4 border border-white pointer-events-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: route?.ruta?.color || '#005cc8' }}>
             <UserIcon size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Conductor</p>
            <h1 className="text-xs md:text-sm font-bold text-slate-800">{driver?.nombre}</h1>
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
                  strokeWeight: 6,
                  strokeOpacity: 0.8
                }} 
              />
            )}

            {route?.paradas?.map((stop, idx) => (
              <Marker
                key={stop.parada_id}
                position={{ lat: parseFloat(stop.latitud), lng: parseFloat(stop.longitud) }}
                label={{ text: (idx + 1).toString(), color: 'white', fontSize: '9px', fontWeight: 'bold' }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: stop.color || route?.ruta?.color || '#3498db',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                  scale: 10,
                }}
              />
            ))}

            {currentPos && (
              <Marker 
                position={currentPos} 
                zIndex={1000}
                icon={{ 
                  url: createBusIcon(bus?.color || '#005cc8'),
                  scaledSize: new window.google.maps.Size(40, 48),
                  anchor: new google.maps.Point(20, 48)
                }} 
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <p className="text-slate-300 font-black uppercase text-[10px]">Cargando...</p>
          </div>
        )}

        {/* Botón Recapitular - Responsivo */}
        <button 
          onClick={recenterMap}
          className="absolute right-4 top-4 md:right-6 md:top-6 z-10 w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 border border-slate-100"
        >
          <LocateFixed size={20} className="md:w-6 md:h-6" />
        </button>

        {/* Panel Inferior de Navegación - Responsivo */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-[30px] md:rounded-[45px] p-5 md:p-7 shadow-2xl border border-white/50 max-w-5xl mx-auto flex flex-col lg:flex-row gap-5 md:gap-8">
            
            {/* Lado Izquierdo: Bus y Estado */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl text-white shadow-xl flex items-center justify-center" style={{ backgroundColor: bus?.color || '#e67e22' }}>
                    <Bus size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base md:text-lg uppercase leading-none mb-1">{bus?.placa || 'Autobús'}</h3>
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{bus?.empresa || 'Empresa'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTracking(!isTracking)} 
                  className={`px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl ${
                    isTracking 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-primary text-white shadow-primary/20 hover:scale-105'
                  }`}
                >
                  {isTracking ? 'Parar' : 'Iniciar'}
                </button>
              </div>
              
              <div className="p-4 rounded-2xl md:rounded-[30px] border border-slate-100 relative overflow-hidden bg-slate-50/50">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: route?.ruta?.color || '#005cc8' }}></div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Servicio</p>
                <h4 className="font-black text-slate-800 text-sm md:text-base truncate ml-2">{route?.ruta?.nombre || 'Buscando Ruta...'}</h4>
              </div>
            </div>

            {/* Divisor Visual */}
            <div className="hidden lg:block w-px bg-slate-100/80" />

            {/* Lado Derecho: Próxima Parada y Destino */}
            <div className="flex-[1.5] grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {nextStopInfo ? (
                <>
                  <div className="space-y-3 md:space-y-4 flex flex-col justify-center">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2.5 md:p-3.5 bg-primary/10 rounded-xl md:rounded-2xl text-primary shadow-inner"><MapPinned size={18} className="md:w-6 md:h-6" /></div>
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Próxima</p>
                        <h4 className="font-black text-slate-800 text-sm md:text-base leading-tight">{nextStopInfo.nombre}</h4>
                      </div>
                    </div>
                    <div className="flex gap-4 md:gap-6 pl-1 md:pl-2">
                       <div className="flex items-center gap-2">
                         <Navigation size={14} className="text-slate-300 md:w-4 md:h-4" />
                         <p className="font-black text-xs md:text-sm text-slate-600">{nextStopInfo.dist.toFixed(1)} <span className="text-[8px] md:text-[10px] text-slate-400 uppercase">KM</span></p>
                       </div>
                       <div className="flex items-center gap-2">
                         <Clock size={14} className="text-slate-300 md:w-4 md:h-4" />
                         <p className="font-black text-xs md:text-sm text-primary">{nextStopInfo.eta} <span className="text-[8px] md:text-[10px] text-primary/60 uppercase">MIN</span></p>
                       </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[25px] md:rounded-[35px] p-4 md:p-6 text-white flex flex-col justify-center relative overflow-hidden group shadow-2xl min-h-[90px]">
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full -mr-8 -mt-8 md:-mr-12 md:-mt-12 transition-transform group-hover:scale-150" />
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 relative z-10">Destino Final</p>
                    <h4 className="font-black text-xs md:text-sm tracking-tight relative z-10">
                      {route?.paradas && route.paradas.length > 0 
                        ? route.paradas[route.paradas.length - 1].nombre 
                        : 'Final de línea'}
                    </h4>
                    <div className="mt-2 md:mt-3 w-10 md:w-12 h-1 rounded-full bg-white/20 relative z-10" style={{ backgroundColor: (route?.ruta?.color || '#005cc8') + '50' }}>
                       <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: route?.ruta?.color || '#005cc8' }}></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center text-slate-300 p-6 border-2 border-dashed border-slate-100 rounded-[25px] md:rounded-[35px]">
                  <AlertCircle size={24} className="mb-2 opacity-20" />
                  <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-center italic">
                    {isTracking ? "Calculando ruta..." : "Inicia el servicio para ver el trayecto"}
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
