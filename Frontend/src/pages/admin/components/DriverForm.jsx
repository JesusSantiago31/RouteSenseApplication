import React, { useState, useEffect } from 'react';
import { X, User, Hash, Building2, Sparkles, ShieldCheck, Trash2 } from 'lucide-react';

export default function DriverForm({ show, onClose, onSubmit, onDelete, driverData, companies }) {
  const [formData, setFormData] = useState({
    nombre: '',
    licencia: '',
    empresa_id: '',
    activo: true
  });

  useEffect(() => {
    if (driverData) {
      setFormData({
        nombre: driverData.nombre || '',
        licencia: driverData.licencia || '',
        empresa_id: driverData.empresa_id || '',
        activo: driverData.activo !== undefined ? driverData.activo : true
      });
    } else {
      setFormData({ nombre: '', licencia: '', empresa_id: '', activo: true });
    }
  }, [driverData, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (driverData?.conductor_id) payload.conductor_id = driverData.conductor_id;
    if (!payload.empresa_id) payload.empresa_id = null;
    onSubmit(payload);
  };

  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white p-9 z-[200] border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      style={{ maxHeight: '95%', overflowY: 'auto' }}
    >
       <div className="flex justify-between mb-8 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">
              {driverData?.conductor_id ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${driverData?.conductor_id ? 'bg-indigo-500' : 'bg-primary'}`}></span>
              Gestión de Personal
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>

       <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* NOMBRE */}
          <div>
            <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
              Nombre Completo
            </label>
            <div className="relative group">
               <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
               <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
                required 
                placeholder="Ej. Juan García López" 
               />
            </div>
          </div>

          {/* LICENCIA */}
          <div>
            <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
              Número de Licencia
            </label>
            <div className="relative group">
               <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
               <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm uppercase tracking-widest" 
                value={formData.licencia} 
                onChange={e => setFormData({...formData, licencia: e.target.value.toUpperCase()})} 
                required 
                placeholder="Ej. LIC-123456" 
               />
            </div>
          </div>

          {/* EMPRESA */}
          <div>
            <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
              Empresa Asignada
            </label>
            <div className="relative group">
               <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
               <select
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer"
                value={formData.empresa_id || ''}
                onChange={e => setFormData({...formData, empresa_id: e.target.value})}
                required
               >
                  <option value="">Seleccionar Empresa</option>
                  {companies?.map(empresa => (
                    <option key={empresa.empresa_id} value={empresa.empresa_id}>
                      {empresa.nombre}
                    </option>
                  ))}
               </select>
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="flex gap-3 mt-4">
            {driverData?.conductor_id && onDelete && (
              <button 
                type="button"
                onClick={() => { if(window.confirm('¿Eliminar conductor?')) onDelete(driverData.conductor_id); }}
                className="px-6 py-5 rounded-[22px] bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              type="submit" 
              className="flex-1 rounded-[22px] bg-gradient-to-r from-primary to-secondary text-white font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all py-5 uppercase tracking-widest"
            >
              {driverData?.conductor_id ? 'Guardar Cambios' : 'Registrar Conductor'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-bold flex items-center justify-center gap-2 italic uppercase">
            <Sparkles size={14} className="text-yellow-400 fill-yellow-400" /> 
            El conductor se vinculará a la empresa seleccionada
          </p>
       </form>
    </div>
  );
}
