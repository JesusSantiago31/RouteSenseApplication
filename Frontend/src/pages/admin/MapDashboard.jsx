import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { Navigation, Plus, MapPin, X, LogOut, ChevronRight, Activity, Tag, Building2, Globe2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../../services/routeService';
import { stopService } from '../../services/stopService';

const defaultCenter = { lat: 20.659698, lng: -103.349609 };

// Helper para crear un icono de marcador con color dinámico
const createMarkerIcon = (color) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: color,
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#ffffff",
  scale: 1.5,
  anchor: new window.google.maps.Point(12, 22),
});

export default function MapDashboard() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState([]); // IDs de rutas visibles
  const [visibleStops, setVisibleStops] = useState([]);   // IDs de paradas visibles
  const [allRouteDetails, setAllRouteDetails] = useState({}); // Detalles de múltiples rutas { id: data }
  const [showStopForm, setShowStopForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [clickedPos, setClickedPos] = useState(null);
  const [newStop, setNewStop] = useState({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' });

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '' });

  const fetchRutas = async () => {
    const data = await routeService.getRoutes();
    setRutas(data || []);
  };

  const fetchParadas = async () => {
    const data = await stopService.getStops();
    setParadas(data || []);
  };

  const toggleRouteVisibility = async (rutaId) => {
    if (visibleRoutes.includes(rutaId)) {
      setVisibleRoutes(visibleRoutes.filter(id => id !== rutaId));
    } else {
      // Si no tenemos los detalles, los traemos
      if (!allRouteDetails[rutaId]) {
        const detalles = await routeService.getRouteDetails(rutaId);
        if (detalles) {
          setAllRouteDetails(prev => ({ ...prev, [rutaId]: detalles }));
        }
      }
      setVisibleRoutes([...visibleRoutes, rutaId]);
    }
  };

  const toggleStopVisibility = (stopId) => {
    if (visibleStops.includes(stopId)) {
      setVisibleStops(visibleStops.filter(id => id !== stopId));
    } else {
      setVisibleStops([...visibleStops, stopId]);
    }
  };

  const toggleAllStops = () => {
    if (visibleStops.length === paradas.length) {
      setVisibleStops([]);
    } else {
      setVisibleStops(paradas.map(p => p.parada_id));
    }
  };

  useEffect(() => { 
    fetchRutas(); 
    fetchParadas();
  }, []);

  const mapOptions = {
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#e3f2fd" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }
    ],
    disableDefaultUI: true,
  };

  const handleMapClick = (e) => {
    if (showStopForm) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setClickedPos({ lat, lng });
      setNewStop(prev => ({ ...prev, latitud: lat.toFixed(6), longitud: lng.toFixed(6) }));
      
      if (!window.google) return;
      setIsGeocoding(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const components = results[0].address_components;
          let street = "", num = "", city = "", state = "";
          components.forEach(c => {
            if (c.types.includes("route")) street = c.long_name;
            if (c.types.includes("street_number")) num = c.long_name;
            if (c.types.includes("locality")) city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.long_name;
          });
          setNewStop(prev => ({ ...prev, nombre_lugar: `${street} ${num}`.trim() || results[0].formatted_address, municipio: city, estado: state }));
        }
        setIsGeocoding(false);
      });
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col gap-5 bg-slate-50">
      <nav className="bg-white px-9 py-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-white p-2.5 rounded-xl">
            <Navigation size={22} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">RouteSense Maps</span>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('routesense_admin_token'); navigate('/login'); }} 
          className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors"
        >
          Cerrar Sesión
        </button>
      </nav>

      <div className="flex-1 flex gap-6 min-h-0">
        <aside className="w-[400px] bg-white rounded-[28px] flex flex-col shadow-md relative overflow-hidden border border-slate-100">
            <div className={`absolute top-0 left-0 right-0 bg-white p-9 z-50 border-b border-slate-100 shadow-xl transform transition-transform duration-500 ease-in-out ${showStopForm ? 'translate-y-0' : '-translate-y-full'}`} style={{ maxHeight: '90%', overflowY: 'auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Nueva Parada</h3>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>Parámetros de la estación</p>
                  </div>
                  <div onClick={() => {setShowStopForm(false); setClickedPos(null);}} style={{ background: '#f5f5f7', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                    <X size={20} color="#333" />
                  </div>
               </div>
               
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 try {
                   await stopService.createStop(newStop);
                   alert("¡Estación Guardada!");
                   setShowStopForm(false);
                   setClickedPos(null);
                    setNewStop({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' });
                   fetchRutas(); fetchParadas();
                 } catch (err) { alert(err.message); }
               }} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                   <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end' }}>
                     <div className="flex-1">
                        <label className="text-[10px] font-black text-primary mb-2 block tracking-widest uppercase">Identificación</label>
                        <div className="relative">
                           <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                           <input 
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            value={newStop.nombre} 
                            onChange={e => setNewStop({...newStop, nombre: e.target.value})} 
                            required 
                            placeholder="Nombre de la estación" 
                           />
                        </div>
                     </div>
                     <div className="w-16">
                        <label className="text-[10px] font-black text-primary mb-2 block text-center uppercase">Color</label>
                        <div className="relative w-full h-12 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-200 overflow-hidden cursor-pointer" style={{ backgroundColor: newStop.color }}>
                           <input 
                              type="color" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              value={newStop.color} 
                              onChange={e => setNewStop({...newStop, color: e.target.value})} 
                           />
                        </div>
                     </div>
                   </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">LATITUD</label>
                        <input className="w-full p-3 border border-slate-100 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 text-center" value={newStop.latitud} readOnly />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">LONGITUD</label>
                        <input className="w-full p-3 border border-slate-100 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 text-center" value={newStop.longitud} readOnly />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 block">GEO-LOCALIZACIÓN</label>
                    <div className="relative mb-3">
                       <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input className="w-full pl-12 pr-4 py-3.5 border border-slate-100 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={newStop.nombre_lugar} onChange={e => setNewStop({...newStop, nombre_lugar: e.target.value})} placeholder="Dirección física" />
                    </div>
                    <div className="flex gap-3">
                       <div className="flex-1 relative">
                          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-200" />
                          <input className="w-full pl-10 pr-3 py-3 border border-slate-100 bg-slate-50 rounded-xl text-[13px] focus:outline-none" value={newStop.municipio} onChange={e => setNewStop({...newStop, municipio: e.target.value})} placeholder="Municipio" />
                       </div>
                       <div className="flex-1 relative">
                          <Globe2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-200" />
                          <input className="w-full pl-10 pr-3 py-3 border border-slate-100 bg-slate-50 rounded-xl text-[13px] focus:outline-none" value={newStop.estado} onChange={e => setNewStop({...newStop, estado: e.target.value})} placeholder="Estado" />
                       </div>
                    </div>
                  </div>

                  <button type="submit" className="py-4.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 py-4">
                     {isGeocoding ? "Ubicando..." : "Guardar Estación"}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5"><Sparkles size={14} className="text-yellow-400" /> Haga clic en el mapa para ubicar</p>
               </form>
            </div>

            <header className="px-9 pt-9 pb-6">
                <p className="text-primary font-black text-[11px] tracking-widest uppercase">Administración</p>
                <h2 className="text-2xl font-extrabold text-slate-800">Rutas de Servicio</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-24">
                {/* SECCIÓN DE RUTAS */}
                <section>
                    <p className="text-primary font-black text-[10px] tracking-widest uppercase mb-4 opacity-70">Líneas / Rutas</p>
                    <div className="space-y-3">
                        {rutas.length > 0 ? rutas.map(ruta => (
                            <div 
                              key={ruta.ruta_id} 
                              className={`flex items-center gap-4 p-4 rounded-3xl transition-all duration-200 ${visibleRoutes.includes(ruta.ruta_id) ? 'bg-slate-50 ring-1 ring-slate-100 shadow-sm' : 'hover:bg-slate-50/50'}`}
                            >
                                <div 
                                  className="p-2.5 rounded-2xl text-white shadow-sm cursor-pointer"
                                  style={{ background: ruta.color || '#005cc8' }}
                                  onClick={() => toggleRouteVisibility(ruta.ruta_id)}
                                >
                                  {visibleRoutes.includes(ruta.ruta_id) ? <Activity size={18} /> : <div className="w-[18px] h-[18px] border-2 border-white/50 rounded-full" />}
                                </div>
                                <div className="flex-1 cursor-pointer" onClick={() => toggleRouteVisibility(ruta.ruta_id)}>
                                   <p className={`font-bold text-[14px] ${visibleRoutes.includes(ruta.ruta_id) ? 'text-slate-900' : 'text-slate-600'}`}>{ruta.nombre || `Línea ${ruta.distancia_km}km`}</p>
                                   <p className="text-[10px] text-slate-400 font-medium">{ruta.numero_paradas} Estaciones</p>
                                </div>
                                <button 
                                  onClick={() => toggleRouteVisibility(ruta.ruta_id)}
                                  className={`p-2 rounded-xl transition-colors ${visibleRoutes.includes(ruta.ruta_id) ? 'text-primary bg-primary/10' : 'text-slate-300'}`}
                                >
                                  {visibleRoutes.includes(ruta.ruta_id) ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        )) : <p className="text-xs text-slate-400 italic px-2">No hay rutas registradas.</p>}
                    </div>
                </section>

                {/* SECCIÓN DE ESTACIONES */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-70">Paradas / Estaciones</p>
                        <button onClick={toggleAllStops} className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-tighter">Toggle All</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {paradas.length > 0 ? paradas.map(parada => (
                            <div 
                              key={parada.parada_id} 
                              onClick={() => toggleStopVisibility(parada.parada_id)}
                              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group ${visibleStops.includes(parada.parada_id) ? 'border-slate-200 bg-slate-50/50' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <div 
                                    className={`w-3 h-3 rounded-full shadow-inner transition-transform ${visibleStops.includes(parada.parada_id) ? 'scale-125' : 'scale-100 opacity-40'}`}
                                    style={{ backgroundColor: parada.color || '#3498db' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-bold truncate ${visibleStops.includes(parada.parada_id) ? 'text-slate-700' : 'text-slate-400 font-medium'}`}>{parada.nombre}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{parada.lugar?.municipio}, {parada.lugar?.estado}</p>
                                </div>
                                <div 
                                  className={`transition-colors`}
                                  style={{ color: visibleStops.includes(parada.parada_id) ? (parada.color || '#3498db') : '#e2e8f0' }}
                                >
                                    {visibleStops.includes(parada.parada_id) ? <Eye size={14} /> : <EyeOff size={14} />}
                                </div>
                            </div>
                        )) : <p className="text-xs text-slate-400 italic px-2">No hay estaciones registradas.</p>}
                    </div>
                </section>
            </div>

            <button className="flex items-center justify-center gap-3 bg-primary text-white m-6 p-5 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:brightness-110 hover:shadow-xl transition-all" onClick={() => setShowStopForm(true)}><Plus size={22} /> Nueva Ruta</button>
        </aside>

        <main className="flex-1 bg-white rounded-[28px] overflow-hidden shadow-md border-[4px] border-white">
            {isLoaded ? (
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={defaultCenter} zoom={13} options={mapOptions} onClick={handleMapClick}>
                    {clickedPos && <Marker position={clickedPos} icon={window.google ? createMarkerIcon(newStop.color) : null} />}
                    
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
                        // Evitar duplicados si la parada ya es visible individualmente
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
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}
        </main>
      </div>
    </div>
  );
}
