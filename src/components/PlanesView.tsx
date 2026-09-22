import React from 'react';
import { useToast } from '../context/ToastContext';
import {
  Check,
  Sparkles,
  Zap,
  Building,
  Rocket,
  ShieldCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface PlanesViewProps {
  onSelectPlan: (planId: string) => void;
}

export const PlanesView: React.FC<PlanesViewProps> = ({ onSelectPlan }) => {
  const { showToast } = useToast();

  const plans = [
    {
      id: 'crecimiento',
      name: 'Crecimiento Digital',
      badge: 'Fase Inicial',
      price: '1,850',
      period: '/ mes',
      description: 'Ideal para empresas que necesitan asentar una marca respetable y generar flujo de prospectos predecible.',
      highlight: false,
      features: [
        'Estrategia de Comunicación & Storytelling',
        'Gestión de Pauta Digital (Meta & Google Ads)',
        'Producción de 4 videos cinemáticos mensuales',
        'Optimización continua de Landing Page',
        'Reporte ejecutivo mensual de atribución y ROAS',
        'SLA de soporte técnico estándar (24h)'
      ]
    },
    {
      id: 'digitalizacion',
      name: 'Digitalización Operativa',
      badge: 'Sistemas & Automatización',
      price: '2,900',
      period: '/ mes',
      description: 'Diseñado para organizaciones que buscan eliminar fricción operativa manual y centralizar sus datos.',
      highlight: false,
      features: [
        'Desarrollo o Rediseño Web Headless de alta velocidad',
        'Implementación de CRM o ERP a medida',
        'Automatizaciones de flujos con Webhooks e IA',
        'Capacitación directiva a equipos de ventas',
        'Copias de seguridad automáticas y auditoría de seguridad',
        'SLA de soporte prioritario (12h)'
      ]
    },
    {
      id: 'optimizacion',
      name: 'Optimización & Escala',
      badge: 'MÁS ELEGIDO • FULL SUITE',
      price: '4,200',
      period: '/ mes',
      description: 'La experiencia completa WUISH: unión de comunicaciones de alto impacto con ingeniería de software personalizada.',
      highlight: true,
      features: [
        'Todo lo incluido en Crecimiento y Digitalización',
        'Producción Audiovisual 4K y Motion Graphics B2B',
        'Desarrollo de App Móvil o Plataforma de Clientes',
        'Dashboard BI en tiempo real para directorio',
        'Consultoría estratégica semanal con Senior Partner',
        'SLA de respuesta crítica en menos de 2 horas',
        'Acuerdo NDA empresarial exclusivo'
      ]
    },
    {
      id: 'transformacion',
      name: 'Transformación Integral',
      badge: 'Enterprise / Custom',
      price: 'Personalizado',
      period: '',
      description: 'Acompañamiento a nivel de Boardroom y creación de nuevos productos digitales corporativos.',
      highlight: false,
      features: [
        'Arquitectura de sistemas multi-país y multinacional',
        'Lanzamiento de spin-offs o nuevas unidades digitales',
        'Equipo multidisciplinario in-house dedicado',
        'Despliegues en infraestructura Cloud privada (GCP/AWS)',
        'SLA 24/7 con teléfono directo a Dirección Técnica',
        'Presupuesto y hoja de ruta definidos con C-Level'
      ]
    }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 relative ${
              p.highlight
                ? 'bg-[#201f21] border-2 border-[#ffd56d] shadow-2xl shadow-[#ffd56d]/10 transform lg:-translate-y-2'
                : 'bg-[#1c1b1d] border border-white/5 hover:border-white/20'
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ffd56d] text-[#3e2e00] text-[10px] font-extrabold uppercase tracking-widest font-display shadow">
                RECOMENDADO DIRECTIVO
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-wider font-display">
                  {p.badge}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mt-1 font-display">
                {p.name}
              </h2>

              <p className="text-xs text-[#9a907c] mt-2 leading-relaxed min-h-[44px]">
                {p.description}
              </p>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white font-display">
                  {p.price.startsWith('Personalizado') ? '' : '$'}{p.price}
                </span>
                <span className="text-xs text-[#9a907c] font-semibold">{p.period}</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-[#d1c5af]">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  showToast(`Plan Seleccionado: ${p.name}`, 'Cargando configurador inteligente...');
                  onSelectPlan(p.id);
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  p.highlight
                    ? 'bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] shadow-md'
                    : 'bg-[#2a2a2c] hover:bg-[#353437] text-white border border-white/10'
                }`}
              >
                <span>Seleccionar y Cotizar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
            <p className="text-[#9a907c] mt-0.5">Emisión de comprobantes fiscales conforme a regulaciones locales e internacionales en USD.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
