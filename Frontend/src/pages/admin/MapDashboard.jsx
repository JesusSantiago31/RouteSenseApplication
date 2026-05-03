import React, { useState, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../../services/routeService';
import { stopService } from '../../services/stopService';
import { companyService } from '../../services/companyService';

// Subcomponentes
import Sidebar from './components/Sidebar';
import StopForm from './components/StopForm';
import RouteForm from './components/RouteForm';
import MapContainer from './components/MapContainer';

export default function MapDashboard() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState([]);
  const [visibleStops, setVisibleStops] = useState([]);
  const [allRouteDetails, setAllRouteDetails] = useState({});
  
  // Estados de Filtros
  const [filters, setFilters] = useState({
    search: '',
    color: '',
    municipio: '',
    estado: ''
  });

  // Estados para Paradas
  const [showStopForm, setShowStopForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [clickedPos, setClickedPos] = useState(null);
  const [newStop, setNewStop] = useState({ 
    nombre: '', nombre_lugar: '', estado: '', municipio: '', 
    localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' 
  });

  // Estados para Rutas
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  const { isLoaded } = useJsApiLoader({ 
    id: 'google-map-script', 
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '' 
  });

  // CARGA DE DATOS
  const fetchRutas = async () => {
    const data = await routeService.getRoutes();
    setRutas(data || []);
  };

  const fetchParadas = async () => {
    const data = await stopService.getStops();
    setParadas(data || []);
  };

  const fetchCompanies = async () => {
    const data = await companyService.getCompanies();
    setCompanies(data || []);
  };

  useEffect(() => { 
    fetchRutas(); 
    fetchParadas();
    fetchCompanies();
  }, []);

  // OPCIONES PARA FILTROS (Extraídas de los datos reales)
  const filterOptions = useMemo(() => {
    const colors = new Set([...rutas.map(r => r.color), ...paradas.map(p => p.color)].filter(Boolean));
    const municipios = new Set(paradas.map(p => p.lugar?.municipio).filter(Boolean));
    const estados = new Set(paradas.map(p => p.lugar?.estado).filter(Boolean));

    return {
      colors: Array.from(colors),
      municipios: Array.from(municipios).sort(),
      estados: Array.from(estados).sort()
    };
  }, [rutas, paradas]);

  // LÓGICA DE FILTRADO (useMemo para rendimiento)
  const filteredRutas = useMemo(() => {
    return rutas.filter(r => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch = r.nombre.toLowerCase().includes(searchLower);
      const matchColor = !filters.color || r.color === filters.color;
      return matchSearch && matchColor;
    });
  }, [rutas, filters]);

  const filteredParadas = useMemo(() => {
    return paradas.filter(p => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch = p.nombre.toLowerCase().includes(searchLower) || 
                         (p.nombre_lugar && p.nombre_lugar.toLowerCase().includes(searchLower));
      
      const matchColor = !filters.color || p.color === filters.color;
      const matchMunicipio = !filters.municipio || p.lugar?.municipio === filters.municipio;
      const matchEstado = !filters.estado || p.lugar?.estado === filters.estado;
      
      return matchSearch && matchColor && matchMunicipio && matchEstado;
    });
  }, [paradas, filters]);

  // HANDLERS DE VISIBILIDAD
  const toggleRouteVisibility = async (rutaId) => {
    if (visibleRoutes.includes(rutaId)) {
      setVisibleRoutes(visibleRoutes.filter(id => id !== rutaId));
    } else {
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
    setVisibleStops(prev => 
      prev.includes(stopId) ? prev.filter(id => id !== stopId) : [...prev, stopId]
    );
  };

  const toggleAllStops = () => {
    const ids = filteredParadas.map(p => p.parada_id);
    const allVisible = ids.every(id => visibleStops.includes(id));
    if (allVisible) {
      setVisibleStops(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setVisibleStops(prev => [...new Set([...prev, ...ids])]);
    }
  };

  // CRUD HANDLERS (ESTACIONES)
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const latlng = { lat, lng };
    
    setClickedPos(latlng);
    setNewStop(prev => ({ 
      ...prev, 
      latitud: lat.toFixed(6), 
      longitud: lng.toFixed(6) 
    }));

    if (!showStopForm) setShowStopForm(true);
    
    // Iniciar geocodificación inversa
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      setIsGeocoding(true);
      
      try {
        const response = await geocoder.geocode({ location: latlng });
        if (response.results[0]) {
          const components = response.results[0].address_components;
          const address = response.results[0].formatted_address;
          
          let estado = '';
          let municipio = '';
          let calle = address.split(',')[0]; // Intento obtener la calle del formato de dirección

          components.forEach(component => {
            if (component.types.includes('administrative_area_level_1')) {
              estado = component.long_name;
            }
            if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
              municipio = component.long_name;
            }
          });

          setNewStop(prev => ({
            ...prev,
            nombre_lugar: calle,
            estado: estado,
            municipio: municipio
          }));
        }
      } catch (error) {
        console.error("Error en geocodificación:", error);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  // HANDLERS EMPRESAS
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await companyService.createCompany(newCompany);
      alert(`Empresa "${newCompany.nombre}" registrada correctamente`);
      setShowCompanyForm(false);
      setNewCompany({ nombre: '', razon_social: '', telefono: '', color: '#1e293b' });
      fetchCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    setIsGeocoding(true);
    try {
      await stopService.createStop(newStop);
      alert("¡Estación Guardada!");
      setShowStopForm(false);
      setClickedPos(null);
      setNewStop({ 
        nombre: '', nombre_lugar: '', estado: '', municipio: '', 
        localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' 
      });
      fetchParadas();
      fetchRutas();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm("¿Estás seguro de eliminar esta estación?")) {
      try {
        await stopService.deleteStop(stopId);
        fetchParadas();
        setVisibleStops(prev => prev.filter(id => id !== stopId));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // CRUD HANDLERS (RUTAS)
  const handleEditRoute = (ruta) => {
    setEditingRoute(ruta);
    setIsCreatingRoute(false);
    setShowRouteForm(true);
  };

  const handleOpenNewRoute = () => {
    setNewStop({ 
      nombre: '', nombre_lugar: '', estado: '', municipio: '', 
      localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' 
    });
    setClickedPos(null);
    setShowStopForm(true);
    setShowRouteForm(false);
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      if (isCreatingRoute) {
        await routeService.createRoute(editingRoute);
        alert("¡Ruta Creada!");
      } else {
        await routeService.updateRoute(editingRoute.ruta_id, {
          nombre: editingRoute.nombre,
          color: editingRoute.color,
          distancia_km: editingRoute.distancia_km,
          tiempo_estimado: editingRoute.tiempo_estimado,
          origen_id: editingRoute.origen_id,
          destino_id: editingRoute.destino_id
        });
        alert("¡Ruta Actualizada!");
        // Limpiar cache de detalles
        setAllRouteDetails(prev => {
          const newDetails = { ...prev };
          delete newDetails[editingRoute.ruta_id];
          return newDetails;
        });
      }
      setShowRouteForm(false);
      fetchRutas();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteRoute = async (rutaId) => {
    if (window.confirm("¿Estás seguro de eliminar esta ruta completa?")) {
      try {
        await routeService.deleteRoute(rutaId);
        fetchRutas();
        setShowRouteForm(false);
        setVisibleRoutes(prev => prev.filter(id => id !== rutaId));
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR LATERAL COMPLETO */}
      <Sidebar 
        rutas={filteredRutas}
        paradas={filteredParadas}
        visibleRoutes={visibleRoutes}
        visibleStops={visibleStops}
        toggleRouteVisibility={toggleRouteVisibility}
        toggleStopVisibility={toggleStopVisibility}
        toggleAllStops={toggleAllStops}
        onNewRoute={handleOpenNewRoute}
        onDeleteStop={handleDeleteStop}
        
        // Props Filtros
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}

        // Props Paradas
        showStopForm={showStopForm}
        setShowStopForm={setShowStopForm}
        handleCreateStop={handleCreateStop}
        newStop={newStop}
        setNewStop={setNewStop}
        isGeocoding={isGeocoding}

        // Props Rutas
        showRouteForm={showRouteForm}
        setShowRouteForm={setShowRouteForm}
        onEditRoute={handleEditRoute}
        editingRoute={editingRoute}
        setEditingRoute={setEditingRoute}
        onSaveRoute={handleSaveRoute}
        onDeleteRoute={handleDeleteRoute}
        isCreatingRoute={isCreatingRoute}
      />

      {/* CONTENIDO PRINCIPAL (NAVBAR + MAPA) */}
      <main className="flex-1 flex flex-col min-w-0">
        <nav className="bg-white/80 backdrop-blur-md px-8 py-3 flex justify-between items-center border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Navigation size={18} />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-800">RouteSense Maps</span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('routesense_admin_token'); navigate('/login'); }} 
            className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            Cerrar Sesión
          </button>
        </nav>

        <div className="flex-1 relative w-full h-full">
          <MapContainer 
            isLoaded={isLoaded}
            clickedPos={clickedPos}
            onMapClick={handleMapClick}
            visibleRoutes={visibleRoutes}
            allRouteDetails={allRouteDetails}
            paradas={filteredParadas}
            visibleStops={visibleStops}
            newStopColor={newStop.color}
          />
        </div>
      </main>
    </div>
  );
}
