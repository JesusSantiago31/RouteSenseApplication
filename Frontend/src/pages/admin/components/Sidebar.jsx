import React, { useState } from 'react';
import { 
  Activity, Eye, EyeOff, Plus, Trash2, Edit2, Search,
  Map as MapIcon, Truck, Building2, User, UserCheck,
  ChevronRight, MapPinned
} from 'lucide-react';
import StopForm from './StopForm';
import RouteForm from './RouteForm';
import CompanyForm from './CompanyForm';
import BusForm from './BusForm';
import DriverForm from './DriverForm';

export default function Sidebar({ 
  rutas, paradas, visibleRoutes, visibleStops, toggleRouteVisibility, toggleStopVisibility, toggleAllStops, onNewRoute, onNewStop, onDeleteStop,
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
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  const options = {
    municipios: filterOptions?.municipios || [],
    estados: filterOptions?.estados || [],
    colors: filterOptions?.colors || []
  };

  const handleNewCompany = () => {
    setEditingCompany({ nombre: '', razon_social: '', telefono: '', color: '#3498db' });
    setShowCompanyForm(true);
  };

  return (
    <aside className="w-[420px] bg-white h-full flex flex-col relative border-r border-slate-100 z-20 shadow-xl shadow-slate-200/50">
        <StopForm show={showStopForm} onClose={() => setShowStopForm(false)} onSubmit={handleCreateStop} newStop={newStop} setNewStop={setNewStop} isGeocoding={isGeocoding} />
        <RouteForm show={showRouteForm} onClose={() => setShowRouteForm(false)} onSubmit={onSaveRoute} onDelete={onDeleteRoute} routeData={editingRoute} setRouteData={setEditingRoute} isCreating={isCreatingRoute} />
        <CompanyForm show={showCompanyForm} onClose={() => setShowCompanyForm(false)} onSubmit={onSaveCompany} companyData={editingCompany} setCompanyData={setEditingCompany} />
        <BusForm key={`bus-${showBusForm}`} show={showBusForm} onClose={() => setShowBusForm(false)} onSubmit={onSaveBus} onDelete={onDeleteBus} busData={editingBus} companies={companies} drivers={drivers} />
        <DriverForm key={`driver-${showDriverForm}`} show={showDriverForm} onClose={() => setShowDriverForm(false)} onSubmit={onSaveDriver} onDelete={onDeleteDriver} driverData={editingDriver} companies={companies} />

        {/* TABS NAVEGACIÓN */}
        <div className="flex p-4 gap-2 bg-slate-50/50 border-b border-slate-100">
           {[
             { id: 'operativo', icon: MapIcon, label: 'Operativo' },
             { id: 'flota', icon: Truck, label: 'Flota' },
             { id: 'empresas', icon: Building2, label: 'Empresas' }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
            
            {/* CONTENIDO PESTAÑA: OPERATIVO */}
            {activeTab === 'operativo' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col h-full">
                <header className="px-9 pt-8 pb-4">
                    <p className="text-primary font-black text-[11px] tracking-widest uppercase opacity-60">Administración</p>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Control de Tránsito</h2>
                </header>

                <div className="px-6 pb-6 space-y-4 border-b border-slate-50">
                   <div className="relative group">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" placeholder="Búsqueda Universal..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <select className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 appearance-none uppercase" value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value})}>
                         <option value="">Municipio</option>
                         {options.municipios.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 appearance-none uppercase" value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})}>
                         <option value="">Estado</option>
                         {options.estados.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="col-span-2 w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 appearance-none uppercase" value={filters.color} onChange={e => setFilters({...filters, color: e.target.value})}>
                         <option value="">Filtrar por Color de Línea</option>
                         {options.colors.map(c => <option key={c} value={c} style={{color: c}}>● {c.toUpperCase()}</option>)}
                      </select>
                   </div>
                </div>

                <div className="px-6 py-8 space-y-8 pb-32">
                    <section>
                        <p className="text-primary font-black text-[10px] tracking-widest uppercase mb-4 opacity-70">Líneas de Transporte</p>
                        <div className="space-y-3">
                            {rutas.map(ruta => (
                                <div key={ruta.ruta_id} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 group transition-all shadow-sm">
                                    <div className="p-2.5 rounded-2xl text-white shadow-lg" style={{ background: ruta.color || '#005cc8' }}><Activity size={18} /></div>
                                    <div className="flex-1 min-w-0">
                                       <p className="font-black text-[14px] text-slate-900 truncate">{ruta.nombre}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase">{ruta.numero_paradas} Paradas</p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => onEditRoute(ruta)} className="p-2 text-slate-300 hover:text-primary"><Edit2 size={16} /></button>
                                        <button onClick={() => toggleRouteVisibility(ruta.ruta_id)} className={`p-2 rounded-xl transition-colors ${visibleRoutes.includes(ruta.ruta_id) ? 'text-primary bg-primary/5' : 'text-slate-300'}`}>
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
                            <button onClick={toggleAllStops} className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Toggle</button>
                        </div>
                        <div className="space-y-2">
                            {paradas.map(parada => (
                                <div key={parada.parada_id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white group transition-all cursor-pointer">
                                    <div onClick={(e) => { e.stopPropagation(); toggleStopVisibility(parada.parada_id); }} className={`w-4 h-4 rounded-full border-2 transition-all ${visibleStops.includes(parada.parada_id) ? 'scale-110 border-white' : 'opacity-30 scale-90'}`} style={{ backgroundColor: parada.color }} />
                                    <div className="flex-1 min-w-0" onClick={() => toggleStopVisibility(parada.parada_id)}>
                                        <p className="text-[13px] font-extrabold text-slate-800 truncate">{parada.nombre}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{parada.lugar?.municipio || parada.municipio}, {parada.lugar?.estado || parada.estado}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteStop(parada.parada_id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <div className="p-6 bg-gradient-to-t from-white via-white to-transparent absolute bottom-0 left-0 right-0 z-30 flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-primary transition-all active:scale-95" onClick={onNewRoute}><Plus size={18} strokeWidth={3} /> Ruta</button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={onNewStop}><MapPinned size={18} strokeWidth={2.5} /> Parada</button>
                </div>
              </div>
            )}

            {/* CONTENIDO PESTAÑA: EMPRESAS */}
            {activeTab === 'empresas' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 px-6 py-6 h-full flex flex-col">
                <header className="mb-4">
                    <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-60">Directorio Aliado</p>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Empresas de Transporte</h2>
                    
                    <div className="flex flex-col gap-3 mt-4">
                        <button onClick={handleNewCompany} className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all active:scale-95"><Plus size={16} strokeWidth={3} /> Registrar Empresa</button>
                        
                        {/* BUSCADOR GENERAL */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                            <input 
                                type="text" 
                                placeholder="BUSCAR EMPRESA O RAZÓN SOCIAL..."
                                value={companySearchTerm}
                                onChange={(e) => setCompanySearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar pb-24">
                    {companies
                      .filter(c => 
                        c.nombre.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                        c.razon_social.toLowerCase().includes(companySearchTerm.toLowerCase())
                      )
                      .map(company => (
                        <div key={company.empresa_id} className="relative p-5 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            {/* RESTAURANDO CÍRCULO DE FONDO */}
                            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.05]" style={{ backgroundColor: company.color }} />
                            
                            <div className="relative flex items-center gap-4">
                               <div className="w-14 h-14 rounded-[20px] flex items-center justify-center shadow-xl border-4 border-white transform group-hover:rotate-6 transition-transform flex-shrink-0" style={{ backgroundColor: company.color, color: 'white' }}>
                                  <Building2 size={24} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="font-black text-base text-slate-800 tracking-tighter truncate leading-tight">{company.nombre}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{company.razon_social}</span>
                                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">{company.telefono}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                               <button onClick={() => { setEditingCompany(company); setShowCompanyForm(true); }} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all">Configurar</button>
                               <button onClick={() => onDeleteCompany(company.empresa_id)} className="px-4 py-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* CONTENIDO PESTAÑA: FLOTA */}
            {activeTab === 'flota' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 px-6 py-6 h-full flex flex-col">
                <header className="mb-4">
                    <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-60">Gestión de Activos</p>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Personal y Unidades</h2>
                    
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingDriver(null); setShowDriverForm(true); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-[20px] font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all active:scale-95"><User size={15} /> + Chofer</button>
                           <button onClick={() => { setEditingBus(null); setShowBusForm(true); }} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"><Truck size={15} /> + Autobús</button>
                        </div>
                        
                        {/* BUSCADOR DE FLOTA */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                            <input 
                                type="text" 
                                placeholder="BUSCAR CHOFER O UNIDAD..."
                                className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar pb-24">
                    {/* SECCIÓN CONDUCTORES */}
                    <section>
                      <div className="flex justify-between items-center mb-3 px-2">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conductores ({drivers.length})</h5>
                      </div>
                      <div className="space-y-2">
                        {drivers.map(driver => {
                          const empresa = companies.find(c => c.empresa_id === driver.empresa_id);
                          return (
                            <div key={driver.conductor_id} onClick={() => { setEditingDriver(driver); setShowDriverForm(true); }} className="flex items-center gap-3 p-3 rounded-[22px] bg-white border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group">
                               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <User size={18} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-black text-slate-800 uppercase truncate">{driver.nombre}</p>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-bold text-slate-400 tracking-wider">LIC: {driver.licencia}</span>
                                     {empresa && (
                                       <>
                                         <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                         <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: empresa.color }}>{empresa.nombre}</span>
                                       </>
                                     )}
                                  </div>
                               </div>
                               <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                </div>
              </div>
            )}

        </div>
    </aside>
  );
}
