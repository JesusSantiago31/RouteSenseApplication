import React, { useState, useEffect } from 'react';
import { X, User, Hash, Building2, Save, Trash2 } from 'lucide-react';

export default function DriverForm({ show, onClose, onSubmit, onDelete, driverData, companies }) {
  const [formData, setFormData] = useState({
    nombre: '',
    licencia: '',
    empresa_id: '',
    activo: true
  });

  useEffect(() => {
    if (driverData) {
      setFormData(driverData);
    } else {
      setFormData({ nombre: '', licencia: '', empresa_id: '', activo: true });
    }
  }, [driverData, show]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 flex items-start justify-center pt-20 px-6">
      <div className="w-full max-w-md bg-white rounded-[35px] shadow-2xl overflow-hidden animate-in slide-in-from-top-8 duration-500">
        <header className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight">
              {driverData?.conductor_id ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestión de Personal</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-5">
          <div className="space-y-4">
            {/* NOMBRE */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                required
                type="text"
                placeholder="NOMBRE COMPLETO"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* LICENCIA */}
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                required
                type="text"
                placeholder="NÚMERO DE LICENCIA"
                value={formData.licencia}
                onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* EMPRESA */}
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <select
                required
                value={formData.empresa_id}
                onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECCIONAR EMPRESA</option>
                {companies?.map(c => (
                  <option key={c.empresa_id} value={c.empresa_id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-primary transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {driverData?.conductor_id ? 'Guardar' : 'Registrar'}
            </button>
            
            {driverData?.conductor_id && (
              <button
                type="button"
                onClick={() => onDelete(driverData.conductor_id)}
                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-100"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
