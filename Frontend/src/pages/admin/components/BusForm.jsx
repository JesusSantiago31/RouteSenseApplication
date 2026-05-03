import React, { useState, useEffect } from 'react';
import { X, Truck, Users, Hash, Sparkles, Building2, UserCheck, Trash2 } from 'lucide-react';

export default function BusForm({ show, onClose, onSubmit, onDelete, busData, companies, drivers }) {
  const [formData, setFormData] = useState({
    placa: '',
    capacidad: 40,
    empresa_id: '',
    empresa: '',
    conductor_id: '',
    estado: true,
    color: '#3498db'
  });

  useEffect(() => {
    if (busData) {
      setFormData({
        placa: busData.placa || '',
        capacidad: busData.capacidad || 40,
        empresa_id: busData.empresa_id || '',
        empresa: busData.empresa || '',
        conductor_id: busData.conductor_id || '',
        estado: busData.estado !== undefined ? busData.estado : true,
        color: busData.color || '#3498db'
      });
    } else {
      setFormData({ placa: '', capacidad: 40, empresa_id: '', empresa: '', conductor_id: '', estado: true, color: '#3498db' });
    }
  }, [busData, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.empresa_id) payload.empresa_id = null;
    if (!payload.conductor_id) payload.conductor_id = null;
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
              {busData?.bus_id ? 'Editar Unidad' : 'Nuevo Autobús'}
            </h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${busData?.bus_id ? 'bg-indigo-500' : 'bg-primary'}`}></span>
              Gestión de Flota Vehicular
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>

       <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* PLACA Y CAPACIDAD */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
                Placa
              </label>
              <div className="relative group">
                 <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                 <input 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm uppercase" 
                  value={formData.placa} 
                  onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})} 
                  required 
                  placeholder="ABC-1234"
                 />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
                Capacidad
              </label>
              <div className="relative group">
                 <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                 <input 
                  type="number"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all shadow-sm" 
                  value={formData.capacidad} 
                  onChange={e => setFormData({...formData, capacidad: parseInt(e.target.value)})} 
                  required 
                  min={1}
                 />
              </div>
            </div>
          </div>

          {/* EMPRESA */}
          <div>
            <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
              Empresa Propietaria
            </label>
            <div className="relative group">
               <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
               <select
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer"
                value={formData.empresa_id || ''}
                onChange={e => {
                  const selectedId = e.target.value;
                  const selectedCompany = companies.find(c => c.empresa_id === selectedId);
                  setFormData({
                    ...formData, 
                    empresa_id: selectedId,
                    empresa: selectedCompany ? selectedCompany.nombre : '',
                    color: selectedCompany && selectedCompany.color ? selectedCompany.color : '#3498db'
                  });
                }}
                required
               >
                  <option value="">Seleccionar Empresa</option>
                  {Array.isArray(companies) && companies.map(c => (
                    <option key={c.empresa_id} value={c.empresa_id}>{c.nombre}</option>
                  ))}
               </select>
            </div>
          </div>

          {/* CHOFER Y COLOR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
                Chofer Asignado
              </label>
              <div className="relative group">
                 <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10" />
                 <select
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer"
                  value={formData.conductor_id || ''}
                  onChange={e => setFormData({...formData, conductor_id: e.target.value})}
                 >
                    <option value="">Sin chofer asignado</option>
                    {Array.isArray(drivers) && drivers.filter(d => d.activo).map(d => (
                      <option key={d.conductor_id} value={d.conductor_id}>{d.nombre}</option>
                    ))}
                 </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-primary mb-2.5 block tracking-[0.2em] uppercase opacity-80">
                Color de Unidad
              </label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: formData.color || '#3498db' }} />
                 <input 
                  type="color"
                  className="w-full h-[54px] pl-12 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer shadow-sm" 
                  value={formData.color || '#3498db'} 
                  onChange={e => setFormData({...formData, color: e.target.value})} 
                 />
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 mt-4">
            {busData?.bus_id && onDelete && (
              <button 
                type="button"
                onClick={() => { if(window.confirm('¿Eliminar unidad?')) onDelete(busData.bus_id); }}
                className="px-6 py-5 rounded-[22px] bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              type="submit" 
              className="flex-1 rounded-[22px] bg-gradient-to-r from-primary to-secondary text-white font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all py-5 uppercase tracking-widest"
            >
              {busData?.bus_id ? 'Guardar Cambios' : 'Registrar Autobús'}
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
