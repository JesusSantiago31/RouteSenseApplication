import React, { useState, useEffect } from 'react';
import { Award, Coins, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Stamp, Image, Link, Wallet, ArrowRight, Save, Layers } from 'lucide-react';
import { pointsService } from '../../../services/pointsService';

export default function PointsForm() {
  // Estado Puntos por Dinero
  const [montoDinero, setMontoDinero] = useState(10);
  const [puntosOtorgados, setPuntosOtorgados] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [simularGasto, setSimularGasto] = useState(50);

  // Estado Sistema de Sellos & ImgBB / Google Wallet
  const [maxSellos, setMaxSellos] = useState(10);
  const [puntosRecompensaCanje, setPuntosRecompensaCanje] = useState(50);
  const [sellosImagenes, setSellosImagenes] = useState([]);
  const [selectedSelloTab, setSelectedSelloTab] = useState(0);
  const [savingSellos, setSavingSellos] = useState(false);

  // Simulador de Sellos y Reset
  const [simularSellosUsuario, setSimularSellosUsuario] = useState(0);
  const [simuladorMensajeCanje, setSimuladorMensajeCanje] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pointsData, stampConfigData, stampImgsData] = await Promise.all([
        pointsService.getPointsConfig(),
        pointsService.getStampConfig(),
        pointsService.getStampImages()
      ]);

      if (pointsData) {
        setMontoDinero(pointsData.monto_dinero || 10);
        setPuntosOtorgados(pointsData.puntos_otorgados || 1);
        setDescripcion(pointsData.descripcion || '');
      }

      if (stampConfigData) {
        setMaxSellos(stampConfigData.max_stamps || 10);
        setPuntosRecompensaCanje(stampConfigData.reward_points_bonus || 50);
      }

      if (stampImgsData && Array.isArray(stampImgsData)) {
        setSellosImagenes(stampImgsData);
      }
    } catch (err) {
      console.error("Error al cargar datos de configuración:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitPoints = async (e) => {
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

  const handleUpdateImageUrl = (count, url) => {
    setSellosImagenes(prev => prev.map(img => {
      if (img.stamp_count === count) {
        return { ...img, image_url: url, wallet_hero_url: url };
      }
      return img;
    }));
  };

  const handleSaveSellos = async () => {
    setSavingSellos(true);
    setMessage({ type: '', text: '' });
    try {
      await Promise.all([
        pointsService.updateStampConfig({
          max_stamps: Number(maxSellos),
          reward_points_bonus: Number(puntosRecompensaCanje),
          reward_description: `Recompensa de ${puntosRecompensaCanje} puntos por completar ${maxSellos} sellos`
        }),
        pointsService.updateStampImagesBatch(sellosImagenes)
      ]);
      setMessage({ type: 'success', text: '¡Configuración de sellos e imágenes de Google Wallet guardadas exitosamente!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar configuración de sellos.' });
    } finally {
      setSavingSellos(false);
    }
  };

  const handleSimularIncrementarSello = () => {
    setSimularSellosUsuario(prev => {
      const nuevo = prev + 1;
      if (nuevo > maxSellos) {
        setSimuladorMensajeCanje(`¡Meta de ${maxSellos} sellos alcanzada! Haz clic en "Canjear y Resetear".`);
        return maxSellos;
      }
      return nuevo;
    });
  };

  const handleSimularCanjearSellos = () => {
    setSimularSellosUsuario(0);
    setSimuladorMensajeCanje(`¡Tarjeta de sellos canjeada! Te hemos otorgado +${puntosRecompensaCanje} puntos y la imagen de Google Wallet ha vuelto a 0 sellos.`);
    setTimeout(() => setSimuladorMensajeCanje(''), 5000);
  };

  const puntosCalculadosSimulacion = Math.floor((Number(simularGasto) || 0) / (Number(montoDinero) || 1)) * Number(puntosOtorgados);
  const imagenSelloActual = sellosImagenes.find(i => i.stamp_count === Number(selectedSelloTab)) || { image_url: '' };
  const imagenSelloSimulador = sellosImagenes.find(i => i.stamp_count === Number(simularSellosUsuario)) || { image_url: '' };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300 pb-28">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Award size={20} />
            </span>
            <div>
              <p className="text-amber-600 font-black text-[10px] tracking-widest uppercase">Fidelización & Wallet</p>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Puntos y Sistema de Sellos</h2>
            </div>
          </div>
          <button 
            type="button" 
            onClick={loadData}
            disabled={loading}
            className="text-slate-400 hover:text-amber-600 transition-colors p-2 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-100"
            title="Recargar datos de la API"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-amber-500" : ""} />
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : <AlertCircle size={18} className="shrink-0 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. SECCIÓN: PUNTOS POR DINERO GASTADO */}
      <form onSubmit={handleSubmitPoints} className="bg-gradient-to-br from-slate-50 to-amber-50/20 p-5 rounded-3xl border border-amber-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-amber-100/60">
          <Coins size={16} className="text-amber-500" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Regla 1: Bonificación de Puntos por Gasto</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Por cada Dinero Gastado ($ MXN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">$</span>
              <input
                type="number"
                min="1"
                required
                value={montoDinero}
                onChange={(e) => setMontoDinero(e.target.value)}
                className="w-full pl-8 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Se Bonificarán (Puntos)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-500">pts</span>
              <input
                type="number"
                min="0"
                required
                value={puntosOtorgados}
                onChange={(e) => setPuntosOtorgados(e.target.value)}
                className="w-full pl-11 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-amber-100 flex items-start gap-3">
          <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-slate-700">Regla de Puntos Activa:</p>
            <p className="text-[11px] text-amber-900/80 font-bold">
              El usuario obtendrá <span className="text-amber-600 font-extrabold">{puntosOtorgados} punto(s)</span> por cada <span className="text-slate-900 font-extrabold">${montoDinero || 0}.00 MXN</span> consumidos.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={16} />} Guardar Regla de Puntos
        </button>
      </form>

      {/* 2. SECCIÓN: SISTEMA DE SELLOS E IMÁGENES DÉ ImgBB PARA GOOGLE WALLET */}
      <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100/70">
          <div className="flex items-center gap-2">
            <Stamp size={18} className="text-indigo-600" />
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Regla 2: Tarjeta de Sellos y Google Wallet</h3>
              <p className="text-[10px] text-slate-500 font-medium">Gestión de imágenes de ImgBB para cada sello (0 a 10 sellos)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
            <Wallet size={12} /> Google Pass
          </span>
        </div>

        {/* Configuración general de la meta de sellos */}
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Máximo de Sellos (Meta)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxSellos}
              onChange={(e) => setMaxSellos(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Puntos Extra al Canjear
            </label>
            <input
              type="number"
              min="0"
              value={puntosRecompensaCanje}
              onChange={(e) => setPuntosRecompensaCanje(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Pestañas rápidas para cada sello de 0 a 10 */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Selecciona la cantidad de sellos para asignar la URL de ImgBB:
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {Array.from({ length: Number(maxSellos) + 1 }, (_, i) => i).map(sello => (
              <button
                key={sello}
                type="button"
                onClick={() => setSelectedSelloTab(sello)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 border ${selectedSelloTab === sello ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
              >
                {sello === 0 ? '0 (Inicial)' : `${sello} Sello${sello > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>

          {/* Formulario de la imagen alojada en ImgBB para la pestaña seleccionada */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                <Image size={14} className="text-indigo-500" />
                Imagen de Cartera para: <strong className="text-indigo-600">{selectedSelloTab} Sellos</strong>
              </span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                URL de la imagen directa en ImgBB (ej. https://i.ibb.co/xxx/{selectedSelloTab}_sellos.png)
              </label>
              <div className="relative">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={imagenSelloActual.image_url || ''}
                  onChange={(e) => handleUpdateImageUrl(selectedSelloTab, e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder={`https://i.ibb.co/xxx/${selectedSelloTab}_sellos.png`}
                />
              </div>
            </div>

            {/* Vista previa de la tarjeta ImgBB */}
            {imagenSelloActual.image_url && (
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center gap-3">
                <img
                  src={imagenSelloActual.image_url}
                  alt={`Vista previa ${selectedSelloTab} sellos`}
                  className="w-16 h-16 object-cover rounded-lg border border-white shadow-sm bg-slate-200 shrink-0"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=ImgBB+Error'; }}
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-700 uppercase">Vista Previa Google Wallet Pass</p>
                  <p className="text-[9px] text-slate-500 truncate">{imagenSelloActual.image_url}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSellos}
          disabled={savingSellos}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {savingSellos ? <RefreshCw size={14} className="animate-spin" /> : <Save size={16} />} Guardar Imágenes y Regla de Sellos
        </button>
      </div>

      {/* 3. SIMULADOR DE AUMENTO DE SELLOS Y RESETEOS A 0 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Simulador de Evolución de Sellos & Reset</h4>
        </div>

        {simuladorMensajeCanje && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold animate-in fade-in">
            {simuladorMensajeCanje}
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase">Sellos Acumulados</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600">{simularSellosUsuario}</span>
              <span className="text-xs font-bold text-slate-500">de {maxSellos} Sellos</span>
            </div>
          </div>

          {imagenSelloSimulador.image_url ? (
            <img
              src={imagenSelloSimulador.image_url}
              alt="Imagen Cartera Activa"
              className="w-14 h-14 object-cover rounded-xl border-2 border-indigo-500 shadow-md bg-white"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Wallet+Img'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {simularSellosUsuario} Sello
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSimularIncrementarSello}
            disabled={simularSellosUsuario >= Number(maxSellos)}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            + 1 Sello (Simular Viaje)
          </button>
          
          <button
            type="button"
            onClick={handleSimularCanjearSellos}
            disabled={simularSellosUsuario < Number(maxSellos)}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:from-emerald-600 hover:to-emerald-700 transition-colors disabled:opacity-40"
          >
            Canjear y Resetear a 0
          </button>
        </div>
      </div>
    </div>
  );
}
