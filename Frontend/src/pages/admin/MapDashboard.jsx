import React, { useState, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../../services/routeService';
import { stopService } from '../../services/stopService';
import { companyService } from '../../services/companyService';
import { fleetService } from '../../services/fleetService';

// Subcomponentes
import Sidebar from './components/Sidebar';
import StopForm from './components/StopForm';
import RouteForm from './components/RouteForm';
import MapContainer from './components/MapContainer';
import CompanyForm from './components/CompanyForm';
import BusForm from './components/BusForm';
import DriverForm from './components/DriverForm';

export default function MapDashboard() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState([]);
  const [visibleStops, setVisibleStops] = useState([]);
  const [allRouteDetails, setAllRouteDetails] = useState({});
  
  // Estados de Filtros
  const [filters, setFilters] = useState({ search: '', color: '', municipio: '', estado: '' });

  // Estados para Paradas
  const [showStopForm, setShowStopForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [clickedPos, setClickedPos] = useState(null);
  const [newStop, setNewStop] = useState({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', activa: true, latitud: '', longitud: '', color: '#3498db' });

  // Estados para Rutas
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Estados para Empresas
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Estados para Flota
  const [buses, setBuses] = useState([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [drivers, setDrivers] = useState([]);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '' });

  // CARGA DE DATOS ROBUSTA
  const fetchData = async () => {
    try {
      const r = await routeService.getRoutes(); if (r) setRutas(r);
      const p = await stopService.getStops(); if (p) setParadas(p);
      const c = await companyService.getCompanies(); if (c) setCompanies(c);
      
      // Intentar cargar flota (pueden ser microservicios distintos)
      try {
        const b = await fleetService.getBuses(); if (b) setBuses(b);
        const d = await fleetService.getDrivers(); if (d) setDrivers(d);
      } catch (e) { console.warn("Error cargando flota:", e); }
      
    } catch (err) {
      console.error("Error general en carga de datos:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // OPCIONES PARA FILTROS (Mapeo ultra-flexible)
  const filterOptions = useMemo(() => {
    const colors = new Set();
    const municipios = new Set();
    const estados = new Set();

    rutas.forEach(r => { if (r.color) colors.add(r.color); });
    
    paradas.forEach(p => {
      if (p.color) colors.add(p.color);
      
      // Intentar extraer municipio/estado de diferentes posibles estructuras
      const m = p.lugar?.municipio || p.municipio;
      const e = p.lugar?.estado || p.estado;
      
      if (m) municipios.add(m);
      if (e) estados.add(e);
    });

    return {
      colors: Array.from(colors),
      municipios: Array.from(municipios).sort(),
      estados: Array.from(estados).sort()
    };
  }, [rutas, paradas]);

  // LÓGICA DE FILTRADO (Universal + Específica)
  const filteredRutas = useMemo(() => {
    return rutas.filter(r => {
      const searchLower = filters.search.toLowerCase();
      // Búsqueda Universal
      const matchSearch = r.nombre.toLowerCase().includes(searchLower);
      // Filtros Específicos
      const matchColor = !filters.color || r.color === filters.color;
      return matchSearch && matchColor;
    });
  }, [rutas, filters]);

  const filteredParadas = useMemo(() => {
    return paradas.filter(p => {
      const searchLower = filters.search.toLowerCase();
      const lugar = p.lugar || {};
      
      // 1. Búsqueda Universal (Nombre, Municipio o Estado)
      const matchSearch = 
        p.nombre.toLowerCase().includes(searchLower) || 
        (p.nombre_lugar && p.nombre_lugar.toLowerCase().includes(searchLower)) ||
        (lugar.municipio && lugar.municipio.toLowerCase().includes(searchLower)) ||
        (lugar.estado && lugar.estado.toLowerCase().includes(searchLower));
      
      // 2. Filtros Específicos (Selects)
      const matchColor = !filters.color || p.color === filters.color;
      const matchMunicipio = !filters.municipio || lugar.municipio === filters.municipio;
      const matchEstado = !filters.estado || lugar.estado === filters.estado;
      
      return matchSearch && matchColor && matchMunicipio && matchEstado;
    });
  }, [paradas, filters]);

  // HANDLERS (VISIBILIDAD)
  const toggleRouteVisibility = async (rutaId) => {
    if (visibleRoutes.includes(rutaId)) { setVisibleRoutes(visibleRoutes.filter(id => id !== rutaId)); } 
    else {
      if (!allRouteDetails[rutaId]) {
        const detalles = await routeService.getRouteDetails(rutaId);
        if (detalles) setAllRouteDetails(prev => ({ ...prev, [rutaId]: detalles }));
      }
      setVisibleRoutes([...visibleRoutes, rutaId]);
    }
  };

  const toggleStopVisibility = (stopId) => setVisibleStops(prev => prev.includes(stopId) ? prev.filter(id => id !== stopId) : [...prev, stopId]);
  const toggleAllStops = () => setVisibleStops(prev => prev.length === filteredParadas.length ? [] : filteredParadas.map(p => p.parada_id));

  // CRUD HANDLERS (ESTACIONES)
  const handleMapClick = async (e) => {
    const latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setClickedPos(latlng);
    setNewStop(prev => ({ ...prev, latitud: latlng.lat.toFixed(6), longitud: latlng.lng.toFixed(6) }));
    setShowStopForm(true);
    
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      setIsGeocoding(true);
      try {
        const res = await geocoder.geocode({ location: latlng });
        if (res.results[0]) {
          const comp = res.results[0].address_components;
          const est = comp.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
          const mun = comp.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2'))?.long_name || '';
          setNewStop(prev => ({ ...prev, nombre_lugar: res.results[0].formatted_address.split(',')[0], estado: est, municipio: mun }));
        }
      } catch (err) { console.error(err); } finally { setIsGeocoding(false); }
    }
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    try { await stopService.createStop(newStop); setShowStopForm(false); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleDeleteStop = async (id) => { if (window.confirm("¿Eliminar estación?")) { try { await stopService.deleteStop(id); fetchData(); } catch (err) { alert(err.message); } } };

  // CRUD HANDLERS (RUTAS)
  const handleEditRoute = (ruta) => { setEditingRoute(ruta); setIsCreatingRoute(false); setShowRouteForm(true); };
  const handleOpenNewRoute = () => { setEditingRoute({ nombre: '', color: '#3498db', distancia_km: 0, tiempo_estimado: 0, activa: true }); setIsCreatingRoute(true); setShowRouteForm(true); };
  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      if (isCreatingRoute) await routeService.createRoute(editingRoute);
      else await routeService.updateRoute(editingRoute.ruta_id, editingRoute);
      setShowRouteForm(false); fetchData();
    } catch (err) { alert(err.message); }
  };
  const handleDeleteRoute = async (id) => { if (window.confirm("¿Eliminar ruta?")) { try { await routeService.deleteRoute(id); fetchData(); } catch (err) { alert(err.message); } } };

  // CRUD HANDLERS (EMPRESAS)
  const handleEditCompany = (company) => { setEditingCompany(company); setShowCompanyForm(true); };
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany.empresa_id) await companyService.updateCompany(editingCompany.empresa_id, editingCompany);
      else await companyService.createCompany(editingCompany);
      setShowCompanyForm(false); fetchData();
    } catch (err) { alert(err.message); }
  };
  const handleDeleteCompany = async (id) => { if (window.confirm("¿Eliminar empresa?")) { try { await companyService.deleteCompany(id); fetchData(); } catch (err) { alert(err.message); } } };

  // CRUD HANDLERS (FLOTA)
  const handleEditBus = (bus) => { setEditingBus(bus); setShowBusForm(true); };
  const handleSaveBus = async (e) => {
    e.preventDefault();
    try {
      if (editingBus.bus_id) await fleetService.updateBus(editingBus.bus_id, editingBus);
      else await fleetService.createBus(editingBus);
      setShowBusForm(false); fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleEditDriver = (driver) => { setEditingDriver(driver); setShowDriverForm(true); };
  const handleSaveDriver = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver.conductor_id) await fleetService.updateDriver(editingDriver.conductor_id, editingDriver);
      else await fleetService.createDriver(editingDriver);
      setShowDriverForm(false); fetchData();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        rutas={filteredRutas} paradas={filteredParadas} visibleRoutes={visibleRoutes} visibleStops={visibleStops} toggleRouteVisibility={toggleRouteVisibility} toggleStopVisibility={toggleStopVisibility} toggleAllStops={toggleAllStops} onNewRoute={handleOpenNewRoute} onDeleteStop={handleDeleteStop}
        filters={filters} setFilters={setFilters}
        showStopForm={showStopForm} setShowStopForm={setShowStopForm} handleCreateStop={handleCreateStop} newStop={newStop} setNewStop={setNewStop} isGeocoding={isGeocoding}
        showRouteForm={showRouteForm} setShowRouteForm={setShowRouteForm} onEditRoute={handleEditRoute} editingRoute={editingRoute} setEditingRoute={setEditingRoute} onSaveRoute={handleSaveRoute} onDeleteRoute={handleDeleteRoute} isCreatingRoute={isCreatingRoute}
        // Empresas
        companies={companies} showCompanyForm={showCompanyForm} setShowCompanyForm={setShowCompanyForm} 
        onEditCompany={handleEditCompany} editingCompany={editingCompany} setEditingCompany={setEditingCompany} onSaveCompany={handleSaveCompany} onDeleteCompany={handleDeleteCompany}
        // Flota
        buses={buses} showBusForm={showBusForm} setShowBusForm={setShowBusForm} onEditBus={handleEditBus} editingBus={editingBus} setEditingBus={setEditingBus} onSaveBus={handleSaveBus} onDeleteBus={(id) => fleetService.deleteBus(id).then(fetchData)}
        drivers={drivers} showDriverForm={showDriverForm} setShowDriverForm={setShowDriverForm} onEditDriver={handleEditDriver} editingDriver={editingDriver} setEditingDriver={setEditingDriver} onSaveDriver={handleSaveDriver} onDeleteDriver={(id) => fleetService.deleteDriver(id).then(fetchData)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <nav className="bg-white/80 backdrop-blur-md px-8 py-3 flex justify-between items-center border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg tracking-tight text-slate-800">RouteSense Dashboard</span>
          </div>
          <button onClick={() => { localStorage.removeItem('routesense_admin_token'); navigate('/login'); }} className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">Cerrar Sesión</button>
        </nav>
        <div className="flex-1 relative w-full h-full">
          <MapContainer isLoaded={isLoaded} clickedPos={clickedPos} onMapClick={handleMapClick} visibleRoutes={visibleRoutes} allRouteDetails={allRouteDetails} paradas={filteredParadas} visibleStops={visibleStops} newStopColor={newStop.color} />
        </div>
      </main>
    </div>
  );
}
