import React from 'react';
import { X, User, CreditCard, ShieldCheck, Save, Sparkles } from 'lucide-react';

export default function DriverForm({ show, onClose, onSubmit, data, setData, isEditing }) {
  if (!data) return null;

  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-9 z-[300] border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} 
    >
       <div className="flex justify-between mb-9 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{isEditing ? "Editar Chofer" : "Nuevo Chofer"}</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isEditing ? 'bg-primary' : 'bg-secondary'}`}></span>
              Gestión de personal operativo
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>
       
       <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Nombre Completo</label>
                <div className="relative group">
                   <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={data.nombre} 
                    onChange={e => setData({...data, nombre: e.target.value})} 
                    required 
                    placeholder="Nombre del conductor" 
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Número de Licencia</label>
                <div className="relative group">
                   <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={data.licencia} 
                    onChange={e => setData({...data, licencia: e.target.value})} 
                    required 
                    placeholder="ID Licencia de conducir" 
                   />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className={`p-2 rounded-lg ${data.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <ShieldCheck size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Estado del Conductor</p>
                <p className="text-[10px] text-slate-400 font-medium">Determina si puede ser asignado a un bus</p>
             </div>
             <button 
                type="button"
                onClick={() => setData({...data, activo: !data.activo})}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.activo ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-500'}`}
             >
                {data.activo ? 'Activo' : 'Inactivo'}
             </button>
          </div>

          <div className="flex gap-4 pt-4">
             <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[22px] bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 active:translate-y-0"
             >
                <Save size={18} /> {isEditing ? "Guardar Cambios" : "Registrar Chofer"}
             </button>
          </div>
          
          <p className="text-[10px] text-slate-400 text-center font-bold flex items-center justify-center gap-2 italic uppercase">
            <Sparkles size={14} className="text-yellow-400 fill-yellow-400" /> 
            El chofer estará disponible para asignación inmediata
          </p>
       </form>
    </div>
  );
}
