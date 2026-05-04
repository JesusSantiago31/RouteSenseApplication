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
  showRouteForm
}) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const directionsRendererRef = React.useRef(null);

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
              center={defaultCenter} 
              zoom={13} 
              options={mapOptions} 
              onClick={onMapClick}
            >
                {clickedPos && <Marker position={clickedPos} icon={window.google ? createMarkerIcon(newStopColor) : null} />}
                
                {/* Renderizar múltiples polilíneas de rutas visibles */}
                {visibleRoutes.map(rutaId => {
                  const detalles = allRouteDetails[rutaId];
                  if (!detalles?.google_polyline) return null;
                  return (
                    <Polyline 
                      key={`poly-${rutaId}`}
                      path={window.google.maps.geometry.encoding.decodePath(detalles.google_polyline)} 
                      options={{ 
                        strokeColor: detalles.ruta?.color || '#3498db', 
                        strokeOpacity: 0.8, 
                        strokeWeight: 6 
                      }} 
                    />
                  );
                })}

                {/* Renderizar marcadores de paradas visibles o todas si estamos creando ruta */}
                {paradas.filter(p => showRouteForm || visibleStops.includes(p.parada_id)).map(p => {
                  const indexInRoute = editingRoute?.paradas_ids?.indexOf(p.parada_id);
                  const isSelectedForRoute = showRouteForm && indexInRoute !== undefined && indexInRoute !== -1;
                  const stopColor = isSelectedForRoute ? (editingRoute?.color || '#f1c40f') : (p.color || '#3498db');
                  const orderNumber = isSelectedForRoute ? `${indexInRoute + 1}. ` : '';
                  
                  return (
                    <Marker 
                      key={`stop-${p.parada_id}`} 
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

                {/* Renderizar la ruta que se está creando/editando con DirectionsRenderer para seguir calles */}
                {directionsResponse && showRouteForm && (
                  <DirectionsRenderer
                    key={`route-${editingRoute?.color}`} // Fuerza a re-renderizar la línea si el color cambia
                    directions={directionsResponse}
                    onLoad={(r) => directionsRendererRef.current = r}
                    onDirectionsChanged={() => {
                      if (directionsRendererRef.current) {
                        const currentDirs = directionsRendererRef.current.getDirections();
                        if (currentDirs && currentDirs.routes[0]) {
                          const newPolyline = currentDirs.routes[0].overview_polyline;
                          if (setEditingRoute) {
                            setEditingRoute(prev => ({...prev, google_polyline: newPolyline}));
                          }
                        }
                      }
                    }}
                    options={{
                      suppressMarkers: true, // Ya renderizamos nuestros propios marcadores
                      draggable: true, // Permite arrastrar la ruta
                      polylineOptions: {
                        strokeColor: editingRoute?.color || '#f1c40f',
                        strokeWeight: 6,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                )}

                {/* También mostrar paradas de las rutas visibles si no están ya en visibleStops */}
                {visibleRoutes.map(rutaId => {
                  const detalles = allRouteDetails[rutaId];
                  const routeColor = detalles.ruta?.color || '#3498db';
                  return detalles?.paradas?.map(p => {
                    if (visibleStops.includes(p.parada_id)) return null;
                    if (!p.latitud || !p.longitud) return null;
                    return (
                      <Marker 
                        key={`route-stop-${rutaId}-${p.parada_id}`} 
                        position={{ lat: Number(p.latitud), lng: Number(p.longitud) }} 
                        icon={window.google ? createMarkerIcon(p.color || routeColor) : null}
                        opacity={0.8}
                      />
                    );
                  });
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
