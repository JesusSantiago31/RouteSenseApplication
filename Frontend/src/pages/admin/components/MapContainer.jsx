import React from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';

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
  newStopColor 
}) {
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

                {/* Renderizar marcadores de paradas visibles individualmente */}
                {paradas.filter(p => visibleStops.includes(p.parada_id)).map(p => (
                  <Marker 
                    key={`stop-${p.parada_id}`} 
                    position={{ lat: Number(p.lugar.latitud), lng: Number(p.lugar.longitud) }} 
                    icon={window.google ? createMarkerIcon(p.color || '#3498db') : null}
                    label={{
                      text: p.nombre,
                      color: "#1a202c",
                      fontSize: "11px",
                      fontWeight: "800",
                      className: "bg-white/80 px-2 py-1 rounded-lg border border-slate-100"
                    }}
                  />
                ))}

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
