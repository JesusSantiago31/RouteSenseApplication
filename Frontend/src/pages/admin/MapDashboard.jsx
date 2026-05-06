import React, { useState, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../../services/routeService';
import { stopService } from '../../services/stopService';
import { companyService } from '../../services/companyService';
import { fleetService } from '../../services/fleetService';

// Subcomponentes
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';

export default function MapDashboard() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState([]);
  const [visibleStops, setVisibleStops] = useState([]);
  const [allRouteDetails, setAllRouteDetails] = useState({});
  
  // Estados de Filtros
  const [filters, setFilters] = useState({ search: '', color: [], municipio: [], estado: [] });

  // Estados UI
  const [showStopForm, setShowStopForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [clickedPos, setClickedPos] = useState(null);
  const [newStop, setNewStop] = useState({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: '', latitud: '', longitud: '', color: '#3498db' });
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Empresas y Flota
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [buses, setBuses] = useState([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '' });

  const fetchData = async () => {
    try {
      const [r, p, c, b, d] = await Promise.allSettled([
        routeService.getRoutes(),
        stopService.getStops(),
        companyService.getCompanies(),
        fleetService.getBuses(),
        fleetService.getDrivers()
      ]);
      if (r.status === 'fulfilled') setRutas(r.value || []);
      if (p.status === 'fulfilled') setParadas(p.value || []);
      if (c.status === 'fulfilled') setCompanies(c.value || []);
      if (b.status === 'fulfilled') setBuses(b.value || []);
      if (d.status === 'fulfilled') setDrivers(d.value || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // FILTROS
  const filterOptions = useMemo(() => {
    const colors = new Set();
    const municipios = new Set();
    const estados = new Set();
    rutas.forEach(r => { if (r.color) colors.add(r.color); });
    paradas.forEach(p => {
      if (p.color) colors.add(p.color);
      const m = p.lugar?.municipio || p.municipio;
      const e = p.lugar?.estado || p.estado;
      if (m) municipios.add(m);
      if (e) estados.add(e);
    });
    return { colors: Array.from(colors), municipios: Array.from(municipios).sort(), estados: Array.from(estados).sort() };
  }, [rutas, paradas]);

  const filteredRutas = useMemo(() => {
    return rutas.filter(r => {
      const matchSearch = r.nombre.toLowerCase().includes(filters.search.toLowerCase());
      const matchColor = filters.color.length === 0 || filters.color.includes(r.color);
      return matchSearch && matchColor;
    });
  }, [rutas, filters]);

  const filteredParadas = useMemo(() => {
    return paradas.filter(p => {
      const searchLower = filters.search.toLowerCase();
      const lugar = p.lugar || {};
      const m = lugar.municipio || p.municipio || "";
      const e = lugar.estado || p.estado || "";
      const matchSearch = p.nombre.toLowerCase().includes(searchLower) || m.toLowerCase().includes(searchLower) || e.toLowerCase().includes(searchLower);
      const matchColor = filters.color.length === 0 || filters.color.includes(p.color);
      const matchMunicipio = filters.municipio.length === 0 || filters.municipio.includes(m);
      const matchEstado = filters.estado.length === 0 || filters.estado.includes(e);
      return matchSearch && matchColor && matchMunicipio && matchEstado;
    });
  }, [paradas, filters]);

  // HANDLERS FUNCIONALES
  const toggleRouteVisibility = async (rutaId) => {
    if (visibleRoutes.includes(rutaId)) {
      setVisibleRoutes(visibleRoutes.filter(id => id !== rutaId));
    } else {
      if (!allRouteDetails[rutaId]) {
        const detalles = await routeService.getRouteDetails(rutaId);
        if (detalles) setAllRouteDetails(prev => ({ ...prev, [rutaId]: detalles }));
      }
      setVisibleRoutes([...visibleRoutes, rutaId]);
    }
  };

  const toggleStopVisibility = (stopId) => {
    setVisibleStops(prev => prev.includes(stopId) ? prev.filter(id => id !== stopId) : [...prev, stopId]);
  };

  const toggleAllStops = () => {
    setVisibleStops(prev => prev.length === filteredParadas.length ? [] : filteredParadas.map(p => p.parada_id));
  };

  const handleStopClick = (stopId) => {
    if (showRouteForm && editingRoute) {
      const current = editingRoute.paradas_ids || [];
      if (current.includes(stopId)) {
        setEditingRoute({ ...editingRoute, paradas_ids: current.filter(id => id !== stopId) });
      } else {
        setEditingRoute({ ...editingRoute, paradas_ids: [...current, stopId] });
      }
    } else {
      toggleStopVisibility(stopId);
    }
  };

  const handleMapClick = async (e) => {
    if (showRouteForm) return;
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

  const handleDeleteStop = async (id) => {
    if (window.confirm("¿Eliminar estación?")) {
      try { await stopService.deleteStop(id); fetchData(); } catch (err) { alert(err.message); }
    }
  };

  const onEditRoute = async (ruta) => { 
    try {
      const detalles = await routeService.getRouteDetails(ruta.ruta_id);
      const busesAsignados = buses
        .filter(b => b.ruta_id === ruta.ruta_id)
        .map(b => b.bus_id);

      setEditingRoute({ 
        ...ruta, 
        paradas_ids: detalles ? detalles.paradas.map(p => p.parada_id) : [], 
        buses_ids: busesAsignados 
      }); 
      setIsCreatingRoute(false); 
      setShowRouteForm(true); 
    } catch (err) {
      console.error(err);
      alert("Error al cargar detalles de la ruta");
    }
  };

  const onDeleteRoute = async (id) => {
    if (window.confirm("¿Eliminar esta ruta por completo?")) {
      try {
        await routeService.deleteRoute(id);
        setShowRouteForm(false);
        fetchData();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };
  const onSaveRoute = async (e) => {
    e.preventDefault();
    try {
      let savedRoute;
      if (isCreatingRoute) {
         savedRoute = await routeService.createRoute(editingRoute);
      } else {
         savedRoute = await routeService.updateRoute(editingRoute.ruta_id, editingRoute);
      }
      
      // Gestión de asignación de autobuses
      const routeId = savedRoute?.ruta_id || editingRoute.ruta_id;
      
      // 1. Autobuses que deben tener esta ruta
      const selectedBusesIds = editingRoute.buses_ids || [];
      
      // 2. Procesamos TODOS los autobuses para sincronizar
      await Promise.all(buses.map(bus => {
        const isSelected = selectedBusesIds.includes(bus.bus_id);
        const isCurrentlyAssigned = bus.ruta_id === routeId;

        if (isSelected && !isCurrentlyAssigned) {
          // Agregar a la ruta
          return fleetService.updateBus(bus.bus_id, { ...bus, ruta_id: routeId });
        } else if (!isSelected && isCurrentlyAssigned) {
          // Quitar de la ruta
          return fleetService.updateBus(bus.bus_id, { ...bus, ruta_id: null });
        }
        return Promise.resolve();
      }));

      // Limpiar caché de detalles para forzar recarga visual (colores y trayecto)
      setAllRouteDetails(prev => {
        const newState = { ...prev };
        delete newState[routeId];
        return newState;
      });

      setShowRouteForm(false); 
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const onNewStop = () => {
    setNewStop({ nombre: '', nombre_lugar: '', estado: '', municipio: '', localidad: 'Urbana', latitud: '', longitud: '', color: '#3498db' });
    setShowStopForm(true);
  };

  const onNewRoute = () => {
    setEditingRoute({ nombre: '', color: '#3498db', distancia_km: 0, activa: true, paradas_ids: [], buses_ids: [] });
    setIsCreatingRoute(true);
    setShowRouteForm(true);
  };

  const onSaveDriver = async (data) => {
    try {
      if (data.conductor_id) {
        await fleetService.updateDriver(data.conductor_id, data);
      } else {
        await fleetService.createDriver(data);
      }
      setShowDriverForm(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const onDeleteDriver = async (id) => {
    if (window.confirm("¿Eliminar conductor?")) {
      try {
        await fleetService.deleteDriver(id);
        setShowDriverForm(false);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const onSaveBus = async (data) => {
    try {
      if (data.bus_id) await fleetService.updateBus(data.bus_id, data);
      else await fleetService.createBus(data);
      setShowBusForm(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const onDeleteBus = async (id) => {
    try { await fleetService.deleteBus(id); setShowBusForm(false); fetchData(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        rutas={filteredRutas} paradas={filteredParadas} visibleRoutes={visibleRoutes} visibleStops={visibleStops} toggleRouteVisibility={toggleRouteVisibility} toggleStopVisibility={toggleStopVisibility} toggleAllStops={toggleAllStops} onNewRoute={onNewRoute} onNewStop={onNewStop} onDeleteStop={handleDeleteStop}
        filters={filters} setFilters={setFilters} filterOptions={filterOptions}
        showStopForm={showStopForm} setShowStopForm={setShowStopForm} handleCreateStop={handleCreateStop} newStop={newStop} setNewStop={setNewStop} isGeocoding={isGeocoding}
        showRouteForm={showRouteForm} setShowRouteForm={setShowRouteForm} onEditRoute={onEditRoute} editingRoute={editingRoute} setEditingRoute={setEditingRoute} onSaveRoute={onSaveRoute} onDeleteRoute={onDeleteRoute} isCreatingRoute={isCreatingRoute}
        companies={companies} showCompanyForm={showCompanyForm} setShowCompanyForm={setShowCompanyForm} onEditCompany={onEditRoute} editingCompany={editingCompany} setEditingCompany={setEditingCompany} onSaveCompany={async (e) => { e.preventDefault(); try { if (editingCompany?.empresa_id) await companyService.updateCompany(editingCompany.empresa_id, editingCompany); else await companyService.createCompany(editingCompany); setShowCompanyForm(false); fetchData(); } catch(err) { alert(err.message); } }} onDeleteCompany={async (id) => { if(confirm("¿Eliminar?")) { await companyService.deleteCompany(id); fetchData(); } }}
        buses={buses} showBusForm={showBusForm} setShowBusForm={setShowBusForm} editingBus={editingBus} setEditingBus={setEditingBus} onSaveBus={onSaveBus} onDeleteBus={onDeleteBus}
        drivers={drivers} showDriverForm={showDriverForm} setShowDriverForm={setShowDriverForm} editingDriver={editingDriver} setEditingDriver={setEditingDriver} onSaveDriver={onSaveDriver} onDeleteDriver={onDeleteDriver}
      />
      <main className="flex-1 relative flex flex-col min-w-0">
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
              onStopClick={handleStopClick}
              editingRoute={editingRoute}
              setEditingRoute={setEditingRoute}
              showRouteForm={showRouteForm}
           />
        </div>
      </main>
    </div>
  );
}
