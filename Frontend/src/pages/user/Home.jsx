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

const LIBRARIES = ['geometry'];

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
    libraries: LIBRARIES
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
        const profile = await userService.getProfile();
        console.log("Perfil cargado:", profile);
        if (profile) {
          setUserData(profile);
          const requests = await trackingService.getUserRequests(profile.user_id || profile.id);
          if (requests && requests.length > 0) setUserRequest(requests[0]);
        }

        // Cargar buses iniciales
        const buses = await fleetService.getBuses();
        if (buses) setAllBuses(buses);
      } catch (err) {
        console.error("Error init UserHome:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [filterEstado, setFilterEstado] = useState('Todos');

  // Tracking de buses en tiempo real (Puro y constante)
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const positions = await trackingService.getLivePositions();
        setBusPositions(positions);
      } catch (err) {
        console.error("Error tracking:", err);
      }
    };
    
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Autodescubrimiento de metadatos (Separado para no bloquear el tracking)
  useEffect(() => {
    const discoverBuses = async () => {
      for (const pos of busPositions) {
        const exists = allBuses.find(b => String(b.bus_id).toLowerCase() === String(pos.bus_id).toLowerCase());
        if (!exists && pos.conductor_id) {
          fleetService.getBusByConductor(pos.conductor_id).then(busData => {
            if (busData) {
              setAllBuses(prev => {
                if (prev.some(b => String(b.bus_id).toLowerCase() === String(busData.bus_id).toLowerCase())) return prev;
                return [...prev, busData];
              });
            }
          });
        }
      }
    };
    if (busPositions.length > 0) discoverBuses();
  }, [busPositions, allBuses.length]);

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

  const requestStop = async (tipo = 'subir') => {
    if (!selectedStop || !userData) return;
    try {
      // Intentar encontrar el bus asociado a la parada o el primero disponible
      const busId = selectedBusData?.bus_id || busPositions[0]?.bus_id || '00000000-0000-0000-0000-000000000000';

      const req = await trackingService.requestStop(
        userData.user_id || userData.id,
        busId,
        selectedStop.parada_id,
        tipo
      );
      setUserRequest(req);
      setSelectedStop(null);
      alert(`Solicitud de ${tipo === 'subir' ? 'subida' : 'bajada'} enviada con éxito.`);
    } catch (err) {
      console.error("Error al solicitar parada:", err);
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
    console.log("Bus clicked:", pos.bus_id, "Current buses in state:", allBuses.length);
    
    // 1. EXTRAER INFORMACIÓN DESDE EL VÍNCULO DEL CONDUCTOR (Como en el panel de conductor)
    let busInfo = allBuses.find(b => String(b.bus_id).toLowerCase() === String(pos.bus_id).toLowerCase());
    
    if (!busInfo && pos.conductor_id) {
      console.log("Buscando bus por vínculo de conductor:", pos.conductor_id);
      busInfo = await fleetService.getBusByConductor(pos.conductor_id);
    }
    
    if (!busInfo) {
      busInfo = {
        bus_id: pos.bus_id,
        ruta_id: pos.ruta_id, 
        placa: 'En tránsito',
        empresa: 'RutaSense Fleet',
        color: '#3b82f6'
      };
    }

    const busPos = { lat: parseFloat(pos.latitud), lng: parseFloat(pos.longitud) };

    // 2. Mostrar datos básicos de inmediato
    setSelectedBusData({
      pos: busPos,
      plate: busInfo.placa || 'En tránsito',
      company: busInfo.empresa || 'Empresa Independiente',
      routeName: 'Cargando detalles...',
      start: '...',
      end: '...',
      lastStop: 'Calculando...',
      nextStop: 'Calculando...',
      eta: '...',
      color: busInfo.color || '#3b82f6',
      fare: 0,
      fareType: 'fija',
      payments: { cash: true, card: false, special: false }
    });

    // 3. Cargar detalles de ruta en segundo plano
    try {
      const rutaId = busInfo.ruta_id || pos.ruta_id;
      if (!rutaId) return;

      let routeDetails = activeRoutes[rutaId];
      if (!routeDetails) {
        routeDetails = await routeService.getRouteDetails(rutaId);
      }

      if (routeDetails && routeDetails.ruta) {
        const stopsWithDist = (routeDetails.paradas || []).map(s => ({
          ...s,
          dist: calculateDistance(busPos.lat, busPos.lng, parseFloat(s.latitud), parseFloat(s.longitud))
        }));

        const sortedStops = [...stopsWithDist].sort((a, b) => a.dist - b.dist);
        const closestIdx = (routeDetails.paradas || []).findIndex(s => s.parada_id === sortedStops[0]?.parada_id);
        const lastStop = closestIdx > 0 ? routeDetails.paradas[closestIdx - 1] : null;
        const nextStop = routeDetails.paradas[closestIdx];
        const eta = sortedStops[0] ? Math.max(1, Math.round(sortedStops[0].dist / 0.4)) : 1;

        setSelectedBusData(prev => ({
          ...prev,
          routeName: routeDetails.ruta.nombre,
          start: routeDetails.paradas[0]?.nombre || 'Origen',
          end: routeDetails.paradas[routeDetails.paradas.length - 1]?.nombre || 'Destino',
          lastStop: lastStop?.nombre || 'Inicio de Ruta',
          nextStop: nextStop?.nombre || 'Fin de Ruta',
          eta: eta,
          color: routeDetails.ruta.color || prev.color,
          fare: routeDetails.ruta.monto_tarifa || 0,
          fareType: routeDetails.ruta.tipo_tarifa || 'fija',
          payments: {
            cash: routeDetails.ruta.acepta_efectivo ?? true,
            card: routeDetails.ruta.acepta_tarjeta ?? false,
            special: routeDetails.ruta.acepta_tarjeta_especial ?? false
          }
        }));
      }
    } catch (error) {
      console.error("Error al cargar detalles de ruta:", error);
    }
  };

  const activeRouteIds = useMemo(() => {
    const activeIds = new Set();
    busPositions.forEach(pos => {
      const busInfo = allBuses.find(b => String(b.bus_id).toLowerCase() === String(pos.bus_id).toLowerCase());
      if (busInfo?.ruta_id) activeIds.add(String(busInfo.ruta_id).toLowerCase());
    });
    return activeIds;
  }, [busPositions, allBuses]);

  const nearbyRoutes = useMemo(() => {
    return allRoutes
      .map(r => {
        let dist = null;
        if (currentPos && r.origen_lat && r.origen_lng) {
          dist = calculateDistance(currentPos.lat, currentPos.lng, parseFloat(r.origen_lat), parseFloat(r.origen_lng));
        }
        return { ...r, dist };
      })
      .filter(r => {
        const matchesSearch = r.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterActiveOnly ? activeRouteIds.has(String(r.ruta_id).toLowerCase()) : true;
        // Filtro por estado real (usando el campo de DB)
        const matchesEstado = filterEstado === 'Todos' || String(r.estado_republica) === filterEstado;
        return matchesSearch && matchesStatus && matchesEstado;
      })
      .sort((a, b) => (a.dist || 999) - (b.dist || 999));
  }, [allRoutes, currentPos, searchQuery, filterActiveOnly, filterEstado, activeRouteIds]);

  if (loading) return <div className="loading-screen"><div className="loader"></div><p>Localizando transporte...</p></div>;

  return (
    <div className="user-home">
      
      {/* Sidebar de Rutas */}
      <aside className={`route-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="header-title">
            <Layers size={20} />
            <h3>Rutas Cercanas</h3>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="close-btn"><X size={20} /></button>
        </div>

        <div className="sidebar-filters">
          <div className="filter-group">
            <span className="filter-label">Estado</span>
            <select 
              className="estado-select"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="CDMX">Ciudad de México</option>
              <option value="Estado de México">Estado de México</option>
              <option value="Jalisco">Jalisco</option>
              <option value="Nuevo León">Nuevo León</option>
              <option value="Puebla">Puebla</option>
            </select>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Buscar ruta..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={`filter-btn ${filterActiveOnly ? 'active' : ''}`}
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
          >
            {filterActiveOnly ? 'Ver todas las rutas' : 'Solo en servicio'}
          </button>
        </div>
        <div className="route-list">
          {nearbyRoutes.map(route => {
            const isRouteActive = activeRouteIds.has(String(route.ruta_id).toLowerCase());
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
                  <div className="route-bottom-meta">
                    <span className="route-dist">
                      {route.dist ? `${route.dist.toFixed(1)} km cerca` : 'Distancia no disponible'}
                    </span>
                    <div className="route-fare-badge">
                       <DollarSign size={10} />
                       <span>${route.monto_tarifa || 0}</span>
                    </div>
                  </div>
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
                const busInfo = allBuses.find(b => String(b.bus_id).toLowerCase() === String(pos.bus_id).toLowerCase());
                const busColor = busInfo?.color || '#3b82f6';
                
                return (
                  <Marker 
                    key={pos.bus_id}
                    position={{ lat: parseFloat(pos.latitud), lng: parseFloat(pos.longitud) }}
                    zIndex={1000}
                    icon={{
                      url: createBusIcon(busColor),
                      scaledSize: new window.google.maps.Size(40, 48),
                      anchor: new google.maps.Point(20, 48)
                    }}
                    onClick={() => handleBusClick(pos)}
                  />
                );
              })
            }

            {/* Info Window para Parada Seleccionada */}
            {selectedStop && (
              <InfoWindow 
                position={{ lat: parseFloat(selectedStop.latitud), lng: parseFloat(selectedStop.longitud) }}
                onCloseClick={() => setSelectedStop(null)}
              >
                <div className="stop-info-window">
                  <h4>{selectedStop.nombre}</h4>
                  <p>¿Qué acción deseas realizar?</p>
                  <div className="stop-action-btns">
                    <button 
                      onClick={() => requestStop('subir')} 
                      className="req-stop-btn subir" 
                      style={{ border: `2px solid ${selectedStop.route_color || '#10b981'}` }}
                    >
                      <UserPlus size={14} /> Subir aquí
                    </button>
                    <button 
                      onClick={() => requestStop('bajar')} 
                      className="req-stop-btn bajar" 
                      style={{ border: `2px solid ${selectedStop.route_color || '#ef4444'}` }}
                    >
                      <UserMinus size={14} /> Bajar aquí
                    </button>
                  </div>
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
