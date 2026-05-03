import React from 'react';
import { X, Building2, Briefcase, Phone, Save, Sparkles } from 'lucide-react';

export default function CompanyForm({ show, onClose, onSubmit, companyData, setCompanyData }) {
  if (!companyData) return null;

  return (
    <div 
      className={`absolute top-0 left-0 right-0 bg-white p-9 z-[300] border-b border-slate-100 shadow-2xl shadow-primary/10 rounded-b-[40px] transform transition-all duration-700 ease-in-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} 
    >
       <div className="flex justify-between mb-9 items-start">
          <div className="space-y-1">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">Gestión de Empresa</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
              Registro de transportista
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100/50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90">
            <X size={20} />
          </button>
       </div>
       
       <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Nombre de la Empresa</label>
                <div className="relative group">
                   <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={companyData.nombre} 
                    onChange={e => setCompanyData({...companyData, nombre: e.target.value})} 
                    required 
                    placeholder="Ej. Transportes del Norte" 
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Razón Social / ID</label>
                <div className="relative group">
                   <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={companyData.razon_social} 
                    onChange={e => setCompanyData({...companyData, razon_social: e.target.value})} 
                    required 
                    placeholder="RFC o ID Fiscal" 
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block tracking-[0.2em] uppercase opacity-80">Teléfono de Contacto</label>
                <div className="relative group">
                   <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                   <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" 
                    value={companyData.telefono} 
                    onChange={e => setCompanyData({...companyData, telefono: e.target.value})} 
                    required 
                    placeholder="+52 ..." 
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-primary mb-1 block text-center uppercase tracking-tighter opacity-80">Color Distintivo</label>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 h-14 rounded-[20px] border-4 border-white shadow-lg ring-1 ring-slate-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: companyData.color }}>
                       <input 
                          type="color" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          value={companyData.color} 
                          onChange={e => setCompanyData({...companyData, color: e.target.value})} 
                       />
                    </div>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[22px] bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 active:translate-y-0"
             >
                <Save size={18} /> Guardar Empresa
             </button>
          </div>
       </form>
    </div>
  );
}
