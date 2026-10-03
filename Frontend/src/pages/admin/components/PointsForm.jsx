import React, { useState, useEffect } from 'react';
import { Award, Coins, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Stamp, HelpCircle } from 'lucide-react';
import { pointsService } from '../../../services/pointsService';

export default function PointsForm() {
  const [montoDinero, setMontoDinero] = useState(10);
  const [puntosOtorgados, setPuntosOtorgados] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Simulación rápida
  const [simularGasto, setSimularGasto] = useState(50);

  const loadPointsConfig = async () => {
    setLoading(true);
    try {
      const data = await pointsService.getPointsConfig();
      if (data) {
        setMontoDinero(data.monto_dinero || 10);
        setPuntosOtorgados(data.puntos_otorgados || 1);
        setDescripcion(data.descripcion || '');
      }
    } catch (err) {
      console.error("Error al cargar configuración de puntos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPointsConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (montoDinero <= 0 || puntosOtorgados < 0) {
      setMessage({ type: 'error', text: 'El dinero debe ser mayor a $0 y los puntos no pueden ser negativos.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        monto_dinero: Number(montoDinero),
        puntos_otorgados: Number(puntosOtorgados),
        descripcion: descripcion || `${puntosOtorgados} punto(s) por cada $${montoDinero} MXN gastados`
      };
      await pointsService.updatePointsConfig(payload);
      setMessage({ type: 'success', text: '¡Regla de bonificación de puntos guardada exitosamente!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar la regla de puntos.' });
    } finally {
      setSaving(false);
    }
  };

  const puntosCalculadosSimulacion = Math.floor((Number(simularGasto) || 0) / (Number(montoDinero) || 1)) * Number(puntosOtorgados);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Award size={20} />
          </span>
          <div>
            <p className="text-amber-600 font-black text-[10px] tracking-widest uppercase">Fidelización</p>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Puntos y Recompensas</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Configura la relación de bonificación de puntos abonados a los pasajeros por cada compra o gasto en la aplicación.
        </p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : <AlertCircle size={18} className="shrink-0 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-amber-50/20 p-5 rounded-3xl border border-amber-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100/60">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-amber-500" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Regla de Bonificación por Gasto</h3>
          </div>
          <button 
            type="button" 
            onClick={loadPointsConfig}
            disabled={loading}
            className="text-slate-400 hover:text-amber-600 transition-colors p-1"
            title="Recargar configuración"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Monto Dinero */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Por cada Dinero Gastado ($ MXN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">$</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={montoDinero}
                onChange={(e) => setMontoDinero(e.target.value)}
                className="w-full pl-8 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                placeholder="10"
              />
            </div>
          </div>

          {/* Puntos Otorgados */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Se Bonificarán (Puntos)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-500">pts</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={puntosOtorgados}
                onChange={(e) => setPuntosOtorgados(e.target.value)}
                className="w-full pl-11 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Resumen Leyenda explicativa */}
        <div className="p-3.5 bg-white rounded-2xl border border-amber-100 flex items-start gap-3">
          <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-slate-700">Regla activa resultante:</p>
            <p className="text-[11px] text-amber-900/80 font-bold">
              El usuario ganará <span className="text-amber-600 font-extrabold">{puntosOtorgados} punto(s)</span> por cada <span className="text-slate-900 font-extrabold">${montoDinero || 0}.00 MXN</span> acumulados en pasajes o recargas.
            </p>
          </div>
        </div>

        {/* Descripción personalizable opcional */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            Descripción / Leyenda Personalizada (Opcional)
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
            placeholder="Ej. Gana 1 punto por cada $10 pesos gastados en cualquier ruta"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Guardar Regla de Puntos
            </>
          )}
        </button>
      </form>

      {/* SIMULADOR EN VIVO */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Simulador para Pasajeros</h4>
        </div>
        <p className="text-[11px] text-slate-500">Prueba cómo se calcularán los puntos según el consumo del usuario:</p>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-[9px] font-black text-slate-400 uppercase">Si el cliente gasta:</span>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
              <input
                type="number"
                min="0"
                value={simularGasto}
                onChange={(e) => setSimularGasto(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center">
            <span className="text-[9px] font-black text-amber-600 uppercase block">Obtendrá</span>
            <span className="text-lg font-black text-amber-600 tracking-tight">{puntosCalculadosSimulacion}</span>
            <span className="text-[10px] font-bold text-amber-700 block">Puntos</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN INDEPENDIENTE: SELLOS POR VISITAS */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2">
          <Stamp size={18} className="text-indigo-500" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Puntos por Visita (Sellos)</h4>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[8px] font-black tracking-widest uppercase">Modulo Independiente</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Los puntos por visita basados en acumulación de sellos se gestionan de forma totalmente independiente a la regla de bonificación por dinero. Puedes configurar esa dinámica cuando lo requieras.
        </p>
      </div>
    </div>
  );
}
