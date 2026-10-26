import React from 'react';
import { WuishLogo } from '../WuishLogo';
import { ShieldCheck, Megaphone, Terminal, Compass, BarChart3 } from 'lucide-react';

const PILLARS = [
  { icon: Megaphone, title: 'Comunicación', desc: 'Narrativas corporativas de alto impacto y reputación.' },
  { icon: Terminal, title: 'Tecnología', desc: 'Infraestructura escalable y arquitecturas digitales sólidas.' },
  { icon: Compass, title: 'Estrategia', desc: 'Modelos de negocio ágiles orientados a expansión real.' },
  { icon: BarChart3, title: 'Datos & Analítica', desc: 'Métricas de rendimiento y decisiones estratégicas en tiempo real.' },
];

export const AuthPillarsPane: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 shrink-0 bg-[#1c1b1d] p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ffd56d]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
        <div className="w-full flex justify-center lg:justify-start">
          <WuishLogo size="hero" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#353437]/60 backdrop-blur-md border border-[#ffd56d]/20 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#ffd56d] tracking-[0.2em] uppercase font-display">
            WE UNITE IDEAS, STRATEGY &amp; HORIZONS
          </span>
        </div>

        <p className="text-lg xl:text-xl text-[#e5e1e4] leading-snug font-medium font-display max-w-xl">
          “No te vendemos tecnología ni marketing. Analizamos tu negocio y construimos lo que necesitas para crecer.”
        </p>
      </div>

      <div className="relative z-10 my-6 hidden [@media(min-height:820px)]:block">
        <div className="text-[11px] font-semibold text-[#9a907c] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>Ecosistema de Transformación</span>
          <span className="h-[1px] flex-1 bg-[#353437]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#201f21]/80 border border-white/5 flex items-start space-x-3.5 group hover:bg-[#2a2a2c] hover:border-[#ffd56d]/30 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-[#ffd56d]/10 flex items-center justify-center shrink-0 text-[#ffd56d]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[#e5e1e4] block">{p.title}</span>
                  <span className="text-xs text-[#d1c5af]/80 line-clamp-1">{p.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-[#9a907c] border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#ffd56d]" />
          Portal Estratégico Institucional
        </span>
        <span className="text-[11px] font-semibold tracking-widest text-[#ffd56d]/90 uppercase font-display">
          EDICIÓN 2025
        </span>
      </div>
    </div>
  );
};
