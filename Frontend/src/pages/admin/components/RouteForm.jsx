import React from 'react';
import { X, Tag, Trash2, Save, Sparkles, Activity } from 'lucide-react';

export default function RouteForm({ show, onClose, onSubmit, onDelete, routeData, setRouteData, isCreating }) {
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
