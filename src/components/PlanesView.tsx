import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { planesApi, carritoApi } from '../lib/api';
import {
  Check,
  Sparkles,
  Zap,
  Building,
  Rocket,
  ShieldCheck,
  ChevronRight,
  ShoppingCart,
  Loader2
} from 'lucide-react';

interface PlanesViewProps {
  onSelectPlan: (planId: string) => void;
}

export const PlanesView: React.FC<PlanesViewProps> = ({ onSelectPlan }) => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      const data = await planesApi.getAll();
      setPlanes(data);
    } catch (err) {
      console.error('Error cargando planes:', err);
      // Fallback to empty - will show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (planId: string, planName: string) => {
    if (!isAuthenticated) {
      showToast('Inicia Sesión', 'Debes iniciar sesión para agregar planes al carrito', 'error');
      return;
    }
    try {
      await carritoApi.addItem(planId);
      showToast('Agregado al Carrito', `"${planName}" se agregó a tu carrito`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo agregar al carrito', 'error');
    }
  };

  const formatPrice = (precio: any) => {
    if (!precio) return 'Personalizado';
    const num = parseFloat(precio);
    return `$${num.toLocaleString('es-CO')}`;
  };

  const getFeatures = (plan: any): string[] => {
    if (plan.caracteristicas && Array.isArray(plan.caracteristicas)) {
      return plan.caracteristicas;
    }
    if (plan.caracteristicas && typeof plan.caracteristicas === 'object' && plan.caracteristicas.features) {
      return plan.caracteristicas.features;
    }
    return [];
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#ffd56d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] text-[11px] font-semibold uppercase tracking-wider font-display border border-[#ffd56d]/30">
          MODELOS DE ACOMPAÑAMIENTO ESTRATÉGICO
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display">
          Planes y Alianzas Empresariales
        </h1>
        <p className="text-sm sm:text-base text-[#d1c5af] leading-relaxed">
          Estructura de inversión transparente sin costos ocultos. Selecciona el modelo que mejor responde al momento operativo de tu empresa.
        </p>
      </div>

      {/* Grid of Plans */}
      {planes.length === 0 ? (
        <div className="text-center py-16">
          <Rocket className="w-12 h-12 text-[#ffd56d]/50 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white">Planes próximamente</p>
          <p className="text-sm text-[#9a907c] mt-1">Estamos preparando nuestras soluciones. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {planes.map((p, idx) => {
            const features = getFeatures(p);
            const isFeatured = idx === Math.floor(planes.length / 2); // Middle plan is featured
            
            return (
              <div
                key={p.id}
                className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 relative ${
                  isFeatured
                    ? 'bg-[#201f21] border-2 border-[#ffd56d] shadow-2xl shadow-[#ffd56d]/10 transform lg:-translate-y-2'
                    : 'bg-[#1c1b1d] border border-white/5 hover:border-white/20'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ffd56d] text-[#3e2e00] text-[10px] font-extrabold uppercase tracking-widest font-display shadow">
                    RECOMENDADO
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-wider font-display">
                      {p.tipo_servicio?.nombre || 'Plan'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mt-1 font-display">
                    {p.nombre}
                  </h2>

                  <p className="text-xs text-[#9a907c] mt-2 leading-relaxed min-h-[44px]">
                    {p.descripcion || 'Solución integral para tu negocio'}
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display">
                      {formatPrice(p.precio)}
                    </span>
                    {p.precio && <span className="text-xs text-[#9a907c] font-semibold">COP</span>}
                  </div>

                  {features.length > 0 && (
                    <div className="mt-6 space-y-2.5 text-xs text-[#d1c5af]">
                      {features.map((f: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 space-y-2">
                  <button
                    onClick={() => {
                      showToast(`Plan Seleccionado: ${p.nombre}`, 'Cargando configurador...');
                      onSelectPlan(p.id);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isFeatured
                        ? 'bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] shadow-md'
                        : 'bg-[#2a2a2c] hover:bg-[#353437] text-white border border-white/10'
                    }`}
                  >
                    <span>Seleccionar y Cotizar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAddToCart(p.id, p.nombre)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#ffd56d] hover:bg-[#ffd56d]/10 transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#ffd56d]/20"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee Box */}
      <div className="p-8 rounded-2xl bg-[#1c1b1d] border border-white/5 grid md:grid-cols-3 gap-6 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#ffd56d] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm font-display">Contratos Transparentes</h4>
            <p className="text-[#9a907c] mt-0.5">Sin cláusulas de permanencia abusivas. Renueva mensualmente por satisfacción y metas alcanzadas.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 text-[#ffd56d] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm font-display">Onboarding Inmediato</h4>
            <p className="text-[#9a907c] mt-0.5">Kickoff técnico en menos de 72 horas con asignación directa de Partner y Líder de Proyecto.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building className="w-6 h-6 text-[#ffd56d] shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm font-display">Facturación Corporativa</h4>
            <p className="text-[#9a907c] mt-0.5">Emisión de comprobantes fiscales conforme a regulaciones locales e internacionales.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
