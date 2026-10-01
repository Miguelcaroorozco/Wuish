import React from 'react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { Check, Zap, Building, ShieldCheck, ChevronRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { CoverflowCarousel } from './CoverflowCarousel';

interface PlanesViewProps {
  onSelectPlan: (planId: string) => void;
}



const guarantees = [
  { icon: ShieldCheck, label: 'Sin permanencia' },
  { icon: Zap, label: 'Kickoff en 72h' },
  { icon: Building, label: 'Facturación en USD' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export const PlanesView: React.FC<PlanesViewProps> = ({ onSelectPlan }) => {
  const { showToast } = useToast();
  const { plans, addToCart } = useContent();

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 sm:space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center max-w-2xl mx-auto space-y-3 pt-2 sm:pt-6"
      >
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">Planes</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display">Elige cómo crecer</h1>
        <p className="text-sm text-[#9a907c]">Precios claros. Sin costos ocultos.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
      >
        <CoverflowCarousel
          items={plans}
          getKey={(p) => p.id}
          initialIndex={Math.max(0, plans.findIndex((p) => p.highlight))}
          autoplay={4000}
          ariaLabel="Planes"
          renderItem={(p, active) => (
            <div
              className={`w-full p-5 sm:p-7 rounded-2xl flex flex-col justify-between relative transition-shadow duration-500 ${
                p.highlight
                  ? 'bg-[#201f21] border-2 border-[#ffd56d]'
                  : 'bg-[#1c1b1d] border border-white/10'
              } ${active ? 'shadow-2xl shadow-black/60' : ''} ${active && p.highlight ? 'shadow-[#ffd56d]/15' : ''}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ffd56d] text-[#3e2e00] text-[10px] font-extrabold uppercase tracking-widest font-display shadow">
                  Más elegido
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-wider font-display">{p.badge}</span>
                <h2 className="text-xl font-bold text-white mt-1 font-display">{p.name}</h2>

                <div className="mt-5 pb-5 border-b border-white/5 flex items-baseline gap-1">
                  {p.price ? (
                    <>
                      <span className="text-4xl font-black text-white font-display">${p.price}</span>
                      <span className="text-xs text-[#9a907c] font-semibold">/ mes</span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-white font-display">A medida</span>
                  )}
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-[#d1c5af]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (p.price) {
                    addToCart({ id: p.id, name: p.name, type: 'plan', price: p.price });
                    showToast(`Agregado: ${p.name}`, 'Plan añadido al cotizador.', 'success');
                  } else {
                    showToast(`Plan ${p.name}`, 'Abriendo el cotizador...');
                  }
                  onSelectPlan(p.id);
                }}
                className={`mt-8 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer group ${
                  p.highlight
                    ? 'bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] shadow-md'
                    : 'bg-[#2a2a2c] hover:bg-[#353437] text-white border border-white/10'
                }`}
              >
                {p.price ? 'Cotizar' : 'Hablemos'}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          )}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {guarantees.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1b1d] border border-white/5 text-xs text-[#d1c5af]">
            <Icon className="w-4 h-4 text-[#ffd56d]" />
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
};
