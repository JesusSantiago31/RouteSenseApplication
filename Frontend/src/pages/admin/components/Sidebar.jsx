import { Activity, Eye, EyeOff, Plus, Trash2, Edit2, Search, Filter } from 'lucide-react';
import StopForm from './StopForm';
import RouteForm from './RouteForm';

export default function Sidebar({ 
  rutas, 
  paradas, 
  visibleRoutes, 
  visibleStops, 
  toggleRouteVisibility, 
  toggleStopVisibility, 
  toggleAllStops, 
  onNewRoute,
  onDeleteStop,
  // Props Paradas
  showStopForm,
  setShowStopForm,
  handleCreateStop,
  newStop,
  setNewStop,
  isGeocoding,
  // Props Rutas
  showRouteForm,
  setShowRouteForm,
  onEditRoute,
  editingRoute,
  setEditingRoute,
  onSaveRoute,
  onDeleteRoute,
  isCreatingRoute,
  // Props Filtros
  filters,
  setFilters,
  filterOptions
}) {
  return (
    <aside className="w-[420px] bg-white h-full flex flex-col relative border-r border-slate-100 z-20 shadow-xl shadow-slate-200/50">
        <StopForm 
          show={showStopForm}
          onClose={() => setShowStopForm(false)}
          onSubmit={handleCreateStop}
          newStop={newStop}
          setNewStop={setNewStop}
          isGeocoding={isGeocoding}
        />

        <RouteForm 
          show={showRouteForm}
          onClose={() => setShowRouteForm(false)}
          onSubmit={onSaveRoute}
          onDelete={onDeleteRoute}
          routeData={editingRoute}
          setRouteData={setEditingRoute}
          isCreating={isCreatingRoute}
        />

        <header className="px-9 pt-9 pb-4">
            <p className="text-primary font-black text-[11px] tracking-widest uppercase">Administración</p>
            <h2 className="text-2xl font-extrabold text-slate-800">Rutas de Servicio</h2>
        </header>

        {/* PANEL DE FILTROS PRO - Con overflow-visible para el dropdown */}
        <div className="px-6 pb-6 z-50">
            <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[24px] border border-slate-100 shadow-inner space-y-4 overflow-visible">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Filter size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Refinar Búsqueda</span>
                    </div>
                    {(filters.search || filters.color || filters.municipio || filters.estado) && (
                        <button 
                            onClick={() => setFilters({ search: '', color: '', municipio: '', estado: '' })}
                            className="text-[9px] font-bold text-primary hover:text-secondary transition-colors uppercase tracking-tighter"
                        >
                            Limpiar Todo
                        </button>
                    )}
                </div>

                <div className="relative group">
                   <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm" 
                      placeholder="Nombre de ruta o lugar..." 
                      value={filters.search}
                      onChange={e => setFilters({...filters, search: e.target.value})}
                   />
                </div>

                {/* Selector de Color Personalizado - Forzando superposición */}
                <div className="space-y-2 relative z-[100]">
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => {
                                const el = document.getElementById('color-dropdown');
                                el.classList.toggle('hidden');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 shadow-sm hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {filters.color ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: filters.color }} />
                                        <span className="uppercase font-mono text-[11px] tracking-wider text-primary">
                                            {filters.color}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-400">Todos los colores</span>
                                )}
                            </div>
                            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-300 rotate-45 mb-1" />
                        </button>

                        {/* Menú Desplegable - Totalmente opaco y por encima de todo */}
                        <div 
                            id="color-dropdown" 
                            className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1000] py-2 max-h-60 overflow-y-auto"
                        >
                            <button 
                                onClick={() => {
                                    setFilters({...filters, color: ''});
                                    document.getElementById('color-dropdown').classList.add('hidden');
                                }}
                                className="w-full flex items-center px-4 py-3 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-400 border-b border-slate-50 mb-1"
                            >
                                Mostrar Todas las Rutas
                            </button>
                            {filterOptions.colors.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => {
                                        setFilters({...filters, color: c});
                                        document.getElementById('color-dropdown').classList.add('hidden');
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-primary/5 transition-colors text-[11px] font-black text-slate-700"
                                >
                                    <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                                    <span className="uppercase font-mono tracking-wider">{c}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Selector de Municipio */}
                    <div className="relative">
                        <select 
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer shadow-sm"
                            value={filters.municipio}
                            onChange={e => setFilters({...filters, municipio: e.target.value})}
                        >
                            <option value="">Municipio</option>
                            {filterOptions.municipios.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Estado */}
                    <div className="relative">
                        <select 
                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer shadow-sm"
                            value={filters.estado}
                            onChange={e => setFilters({...filters, estado: e.target.value})}
                        >
                            <option value="">Estado</option>
                            {filterOptions.estados.map(est => (
                                <option key={est} value={est}>{est}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>

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
                            <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onEditRoute(ruta); }}
                                  className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                  title="Editar Ruta"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => toggleRouteVisibility(ruta.ruta_id)}
                                  className={`p-2 rounded-xl transition-colors ${visibleRoutes.includes(ruta.ruta_id) ? 'text-primary bg-primary/10' : 'text-slate-300'}`}
                                >
                                  {visibleRoutes.includes(ruta.ruta_id) ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>
                    )) : <p className="text-xs text-slate-400 italic px-2">No se encontraron rutas.</p>}
                </div>
            </section>

            {/* SECCIÓN DE ESTACIONES */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-primary font-black text-[10px] tracking-widest uppercase opacity-70">Paradas / Estaciones</p>
                    <button onClick={toggleAllStops} className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-tighter">Toggle Filtered</button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {paradas.length > 0 ? paradas.map(parada => (
                        <div 
                          key={parada.parada_id} 
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group ${visibleStops.includes(parada.parada_id) ? 'border-slate-200 bg-slate-50/50' : 'border-slate-50 hover:border-slate-100'}`}
                        >
                            <div 
                                onClick={() => toggleStopVisibility(parada.parada_id)}
                                className={`w-3 h-3 rounded-full shadow-inner transition-transform cursor-pointer ${visibleStops.includes(parada.parada_id) ? 'scale-125' : 'scale-100 opacity-40'}`}
                                style={{ backgroundColor: parada.color || '#3498db' }}
                            />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleStopVisibility(parada.parada_id)}>
                                <p className={`text-[13px] font-bold truncate ${visibleStops.includes(parada.parada_id) ? 'text-slate-700' : 'text-slate-400 font-medium'}`}>{parada.nombre}</p>
                                <p className="text-[10px] text-slate-400 truncate">{parada.lugar?.municipio}, {parada.lugar?.estado}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteStop(parada.parada_id); }}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar Estación"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <div 
                                  onClick={() => toggleStopVisibility(parada.parada_id)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${visibleStops.includes(parada.parada_id) ? 'text-primary bg-primary/10' : 'text-slate-200'}`}
                                >
                                    {visibleStops.includes(parada.parada_id) ? <Eye size={14} /> : <EyeOff size={14} />}
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-xs text-slate-400 italic px-2">No se encontraron paradas.</p>}
                </div>
            </section>
        </div>

        <button 
          className="flex items-center justify-center gap-3 bg-primary text-white m-6 p-5 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:brightness-110 hover:shadow-xl transition-all" 
          onClick={onNewRoute}
        >
          <Plus size={22} /> Nueva Ruta
        </button>
    </aside>
  );
}
