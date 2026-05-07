import React from 'react';
import { X, Building2, Hash, Phone, Palette, Save } from 'lucide-react';

export default function CompanyForm({ show, onClose, onSubmit, companyData, setCompanyData }) {
  if (!show) return null;

  return (
    <div className="absolute inset-x-0 top-0 z-40 bg-white border-b border-slate-100 shadow-2xl animate-in slide-in-from-top duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <header className="px-8 pt-8 pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tighter">Alta de Empresa</h3>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Registro de transportista</p>
        </div>
        <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={onSubmit} className="px-8 pb-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* NOMBRE */}
          <div className="col-span-2 space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
            <div className="relative group">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Ej. Transportes Occidente"
                value={companyData?.nombre || ''}
                onChange={e => setCompanyData({...companyData, nombre: e.target.value})}
                required
              />
            </div>
          </div>

          {/* RAZÓN SOCIAL */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
            <div className="relative group">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="RFC / ID"
                value={companyData?.razon_social || ''}
                onChange={e => setCompanyData({...companyData, razon_social: e.target.value})}
                required
              />
            </div>
          </div>

          {/* TELÉFONO */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
            <div className="relative group">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="tel" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="+52..."
                value={companyData?.telefono || ''}
                onChange={e => setCompanyData({...companyData, telefono: e.target.value})}
                required
              />
            </div>
          </div>

          {/* COLOR */}
          <div className="col-span-2 space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <input 
                  type="color" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  value={companyData?.color || '#3498db'}
                  onChange={e => setCompanyData({...companyData, color: e.target.value})}
                />
                <div 
                  className="w-full h-full rounded-xl border-4 border-white shadow-md"
                  style={{ backgroundColor: companyData?.color || '#3498db' }}
                />
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="#000000"
                  maxLength={7}
                  value={companyData?.color || '#3498DB'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.startsWith('#') || val === '') {
                      setCompanyData({...companyData, color: val});
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary transition-all active:scale-95"
        >
          <Save size={18} /> Guardar Empresa
        </button>
      </form>
    </div>
  );
}
