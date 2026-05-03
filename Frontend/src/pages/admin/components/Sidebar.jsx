import React, { useState } from 'react';
import { 
  Activity, Eye, EyeOff, Plus, Trash2, Edit2, Search, Filter, 
  Map as MapIcon, Truck, Building2, User, Hash, Users, ShieldCheck, 
  ChevronRight, Info, ChevronDown, MapPin, Palette
} from 'lucide-react';
import StopForm from './StopForm';
import RouteForm from './RouteForm';
import CompanyForm from './CompanyForm';
import BusForm from './BusForm';
import DriverForm from './DriverForm';

export default function Sidebar({ 
  rutas, paradas, visibleRoutes, visibleStops, toggleRouteVisibility, toggleStopVisibility, toggleAllStops, onNewRoute, onDeleteStop,
  filters, setFilters, filterOptions,
  showStopForm, setShowStopForm, handleCreateStop, newStop, setNewStop, isGeocoding,
  showRouteForm, setShowRouteForm, onEditRoute, editingRoute, setEditingRoute, onSaveRoute, onDeleteRoute, isCreatingRoute,
  // Props Empresas
  companies, showCompanyForm, setShowCompanyForm, onEditCompany, editingCompany, setEditingCompany, onSaveCompany, onDeleteCompany,
  // Props Flota
  buses, showBusForm, setShowBusForm, onEditBus, editingBus, setEditingBus, onSaveBus, onDeleteBus,
  drivers, showDriverForm, setShowDriverForm, onEditDriver, editingDriver, setEditingDriver, onSaveDriver, onDeleteDriver
}) {
  const [activeTab, setActiveTab] = useState('operativo'); 

  // Seguridad: Asegurar que filterOptions siempre sea un objeto válido
  const options = filterOptions || { municipios: [], estados: [], colors: [] };

  return (
    <aside className="w-[420px] bg-white h-full flex flex-col relative border-r border-slate-100 z-20 shadow-xl shadow-slate-200/50">
        {/* FORMULARIOS SLIDE-DOWN */}
        <StopForm show={showStopForm} onClose={() => setShowStopForm(false)} onSubmit={handleCreateStop} newStop={newStop} setNewStop={setNewStop} isGeocoding={isGeocoding} />
        <RouteForm show={showRouteForm} onClose={() => setShowRouteForm(false)} onSubmit={onSaveRoute} onDelete={onDeleteRoute} routeData={editingRoute} setRouteData={setEditingRoute} isCreating={isCreatingRoute} />
        <CompanyForm show={showCompanyForm} onClose={() => setShowCompanyForm(false)} onSubmit={onSaveCompany} companyData={editingCompany} setCompanyData={setEditingCompany} />
        <BusForm show={showBusForm} onClose={() => setShowBusForm(false)} onSubmit={onSaveBus} data={editingBus} setData={setEditingBus} companies={companies} drivers={drivers} />
        <DriverForm show={showDriverForm} onClose={() => setShowDriverForm(false)} onSubmit={onSaveDriver} data={editingDriver} setData={setEditingDriver} />

        {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
        <div className="flex p-4 gap-2 bg-slate-50/50 border-b border-slate-100">
           {[
             { id: 'operativo', icon: MapIcon, label: 'Operativo' },
             { id: 'flota', icon: Truck, label: 'Flota' },
             { id: 'empresas', icon: Building2, label: 'Empresas' }
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <tab.icon size={16} />
                {tab.label}
             </button>
           ))}
        </div>

        <header className="px-9 pt-8 pb-4">
            <p className="text-primary font-black text-[11px] tracking-widest uppercase opacity-60">
              {activeTab === 'operativo' ? 'Administración' : activeTab === 'flota' ? 'Gestión de Flota' : 'Directorio'}
            </p>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
               {activeTab === 'operativo' ? 'Rutas y Estaciones' : activeTab === 'flota' ? 'Control de Unidades' : 'Empresas Aliadas'}
            </h2>
        </header>

        {/* FILTROS Y BUSCADOR UNIVERSAL */}
        <div className="px-6 pb-6 space-y-4">
           <div className="relative group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                 className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                 placeholder="Búsqueda Universal (Nombre, Municipio, Estado...)" 
                 value={filters.search}
                 onChange={e => setFilters({...filters, search: e.target.value})}
              />
           </div>

           {/* FILTROS ESPECÍFICOS */}
           {activeTab === 'operativo' && (
             <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                   <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   <select 
                      className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none uppercase tracking-tighter"
                      value={filters.municipio}
                      onChange={e => setFilters({...filters, municipio: e.target.value})}
                   >
                      <option value="">Municipio</option>
                      {options.municipios.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>

                <div className="relative">
                   <ShieldCheck size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   <select 
                      className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none uppercase tracking-tighter"
                      value={filters.estado}
                      onChange={e => setFilters({...filters, estado: e.target.value})}
                   >
                      <option value="">Estado</option>
                      {options.estados.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>

                <div className="relative col-span-2">
                   <Palette size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   <select 
                      className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none uppercase tracking-tighter"
                      value={filters.color}
                      onChange={e => setFilters({...filters, color: e.target.value})}
                   >
                      <option value="">Filtrar por Color de Línea</option>
                      {options.colors.map(color => (
                        <option key={color} value={color} style={{ color: color }}>● {color.toUpperCase()}</option>
                      ))}
                   </select>
                </div>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-24 scrollbar-hide">
            
            {/* VISTA OPERATIVA */}
            {activeTab === 'operativo' && (
              <>
                <section>
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-70">Líneas de Transporte</p>
                       <span className="bg-primary/5 text-primary text-[9px] font-black px-2 py-1 rounded-lg">{rutas.length} ACTIVAS</span>
                    </div>
                    <div className="space-y-3">
                        {rutas.map(ruta => (
                            <div key={ruta.ruta_id} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 hover:shadow-md transition-all group">
                                <div className="p-2.5 rounded-2xl text-white shadow-lg" style={{ background: ruta.color || '#005cc8' }}>
                                  <Activity size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="font-black text-[14px] text-slate-900 truncate tracking-tight">{ruta.nombre}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{ruta.numero_paradas} Paradas • {ruta.distancia_km || 0} KM</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => onEditRoute(ruta)} className="p-2 text-slate-300 hover:text-primary transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => toggleRouteVisibility(ruta.ruta_id)} className={`p-2 rounded-xl transition-colors ${visibleRoutes.includes(ruta.ruta_id) ? 'text-primary' : 'text-slate-300'}`}>
                                      {visibleRoutes.includes(ruta.ruta_id) ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-70">Listado de Paradas</p>
                        <button onClick={toggleAllStops} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          {visibleStops.length === paradas.length ? 'Ocultar Todas' : 'Mostrar Todas'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {paradas.map(parada => (
                            <div key={parada.parada_id} className="flex items-center gap-3 p-4 rounded-[24px] bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white group transition-all">
                                <div 
                                  onClick={() => toggleStopVisibility(parada.parada_id)}
                                  className={`w-4 h-4 rounded-full cursor-pointer border-2 shadow-sm transition-all ${visibleStops.includes(parada.parada_id) ? 'scale-110 border-white' : 'opacity-30 scale-90'}`} 
                                  style={{ backgroundColor: parada.color }} 
                                />
                                <div className="flex-1 min-w-0" onClick={() => toggleStopVisibility(parada.parada_id)}>
                                    <p className="text-[13px] font-extrabold truncate text-slate-800 tracking-tight">{parada.nombre}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                      <MapPin size={10} className="text-slate-300" />
                                      {parada.lugar?.municipio}, {parada.lugar?.estado}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteStop(parada.parada_id); }} 
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
              </>
            )}

            {activeTab === 'flota' && (
              <section>
                  <p className="text-xs font-bold text-slate-400 uppercase text-center py-10">Gestión de Flota en desarrollo...</p>
              </section>
            )}

            {activeTab === 'empresas' && (
              <section>
                  <p className="text-xs font-bold text-slate-400 uppercase text-center py-10">Directorio de Empresas en desarrollo...</p>
              </section>
            )}

        </div>

        {activeTab === 'operativo' && (
          <div className="p-6 bg-gradient-to-t from-white via-white to-transparent absolute bottom-0 left-0 right-0">
             <button className="w-full bg-primary text-white p-5 rounded-[28px] font-black text-base shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all" onClick={onNewRoute}>
                <Plus size={24} strokeWidth={3} /> Crear Nueva Ruta
              </button>
          </div>
        )}
    </aside>
  );
}
