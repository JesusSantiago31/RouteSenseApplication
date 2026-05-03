import React from 'react';
import { X, Tag, MapPin, Building2, Globe2, Sparkles } from 'lucide-react';

export default function StopForm({ show, onClose, onSubmit, newStop, setNewStop, isGeocoding }) {
  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white p-9 z-[200] border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} 
      style={{ maxHeight: '95%', overflowY: 'auto' }}
    >
       <div className="flex justify-between mb-8 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">Nueva Ruta / Estación</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Registro de ubicación y servicio
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>
       
       <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex gap-4 items-end">
             <div className="flex-1">
                <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">Nombre de la Ruta / Estación</label>
                <div className="relative group">
                   <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={newStop.nombre} 
                    onChange={e => setNewStop({...newStop, nombre: e.target.value})} 
                    required 
                    placeholder="Ej. Línea 5 - Estación Central" 
                   />
                </div>
             </div>
             <div className="w-20">
                <label className="text-[10px] font-black text-primary mb-2.5 block text-center uppercase tracking-tighter opacity-80">Color</label>
                <div className="relative w-full h-14 rounded-[20px] border-4 border-white shadow-lg ring-1 ring-slate-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: newStop.color }}>
                   <input 
                      type="color" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      value={newStop.color} 
                      onChange={e => setNewStop({...newStop, color: e.target.value})} 
                   />
                </div>
             </div>
           </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 block tracking-widest">LATITUD</label>
                <div className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl text-[13px] font-mono font-bold text-primary text-center">
                  {newStop.latitud || '---'}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 block tracking-widest">LONGITUD</label>
                <div className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl text-[13px] font-mono font-bold text-primary text-center">
                  {newStop.longitud || '---'}
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary block tracking-[0.2em] uppercase opacity-80">Ubicación Física</label>
            <div className="relative group">
               <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
               <input className="w-full pl-12 pr-4 py-4 border border-slate-100 bg-slate-50/50 rounded-[20px] font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" value={newStop.nombre_lugar} onChange={e => setNewStop({...newStop, nombre_lugar: e.target.value})} placeholder="Nombre de la calle o lugar" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="relative group">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input className="w-full pl-11 pr-3 py-3.5 border border-slate-100 bg-slate-50/50 rounded-[18px] text-[13px] font-semibold text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" value={newStop.municipio} onChange={e => setNewStop({...newStop, municipio: e.target.value})} placeholder="Municipio" />
               </div>
               <div className="relative group">
                  <Globe2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input className="w-full pl-11 pr-3 py-3.5 border border-slate-100 bg-slate-50/50 rounded-[18px] text-[13px] font-semibold text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" value={newStop.estado} onChange={e => setNewStop({...newStop, estado: e.target.value})} placeholder="Estado" />
               </div>
            </div>
          </div>

          <button type="submit" className="mt-4 rounded-[22px] bg-gradient-to-r from-primary to-secondary text-white font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all py-5 uppercase tracking-widest">
             {isGeocoding ? "Procesando..." : "Confirmar Estación"}
          </button>
          <p className="text-[10px] text-slate-400 text-center font-bold flex items-center justify-center gap-2 italic uppercase">
            <Sparkles size={14} className="text-yellow-400 fill-yellow-400" /> 
            Haga clic en el mapa para ubicar la parada
          </p>
       </form>
    </div>
  );
}
