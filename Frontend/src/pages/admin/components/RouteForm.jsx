import React from 'react';
import { X, Tag, Trash2, Save, Sparkles, Activity } from 'lucide-react';

export default function RouteForm({ show, onClose, onSubmit, onDelete, routeData, setRouteData, isCreating, paradas = [], buses = [] }) {
  if (!routeData) return null;

  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-9 z-50 border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} 
    >
       <div className="flex justify-between mb-9 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{isCreating ? "Nueva Línea" : "Editar Ruta"}</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isCreating ? 'bg-secondary' : 'bg-primary'}`}></span>
              {isCreating ? "Creación de servicio" : "Gestión de línea"}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>
       
       <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex gap-4 items-end">
             <div className="flex-1">
                <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">Nombre de la Ruta</label>
                <div className="relative group">
                   <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={routeData.nombre} 
                    onChange={e => setRouteData({...routeData, nombre: e.target.value})} 
                    required 
                    placeholder="Ej. Línea 5 - Periférico" 
                   />
                </div>
             </div>
             <div className="w-20">
                <label className="text-[10px] font-black text-primary mb-2.5 block text-center uppercase tracking-tighter opacity-80">Color</label>
                <div className="relative w-full h-14 rounded-[20px] border-4 border-white shadow-lg ring-1 ring-slate-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: routeData.color }}>
                   <input 
                      type="color" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      value={routeData.color} 
                      onChange={e => setRouteData({...routeData, color: e.target.value})} 
                   />
                </div>
             </div>
          </div>

          {/* Selector de Paradas */}
          <div>
            <label className="text-[10px] font-black text-primary mb-2 block tracking-[0.2em] uppercase opacity-80">Seleccionar Paradas (Orden de Ruta)</label>
            <div className="h-32 overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-[20px] p-3 space-y-1 custom-scrollbar">
               {paradas.map(p => {
                  const index = (routeData.paradas_ids || []).indexOf(p.parada_id);
                  const isSelected = index !== -1;
                  return (
                     <div 
                        key={p.parada_id} 
                        onClick={() => {
                           const current = routeData.paradas_ids || [];
                           if (isSelected) setRouteData({...routeData, paradas_ids: current.filter(id => id !== p.parada_id)});
                           else setRouteData({...routeData, paradas_ids: [...current, p.parada_id]});
                        }}
                        className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
                     >
                        <span>{p.nombre}</span>
                        {isSelected && <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{index + 1}</span>}
                     </div>
                  );
               })}
               {paradas.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No hay paradas registradas</p>}
            </div>
          </div>

          {/* Selector de Autobuses */}
          <div className="mb-6">
            <label className="text-[10px] font-black text-primary mb-2 block tracking-[0.2em] uppercase opacity-80">Asignar Unidades (Autobuses)</label>
            <div className="h-24 overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-[20px] p-3 space-y-1 custom-scrollbar">
               {buses.map(b => {
                  const isSelected = (routeData.buses_ids || []).includes(b.bus_id);
                  return (
                     <div 
                        key={b.bus_id} 
                        onClick={() => {
                           const current = routeData.buses_ids || [];
                           if (isSelected) setRouteData({...routeData, buses_ids: current.filter(id => id !== b.bus_id)});
                           else setRouteData({...routeData, buses_ids: [...current, b.bus_id]});
                        }}
                        className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
                     >
                        <div className="flex gap-2 items-center">
                           <span>{b.placa}</span>
                           <span className="text-[10px] opacity-70">({b.capacidad} PAX)</span>
                        </div>
                     </div>
                  );
               })}
               {buses.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No hay autobuses disponibles</p>}
            </div>
          </div>

          {/* Tarifas y Pagos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/80 rounded-[30px] border border-slate-100">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-primary mb-2 block tracking-[0.2em] uppercase opacity-80">Configuración de Tarifa</label>
                <div className="flex gap-2">
                   <button 
                      type="button"
                      onClick={() => setRouteData({...routeData, tipo_tarifa: 'fija'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${routeData.tipo_tarifa === 'fija' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                   >
                      Ruta Completa
                   </button>
                   <button 
                      type="button"
                      onClick={() => setRouteData({...routeData, tipo_tarifa: 'por_parada'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${routeData.tipo_tarifa === 'por_parada' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                   >
                      Por Parada
                   </button>
                </div>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                   <input 
                      type="number" 
                      step="0.5"
                      value={routeData.monto_tarifa || 0}
                      onChange={e => setRouteData({...routeData, monto_tarifa: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Monto"
                   />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-primary mb-2 block tracking-[0.2em] uppercase opacity-80">Métodos de Pago Aceptados</label>
                <div className="grid grid-cols-1 gap-2">
                   <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/30 transition-all">
                      <input 
                         type="checkbox" 
                         checked={routeData.acepta_efectivo} 
                         onChange={e => setRouteData({...routeData, acepta_efectivo: e.target.checked})}
                         className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-slate-600">Efectivo</span>
                   </label>
                   <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/30 transition-all">
                      <input 
                         type="checkbox" 
                         checked={routeData.acepta_tarjeta} 
                         onChange={e => setRouteData({...routeData, acepta_tarjeta: e.target.checked})}
                         className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-slate-600">Tarjeta Débito/Crédito</span>
                   </label>
                   <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/30 transition-all">
                      <input 
                         type="checkbox" 
                         checked={routeData.acepta_tarjeta_especial} 
                         onChange={e => setRouteData({...routeData, acepta_tarjeta_especial: e.target.checked})}
                         className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-slate-600">Tarjeta Especial (Prepago)</span>
                   </label>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-4">
             {!isCreating && (
                <button 
                  type="button" 
                  onClick={() => onDelete(routeData.ruta_id)}
                  className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[22px] border-2 border-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                >
                  <Trash2 size={18} /> Borrar
                </button>
             )}
             <button 
                type="submit" 
                className={`flex-[2] flex items-center justify-center gap-3 py-5 rounded-[22px] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${isCreating ? 'bg-gradient-to-r from-secondary to-primary shadow-secondary/25 hover:shadow-secondary/40' : 'bg-primary shadow-primary/25 hover:shadow-primary/40'}`}
             >
                <Save size={18} /> {isCreating ? "Crear Ruta" : "Guardar Cambios"}
             </button>
          </div>
          
          {isCreating && (
            <p className="text-[10px] text-slate-400 text-center font-bold flex items-center justify-center gap-2 italic uppercase">
              <Sparkles size={14} className="text-yellow-400 fill-yellow-400" /> 
              Se generará un ID único para esta línea
            </p>
          )}
       </form>
    </div>
  );
}
