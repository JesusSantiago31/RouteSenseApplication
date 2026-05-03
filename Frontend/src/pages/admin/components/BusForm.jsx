import React from 'react';
import { X, Truck, Users, Hash, Save, Sparkles, Building2, UserCheck } from 'lucide-react';

export default function BusForm({ show, onClose, onSubmit, data, setData, isEditing, companies, drivers }) {
  if (!data) return null;

  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-9 z-[300] border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} 
    >
       <div className="flex justify-between mb-9 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{isEditing ? "Editar Unidad" : "Nuevo Autobús"}</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isEditing ? 'bg-primary' : 'bg-secondary'}`}></span>
              Gestión de flota vehicular
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>
       
       <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Placa del Vehículo</label>
                <div className="relative group">
                   <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={data.placa} 
                    onChange={e => setData({...data, placa: e.target.value})} 
                    required 
                    placeholder="Ej. ABC-1234" 
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Capacidad Pasajeros</label>
                <div className="relative group">
                   <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    type="number"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={data.capacidad} 
                    onChange={e => setData({...data, capacidad: e.target.value})} 
                    required 
                    placeholder="Ej. 40" 
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Asignar Empresa</label>
                <div className="relative group">
                   <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
                   <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer" 
                    value={data.empresa_id || ''} 
                    onChange={e => setData({...data, empresa_id: e.target.value})}
                    required
                   >
                      <option value="">Seleccionar Empresa</option>
                      {companies.map(c => (
                        <option key={c.empresa_id} value={c.empresa_id}>{c.nombre}</option>
                      ))}
                   </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Asignar Chofer</label>
                <div className="relative group">
                   <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
                   <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer" 
                    value={data.conductor_id || ''} 
                    onChange={e => setData({...data, conductor_id: e.target.value})}
                   >
                      <option value="">Sin chofer asignado</option>
                      {drivers.filter(d => d.activo).map(d => (
                        <option key={d.conductor_id} value={d.conductor_id}>{d.nombre}</option>
                      ))}
                   </select>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[22px] bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 active:translate-y-0"
             >
                <Save size={18} /> {isEditing ? "Guardar Cambios" : "Registrar Autobús"}
             </button>
          </div>
          
          <p className="text-[10px] text-slate-400 text-center font-bold flex items-center justify-center gap-2 italic uppercase">
            <Sparkles size={14} className="text-yellow-400 fill-yellow-400" /> 
            La unidad se vinculará al sistema de monitoreo en tiempo real
          </p>
       </form>
    </div>
  );
}
