import React, { useState, useEffect } from 'react';
import { GoogleMap, Polyline, Marker, DirectionsRenderer } from '@react-google-maps/api';

const defaultCenter = { lat: 20.659698, lng: -103.349609 };

const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#6c757d" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#495057" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6c757d" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e8f5e9" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#e3f2fd" }] },
  ],
  disableDefaultUI: false,
  zoomControl: true,
};

const createMarkerIcon = (color) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: color,
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#ffffff",
  scale: 1.5,
  anchor: window.google ? new window.google.maps.Point(12, 22) : null,
});

const createBusIcon = (color) => ({
  path: "M20 12c0-1.1-.9-2-2-2V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10h1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5h7c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5H22v-5c0-1.1-.9-2-2-2zM4 7h12v5H4V7zm14 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
  fillColor: color,
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#FFFFFF",
  scale: 1.8,
  anchor: window.google ? new window.google.maps.Point(12, 12) : null,
});

export default function MapContainer({ 
  isLoaded, 
  clickedPos, 
  onMapClick, 
  visibleRoutes, 
  allRouteDetails, 
  paradas, 
  visibleStops,
  newStopColor,
  onStopClick,
  editingRoute,
  setEditingRoute,
  showRouteForm,
  livePositions = [],
  buses = []
}) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [currentAdminPos, setCurrentAdminPos] = useState(null);
  const directionsRendererRef = React.useRef(null);
  const mapRef = React.useRef(null);

  // Autolocalización del Administrador
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        setCurrentAdminPos(pos);
      }, (err) => console.log("Admin GPS denegado:", err));
    }
  }, []);

  useEffect(() => {
    if (!window.google) return;
    if (showRouteForm && editingRoute?.paradas_ids?.length >= 2) {
      const stops = editingRoute.paradas_ids.map(id => {
        const p = paradas.find(par => par.parada_id === id);
        return p ? { lat: Number(p.lugar.latitud), lng: Number(p.lugar.longitud) } : null;
      }).filter(Boolean);

      if (stops.length >= 2) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: stops[0],
            destination: stops[stops.length - 1],
            waypoints: stops.slice(1, -1).map(loc => ({ location: loc, stopover: true })),
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirectionsResponse(result);
            }
          }
        );
      } else {
        setDirectionsResponse(null);
      }
    } else {
      setDirectionsResponse(null);
    }
  }, [showRouteForm, editingRoute?.paradas_ids, paradas]);

  return (
    <div className="w-full h-full bg-white rounded-tl-[40px] overflow-hidden shadow-inner border-l border-t border-slate-100 relative">
        {isLoaded ? (
            <GoogleMap 
              mapContainerStyle={{ width: '100%', height: '100%' }} 
              center={currentAdminPos || defaultCenter} 
              zoom={13} 
              options={mapOptions} 
              onClick={onMapClick}
              onLoad={(map) => mapRef.current = map}
            >
                {/* Mi Ubicación (Admin) */}
                {currentAdminPos && (
                  <Marker 
                    position={currentAdminPos} 
                    icon={{
                      path: window.google?.maps.SymbolPath.CIRCLE,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: '#fff',
                      strokeWeight: 3,
                      scale: 10
                    }}
                    zIndex={100}
                  />
                )}

                {clickedPos && <Marker position={clickedPos} icon={window.google ? createMarkerIcon(newStopColor) : null} />}
                
                {/* Renderizado Consolidado de Rutas Visibles (Línea + Paradas) */}
                <React.Fragment key={`routes-layer-${visibleRoutes.length}`}>
                  {visibleRoutes.map(rutaId => {
                    const idStr = String(rutaId);
                    const detalles = allRouteDetails[idStr];
                    if (!detalles) return null;
                    
                    const routeColor = detalles.ruta?.color || '#3498db';
                    const isBeingEdited = showRouteForm && String(editingRoute?.ruta_id) === idStr;

                    return (
                      <React.Fragment key={`render-route-${idStr}`}>
                        {/* 1. La línea de la ruta (solo si no se está editando esta misma ruta) */}
                        {detalles.google_polyline && !isBeingEdited && (
                          <Polyline 
                            key={`poly-${idStr}-${routeColor}`}
                            path={window.google.maps.geometry.encoding.decodePath(detalles.google_polyline)} 
                            options={{ 
                              strokeColor: routeColor, 
                              strokeOpacity: 0.8, 
                              strokeWeight: 6,
                              clickable: false
                            }} 
                          />
                        )}

                        {/* 2. Los marcadores de las paradas de esta ruta */}
                        {detalles.paradas?.map(p => {
                          const pIdStr = String(p.parada_id);
                          if (visibleStops.map(id => String(id)).includes(pIdStr)) return null;
                          if (!p.latitud || !p.longitud) return null;

                          return (
                            <Marker 
                              key={`stop-v-${idStr}-${pIdStr}`} 
                              position={{ lat: Number(p.latitud), lng: Number(p.longitud) }} 
                              icon={window.google ? createMarkerIcon(p.color || routeColor) : null}
                              opacity={0.8}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>

                {/* Renderizar marcadores de paradas individuales o durante creación de ruta */}
                {paradas.filter(p => showRouteForm || visibleStops.includes(p.parada_id)).map(p => {
                  const indexInRoute = editingRoute?.paradas_ids?.indexOf(p.parada_id);
                  const isSelectedForRoute = showRouteForm && indexInRoute !== undefined && indexInRoute !== -1;
                  const stopColor = p.color || '#3498db';
                  const orderNumber = isSelectedForRoute ? `${indexInRoute + 1}. ` : '';
                  
                  return (
                    <Marker 
                      key={`stop-ctrl-${p.parada_id}`} 
                      position={{ lat: Number(p.lugar.latitud), lng: Number(p.lugar.longitud) }} 
                      icon={window.google ? createMarkerIcon(stopColor) : null}
                      onClick={() => onStopClick && onStopClick(p.parada_id)}
                      label={{
                        text: `${orderNumber}${p.nombre}`,
                        color: "#1a202c",
                        fontSize: "11px",
                        fontWeight: "900",
                        className: `bg-white/90 px-2 py-1 rounded-lg border shadow-sm ${isSelectedForRoute ? 'border-primary text-primary' : 'border-slate-100'}`
                      }}
                    />
                  );
                })}

                {/* Renderizar la ruta interactiva durante la edición */}
                {directionsResponse && showRouteForm && (
                  <DirectionsRenderer
                    key={`route-edit-${editingRoute?.ruta_id || 'new'}-${editingRoute?.color}`}
                    directions={directionsResponse}
                    onLoad={(r) => directionsRendererRef.current = r}
                    onUnmount={() => directionsRendererRef.current = null}
                    onDirectionsChanged={() => {
                      if (directionsRendererRef.current) {
                        const currentDirs = directionsRendererRef.current.getDirections();
                        if (currentDirs && currentDirs.routes[0]) {
                          const newPolyline = currentDirs.routes[0].overview_polyline;
                          if (setEditingRoute) {
                            // Solo actualizar si la polilínea realmente cambió para evitar bucles infinitos
                            setEditingRoute(prev => {
                              if (prev.google_polyline === newPolyline) return prev;
                              return {...prev, google_polyline: newPolyline};
                            });
                          }
                        }
                      }
                    }}
                    options={{
                      suppressMarkers: true,
                      draggable: true,
                      polylineOptions: {
                        strokeColor: editingRoute?.color || '#f1c40f',
                        strokeWeight: 6,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                )}

                {/* Renderizar Autobuses en Tiempo Real */}
                {livePositions.map(pos => {
                  const bus = buses.find(b => String(b.bus_id) === String(pos.bus_id));
                  if (!pos.latitud || !pos.longitud) return null;
                  
                  return (
                    <Marker
                      key={`live-bus-${pos.bus_id}`}
                      position={{ lat: Number(pos.latitud), lng: Number(pos.longitud) }}
                      icon={window.google ? createBusIcon(bus?.color || '#e74c3c') : null}
                      label={{
                        text: `${bus?.placa || 'BUS'} (${pos.velocidad || 0} km/h)`,
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: "bold",
                        className: "bg-slate-800/80 px-2 py-1 rounded-md border border-white/20 -translate-y-10"
                      }}
                    />
                  );
                })}
            </GoogleMap>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 font-bold">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Cargando Google Maps...</span>
            </div>
          </div>
        )}
    </div>
  );
}
