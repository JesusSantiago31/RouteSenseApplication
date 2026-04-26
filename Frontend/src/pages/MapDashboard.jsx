import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { Map as MapIcon, ChevronRight, Plus, X, Navigation, LocateFixed, Search } from 'lucide-react';
import { routeService } from '../services/routeService';
import { stopService } from '../services/stopService';

const containerStyle = { width: '100%', height: '100%', borderRadius: '16px' };
const defaultCenter = { lat: 20.659698, lng: -103.349609 };

export default function MapDashboard() {
  const [rutas, setRutas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [detallesRuta, setDetallesRuta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStopForm, setShowStopForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [clickedPos, setClickedPos] = useState(null);
  const [newStop, setNewStop] = useState({
    nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', activa: true
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '' 
  });

  const fetchRutas = async () => {
    setIsLoading(true);
    const data = await routeService.getRoutes();
    setRutas(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchRutas(); }, []);

  const handleMapClick = (e) => {
    if (showStopForm) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setClickedPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressComponents = results[0].address_components;
        let street = "", number = "", city = "", state = "";

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes("route")) street = component.long_name;
          if (types.includes("street_number")) number = component.long_name;
          if (types.includes("locality") || types.includes("administrative_area_level_2")) city = component.long_name;
          if (types.includes("administrative_area_level_1")) state = component.long_name;
        });

        setNewStop(prev => ({
          ...prev,
          nombre_lugar: `${street} ${number}`.trim() || results[0].formatted_address,
          municipio: city,
          estado: state
        }));
      }
      setIsGeocoding(false);
    });
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    const payload = { 
        ...newStop, 
        latitud: clickedPos ? clickedPos.lat : null,
        longitud: clickedPos ? clickedPos.lng : null
    };

    try {
      await stopService.createStop(payload);
      alert("Parada guardada con éxito.");
      setShowStopForm(false);
      setClickedPos(null);
      setNewStop({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', activa: true });
      fetchRutas();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 80px)', padding: '20px' }}>
      
      {/* Panel Izquierdo */}
      <div className="glass-card" style={{ width: '380px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
                <MapIcon size={24} color="var(--primary)" /> Rutas
            </h2>
            <button className="btn-primary" style={{ padding: '8px' }} onClick={() => {setShowStopForm(true); setClickedPos(null);}}>
                <Plus size={20} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '15px' }}>
          {showStopForm ? (
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1rem' }}>Identificar Parada</h3>
                    <X size={18} cursor="pointer" onClick={() => {setShowStopForm(false); setClickedPos(null);}} />
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                    {isGeocoding ? "⌛ Obteniendo dirección..." : clickedPos ? "📍 Dirección obtenida del mapa" : "💡 Haz clic en el mapa para auto-rellenar la dirección."}
                </p>

                <form onSubmit={handleCreateStop} className="auth-form">
                    <div className="input-group">
                        <label className="input-label">Nombre para la App</label>
                        <input className="input-field" value={newStop.nombre} onChange={e => setNewStop({...newStop, nombre: e.target.value})} required placeholder="Ej: Estación Arboledas" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Calle / Referencia</label>
                        <input className="input-field" value={newStop.nombre_lugar} onChange={e => setNewStop({...newStop, nombre_lugar: e.target.value})} required placeholder="Buscando..." />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Municipio</label>
                        <input className="input-field" value={newStop.municipio} onChange={e => setNewStop({...newStop, municipio: e.target.value})} required placeholder="Ciudad" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Estado</label>
                        <input className="input-field" value={newStop.estado} onChange={e => setNewStop({...newStop, estado: e.target.value})} required placeholder="Estado" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isGeocoding}>
                        Guardar Parada
                    </button>
                </form>
            </div>
          ) : (
            rutas.map(ruta => (
              <div 
                key={ruta.ruta_id}
                onClick={() => handleSelectRuta(ruta)}
                className="glass-card"
                style={{ 
                  padding: '16px', marginBottom: '12px', cursor: 'pointer',
                  background: rutaSeleccionada?.ruta_id === ruta.ruta_id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: rutaSeleccionada?.ruta_id === ruta.ruta_id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={14} color="var(--primary)" /> {ruta.distancia_km} km
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {ruta.numero_paradas} paradas registradas
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-secondary)" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel Derecho: Mapa */}
      <div className="glass-card" style={{ flex: 1, padding: '10px' }}>
        {!isLoaded ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={detallesRuta?.paradas?.length > 0 ? { lat: Number(detallesRuta.paradas[0].latitud), lng: Number(detallesRuta.paradas[0].longitud) } : defaultCenter}
            zoom={13}
            onClick={handleMapClick}
            options={{
              styles: [
                { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }
              ],
              disableDefaultUI: true
            }}
          >
            {clickedPos && (
                <Marker position={clickedPos} animation={window.google.maps.Animation.DROP} icon={{ path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 6, fillColor: "#3b82f6", fillOpacity: 1, strokeWeight: 2, strokeColor: "white" }} />
            )}
            {detallesRuta?.google_polyline && (
              <Polyline path={google.maps.geometry.encoding.decodePath(detallesRuta.google_polyline)} options={{ strokeColor: '#3b82f6', strokeOpacity: 0.9, strokeWeight: 6 }} />
            )}
            {detallesRuta?.paradas?.map(parada => (
                parada.latitud && <Marker key={parada.parada_id} position={{ lat: Number(parada.latitud), lng: Number(parada.longitud) }} title={parada.nombre} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#10b981", fillOpacity: 1, strokeWeight: 2, strokeColor: "white" }} />
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
