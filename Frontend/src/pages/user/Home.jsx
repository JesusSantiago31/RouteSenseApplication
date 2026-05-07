import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker, InfoWindow } from '@react-google-maps/api';
import { routeService } from '../../services/routeService';
import { trackingService } from '../../services/trackingService';
import { fleetService } from '../../services/fleetService';
import { userService } from '../../services/userService';
import { 
  MapPin, Bus, Navigation, Clock, Layers, LocateFixed, Search, X, 
  CheckCircle2, AlertCircle, MapPinned, User, Bell, LogOut, 
  DollarSign, CreditCard, Ticket, Menu 
} from 'lucide-react';
import './UserHome.css';

const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{"color": "#7c93a3"}] },
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

export default function UserHome() {
  const [allRoutes, setAllRoutes] = useState([]);
  const [activeRoutes, setActiveRoutes] = useState({}); // { routeId: details }
  const [busPositions, setBusPositions] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBusData, setSelectedBusData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRequest, setUserRequest] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

  // Inicializar datos y ubicación
  useEffect(() => {
    const init = async () => {
      try {
        const routes = await routeService.getRoutes();
        setAllRoutes(routes);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((p) => {
            const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
            setCurrentPos(pos);
            if (mapRef.current) mapRef.current.panTo(pos);
          });
        }
        
        // Cargar datos de usuario
        const token = localStorage.getItem('routesense_user_token');
        if (token) {
          const profile = await userService.getProfile(token);
          setUserData(profile);
          const requests = await trackingService.getUserRequests(profile.user_id || profile.id);
          if (requests.length > 0) setUserRequest(requests[0]);
        }

        // Cargar buses para mapeo de rutas
        const buses = await fleetService.getBuses();
        setAllBuses(buses);
      } catch (err) {
        console.error("Error init UserHome:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Tracking de buses en tiempo real
  useEffect(() => {
    const fetchPositions = async () => {
      const positions = await trackingService.getLivePositions();
      setBusPositions(positions);
    };
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleRoute = async (routeId) => {
    if (activeRoutes[routeId]) {
      const newActive = { ...activeRoutes };
      delete newActive[routeId];
      setActiveRoutes(newActive);
    } else {
      const details = await routeService.getRouteDetails(routeId);
      setActiveRoutes({ ...activeRoutes, [routeId]: details });
    }
  };

  const requestStop = async () => {
    if (!selectedStop || !currentPos) return;
    try {
      const user = JSON.parse(localStorage.getItem('routesense_user_data'));
      // Buscamos el bus más cercano de la ruta de la parada
      const busOfRoute = busPositions.find(b => b.ruta_id === selectedStop.ruta_id); // Asumiendo que la posición trae ruta_id
      
      const req = await trackingService.requestStop(
        user.user_id || user.id,
        busOfRoute?.bus_id || '00000000-0000-0000-0000-000000000000', // Fallback si no hay bus activo
        selectedStop.parada_id
      );
      setUserRequest(req);
      setSelectedStop(null);
    } catch (err) {
      alert("No se pudo solicitar la parada.");
    }
  };

  const cancelRequest = async () => {
    if (!userRequest) return;
    await trackingService.cancelRequest(userRequest.solicitud_id);
    setUserRequest(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('routesense_user_data');
    localStorage.removeItem('routesense_token');
    window.location.href = '/login';
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

  const handleBusClick = async (pos) => {
    const busInfo = allBuses.find(b => b.bus_id === pos.bus_id);
    if (!busInfo) return;

    let routeDetails = activeRoutes[busInfo.ruta_id];
    if (!routeDetails) {
      routeDetails = await routeService.getRouteDetails(busInfo.ruta_id);
    }

    if (!routeDetails) return;

    // Calcular parada anterior y próxima basada en la posición actual
    const busPos = { lat: parseFloat(pos.latitud), lng: parseFloat(pos.longitud) };
    const stops = routeDetails.paradas.map(s => ({
      ...s,
      dist: calculateDistance(busPos.lat, busPos.lng, parseFloat(s.latitud), parseFloat(s.longitud))
    }));

    // Encontrar la parada más cercana
    const sortedStops = [...stops].sort((a, b) => a.dist - b.dist);
    const closestIdx = routeDetails.paradas.findIndex(s => s.parada_id === sortedStops[0].parada_id);
    
    // Estimación simple: el bus va en orden de paradas
    const lastStop = closestIdx > 0 ? routeDetails.paradas[closestIdx - 1] : null;
    const nextStop = routeDetails.paradas[closestIdx];
    const eta = Math.max(1, Math.round(sortedStops[0].dist / 0.4)); // Aprox 24km/h

    setSelectedBusData({
      pos: busPos,
      plate: busInfo.placa,
      company: busInfo.empresa || 'Empresa Independiente',
      routeName: routeDetails.ruta.nombre,
      start: routeDetails.paradas[0]?.nombre || 'Origen',
      end: routeDetails.paradas[routeDetails.paradas.length - 1]?.nombre || 'Destino',
      lastStop: lastStop?.nombre || 'Iniciando recorrido',
      nextStop: nextStop?.nombre || 'Finalizando recorrido',
      eta: eta || 1,
      color: routeDetails.ruta.color,
      fare: routeDetails.ruta.monto_tarifa,
      fareType: routeDetails.ruta.tipo_tarifa,
      payments: {
        cash: routeDetails.ruta.acepta_efectivo,
        card: routeDetails.ruta.acepta_tarjeta,
        special: routeDetails.ruta.acepta_tarjeta_especial
      }
    });
  };

  const nearbyRoutes = useMemo(() => {
    return allRoutes.map(r => {
      let dist = null;
      if (currentPos && r.origen_lat && r.origen_lng) {
        dist = calculateDistance(currentPos.lat, currentPos.lng, parseFloat(r.origen_lat), parseFloat(r.origen_lng));
      }
      return { ...r, dist };
    }).sort((a, b) => (a.dist || 999) - (b.dist || 999));
  }, [allRoutes, currentPos]);

  const activeRouteIds = useMemo(() => {
    // Mapear bus_id de las posiciones a su ruta_id correspondiente usando la lista de buses completa
    const activeIds = new Set();
    busPositions.forEach(pos => {
      const busInfo = allBuses.find(b => b.bus_id === pos.bus_id);
      if (busInfo?.ruta_id) activeIds.add(busInfo.ruta_id);
    });
    return activeIds;
  }, [busPositions, allBuses]);

  if (loading) return <div className="loading-screen"><div className="loader"></div><p>Localizando transporte...</p></div>;

  return (
    <div className="user-home">
      
      {/* Sidebar de Rutas */}
      <aside className={`route-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Layers size={20} />
          <h3>Rutas Cercanas</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="close-btn"><X size={20} /></button>
        </div>
        <div className="route-list">
          {nearbyRoutes.map(route => {
            const isRouteActive = activeRouteIds.has(route.ruta_id);
            return (
              <div key={route.ruta_id} className={`route-item ${activeRoutes[route.ruta_id] ? 'active' : ''}`} onClick={() => toggleRoute(route.ruta_id)}>
                <div className="route-color" style={{ backgroundColor: route.color }}></div>
                <div className="route-info">
                  <div className="route-top-info">
                    <span className="route-name">{route.nombre}</span>
                    {isRouteActive ? (
                      <span className="status-badge active">En Servicio</span>
                    ) : (
                      <span className="status-badge inactive">Sin Servicio</span>
                    )}
                  </div>
                  <span className="route-dist">
                    {route.dist ? `${route.dist.toFixed(1)} km cerca` : 'Distancia no disponible'}
                  </span>
                </div>
                <div className="route-check">
                  {activeRoutes[route.ruta_id] ? <CheckCircle2 size={18} /> : <div className="circle-placeholder"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mapa */}
      <main className="map-area">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPos || { lat: 20.6597, lng: -103.3496 }}
            zoom={14}
            options={mapOptions}
            onLoad={(map) => mapRef.current = map}
          >
            {/* Ubicación Usuario */}
            {currentPos && (
              <Marker 
                position={currentPos} 
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 3,
                  scale: 8
                }}
              />
            )}

            {/* Rutas Activas */}
            {Object.values(activeRoutes).map(r => (
              <React.Fragment key={r.ruta.ruta_id}>
                <Polyline 
                  path={google.maps.geometry.encoding.decodePath(r.google_polyline)} 
                  options={{ strokeColor: r.ruta.color, strokeWeight: 5, strokeOpacity: 0.6 }} 
                />
                {r.paradas.map((stop, idx) => (
                  <Marker 
                    key={stop.parada_id}
                    position={{ lat: parseFloat(stop.latitud), lng: parseFloat(stop.longitud) }}
                    label={{
                      text: `${idx + 1}. ${stop.nombre}`,
                      color: '#1e293b',
                      fontSize: '11px',
                      fontWeight: '800',
                      className: 'marker-label'
                    }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: stop.color || r.ruta.color,
                      fillOpacity: 1,
                      strokeColor: '#fff',
                      strokeWeight: 2,
                      scale: 8,
                      labelOrigin: new google.maps.Point(0, 3)
                    }}
                    onClick={() => setSelectedStop({ ...stop, ruta_id: r.ruta.ruta_id, route_color: r.ruta.color })}
                  />
                ))}
              </React.Fragment>
            ))}

            {/* Buses en Tiempo Real */}
            {busPositions.map(pos => {
              const busInfo = allBuses.find(b => b.bus_id === pos.bus_id);
              const busColor = busInfo?.color || '#3b82f6';
              
              return (
                <Marker 
                  key={pos.bus_id}
                  position={{ lat: parseFloat(pos.latitud), lng: parseFloat(pos.longitud) }}
                  icon={{
                    url: createBusIcon(busColor),
                    scaledSize: new window.google.maps.Size(40, 48),
                    anchor: new google.maps.Point(20, 48)
                  }}
                  onClick={() => handleBusClick(pos)}
                />
              );
            })}

            {/* Info Window para Parada Seleccionada */}
            {selectedStop && (
              <InfoWindow 
                position={{ lat: parseFloat(selectedStop.latitud), lng: parseFloat(selectedStop.longitud) }}
                onCloseClick={() => setSelectedStop(null)}
              >
                <div className="stop-info-window">
                  <h4>{selectedStop.nombre}</h4>
                  <p>¿Deseas solicitar que el autobús se detenga aquí?</p>
                  <button onClick={requestStop} className="req-stop-btn" style={{ backgroundColor: selectedStop.route_color }}>
                    Solicitar Parada
                  </button>
                </div>
              </InfoWindow>
            )}
            {/* Info Window para Autobús Seleccionado */}
            {selectedBusData && (
              <InfoWindow 
                position={selectedBusData.pos}
                onCloseClick={() => setSelectedBusData(null)}
              >
                <div className="bus-info-window">
                  <div className="bus-window-header" style={{ borderLeft: `4px solid ${selectedBusData.color}` }}>
                    <span className="bus-window-company">{selectedBusData.company}</span>
                    <h4 className="bus-window-route">{selectedBusData.routeName}</h4>
                  </div>
                  <div className="bus-window-body">
                    <div className="bus-meta-row">
                      <Bus size={14} />
                      <span className="bus-plate">Matrícula: <strong>{selectedBusData.plate}</strong></span>
                    </div>
                    <div className="bus-route-path">
                      <div className="path-dot"></div>
                      <div className="path-line"></div>
                      <div className="path-dot"></div>
                      <div className="path-info">
                        <span className="path-point"><strong>Inicio:</strong> {selectedBusData.start}</span>
                        <span className="path-point"><strong>Fin:</strong> {selectedBusData.end}</span>
                      </div>
                    </div>
                    <div className="bus-stops-tracking">
                      <div className="stop-tracking-item">
                        <span className="stop-track-label">Última Parada:</span>
                        <span className="stop-track-value">{selectedBusData.lastStop}</span>
                      </div>
                      <div className="stop-tracking-item next">
                        <div className="next-stop-header">
                          <span className="stop-track-label">Próxima Parada:</span>
                          <span className="eta-badge"><Clock size={10} /> {selectedBusData.eta} min</span>
                        </div>
                        <span className="stop-track-value">{selectedBusData.nextStop}</span>
                      </div>
                    </div>

                    <div className="bus-fare-section">
                      <div className="fare-info">
                        <span className="fare-label">Tarifa {selectedBusData.fareType === 'fija' ? 'Fija' : 'p/ Parada'}:</span>
                        <span className="fare-amount">${selectedBusData.fare}</span>
                      </div>
                      <div className="payment-methods">
                        {selectedBusData.payments.cash && <div className="pay-icon" title="Efectivo"><DollarSign size={12} /></div>}
                        {selectedBusData.payments.card && <div className="pay-icon" title="Tarjeta"><CreditCard size={12} /></div>}
                        {selectedBusData.payments.special && <div className="pay-icon" title="Tarjeta Especial"><Ticket size={12} /></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <p>Cargando mapas...</p>}

        {/* HUD de Usuario */}
        <div className="map-hud">
          <button onClick={() => setIsSidebarOpen(true)} className="hud-btn"><Layers size={22} /></button>
          <button onClick={() => { if(currentPos) mapRef.current.panTo(currentPos); }} className="hud-btn"><LocateFixed size={22} /></button>
        </div>

        {/* Perfil de Usuario y Acciones */}
        <div className="user-profile-header">
          <div className="user-info-card">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-meta">
              <span className="user-welcome">Hola,</span>
              <span className="user-name">{userData?.nombre || 'Usuario'}</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn" title="Notificaciones">
              <Bell size={20} />
              <span className="notification-badge"></span>
            </button>
            <button onClick={handleLogout} className="action-btn logout" title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Panel de Solicitud Activa */}
        {userRequest && (
          <div className="active-request-panel animate-slide-up">
            <div className="req-status-icon"><Clock className="animate-pulse" /></div>
            <div className="req-details">
              <span className="req-label">Parada Solicitada</span>
              <span className="req-value">Esperando Autobús...</span>
            </div>
            <button onClick={cancelRequest} className="cancel-req-btn">Cancelar</button>
          </div>
        )}
      </main>
    </div>
  );
}
