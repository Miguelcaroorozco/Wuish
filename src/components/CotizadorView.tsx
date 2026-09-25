import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { solicitudesApi } from '../lib/api';
import {
  Megaphone,
  Film,
  Palette,
  Globe,
  Smartphone,
  Database,
  Bot,
  Shield,
  Clock,
  Send,
  Lock,
  Headphones,
  Sliders,
  CheckCircle2,
  Check
} from 'lucide-react';

interface CotizadorViewProps {
  onSuccessSubmit?: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  category: 'comunicacion' | 'tecnologia';
  basePrice: number;
  description: string;
  icon: any;
}

const AVAILABLE_SERVICES: ServiceItem[] = [
  { id: 'ads', name: 'Marketing & Pauta Omnicanal', category: 'comunicacion', basePrice: 1200, description: 'Meta, Google Ads, LinkedIn B2B + ROAS Tracking', icon: Megaphone },
  { id: 'video', name: 'Producción de Video Cinemático', category: 'comunicacion', basePrice: 1450, description: 'Brand films 4K, Motion Design y comerciales 3D', icon: Film },
  { id: 'branding', name: 'Identidad & Branding Corporativo', category: 'comunicacion', basePrice: 950, description: 'Manual de marca, tipografía y activos gráficos', icon: Palette },
  { id: 'web', name: 'Desarrollo Web & E-Commerce', category: 'tecnologia', basePrice: 1800, description: 'Headless Next.js, pasarelas globales y alta velocidad', icon: Globe },
  { id: 'mobile', name: 'Apps Móviles (iOS & Android)', category: 'tecnologia', basePrice: 2600, description: 'Flutter / Swift nativo, offline-first y push notifications', icon: Smartphone },
  { id: 'erp', name: 'Software ERP / CRM a Medida', category: 'tecnologia', basePrice: 2900, description: 'Gestión de inventarios, roles RBAC y facturación multi-país', icon: Database },
  { id: 'ia', name: 'Automatización con IA & BI', category: 'tecnologia', basePrice: 1600, description: 'Modelos predictivos, chatbots autónomos y dashboards', icon: Bot },
  { id: 'sec', name: 'Ciberseguridad & Auditoría Cloud', category: 'tecnologia', basePrice: 1350, description: 'Pentesting, SOC2, blindaje de datos y certificación', icon: Shield },
];

export const CotizadorView: React.FC<CotizadorViewProps> = ({ onSuccessSubmit }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['ads', 'web']);
  const [timelineSpeed, setTimelineSpeed] = useState<'standard' | 'express' | 'urgent'>('standard');
  const [supportLevel, setSupportLevel] = useState<'tier1' | 'tier2' | 'concierge'>('tier1');

  // Contact Dossier Form
  const [name, setName] = useState(user ? `${user.nombres} ${user.apellidos || ''}`.trim() : '');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState(user?.numero_cedula || '');
  const [email, setEmail] = useState(user?.correo || '');
  const [phone, setPhone] = useState(user?.telefono || '');
  const [challenge, setChallenge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = useMemo(() => {
    return AVAILABLE_SERVICES.filter((s) => selectedServiceIds.includes(s.id));
  }, [selectedServiceIds]);

  const baseSubtotal = useMemo(() => {
    return selectedServices.reduce((acc, curr) => acc + curr.basePrice, 0);
  }, [selectedServices]);

  const timelineMultiplier = useMemo(() => {
    switch (timelineSpeed) {
      case 'express': return 1.25;
      case 'urgent': return 1.5;
      default: return 1.0;
    }
  }, [timelineSpeed]);

  const supportMultiplier = useMemo(() => {
    switch (supportLevel) {
      case 'tier2': return 1.15;
      case 'concierge': return 1.35;
      default: return 1.0;
    }
  }, [supportLevel]);

  const totalMultiplier = timelineMultiplier * supportMultiplier;
  const calculatedMin = Math.round(baseSubtotal * totalMultiplier * 0.95);
  const calculatedMax = Math.round(baseSubtotal * totalMultiplier * 1.2);

  const handleSubmitDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      showToast('Selecciona Servicios', 'Debes incluir al menos un servicio en tu cotización.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedNames = selectedServices.map((s) => s.name).join(', ');
      await solicitudesApi.create({
        tipo: 'cotizacion',
        descripcion: `Cotización solicitada para ${company.trim() || name.trim()} (${selectedNames}). Presupuesto estimado: $${calculatedMin} - $${calculatedMax} USD. Detalle: ${challenge || 'Sin detalle adicional'}. Teléfono: ${phone}`,
      });

      showToast('Expediente Registrado', 'Hemos recibido tus requerimientos. Un Director Estratégico te contactará.', 'success');
      if (onSuccessSubmit) onSuccessSubmit();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo registrar la solicitud', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
          MOTOR DE ESTIMACIÓN EN TIEMPO REAL
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
          Cotizador Dinámico &amp; Presupuesto
        </h1>
        <p className="text-sm font-medium text-[#d1c5af]">
          Selecciona las capacidades requeridas para proyectar una propuesta comercial preliminar con SLA garantizado.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Steps (Col 8) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* PASO 1: Selección de Servicios */}
          <section className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 01
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Soluciones &amp; Requerimientos
                </h2>
              </div>
              <span className="text-xs text-[#9a907c] font-mono">
                {selectedServices.length} seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVAILABLE_SERVICES.map((s) => {
                const Icon = s.icon;
                const isSelected = selectedServiceIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-[#ffd56d]/10 border-[#ffd56d] shadow-md shadow-[#ffd56d]/10'
                        : 'bg-[#201f21] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#2a2a2c] text-zinc-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white block truncate">{s.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#ffd56d] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#9a907c] line-clamp-1 mt-0.5">{s.description}</p>
                      <span className="text-xs font-bold text-[#ffd56d] font-mono mt-1 block">
                        ${s.basePrice.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PASO 2: Tiempos y Gobernanza */}
          <section className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                PASO 02
              </span>
              <h2 className="text-xl font-bold text-white font-display">
                Velocidad de Entrega &amp; Soporte
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-zinc-300">Cronograma de Ejecución</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'standard', name: 'Estándar', time: '6-8 Semanas', tag: '1.0x' },
                  { id: 'express', name: 'Acelerado', time: '3-4 Semanas', tag: '1.25x' },
                  { id: 'urgent', name: 'Prioritario', time: '1-2 Semanas', tag: '1.50x' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setTimelineSpeed(item.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      timelineSpeed === item.id
                        ? 'bg-[#ffd56d]/15 border-[#ffd56d]'
                        : 'bg-[#201f21] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[11px] text-[#9a907c]">{item.time}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#ffd56d] font-mono">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-xs font-semibold text-zinc-300">Nivel de Soporte y SLA</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'tier1', name: 'SLA Business', desc: 'Atención 24h', tag: '1.0x' },
                  { id: 'tier2', name: 'SLA Ejecutivo', desc: 'Respuesta < 4h', tag: '1.15x' },
                  { id: 'concierge', name: 'Concierge Directivo', desc: 'Ingeniero Dedicado', tag: '1.35x' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSupportLevel(item.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      supportLevel === item.id
                        ? 'bg-[#ffd56d]/15 border-[#ffd56d]'
                        : 'bg-[#201f21] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[11px] text-[#9a907c]">{item.desc}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#ffd56d] font-mono">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PASO 3: Formulario de Solicitud */}
          <section id="quoteRequestForm" className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 03
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Datos de Contacto &amp; Expediente
                </h2>
              </div>
              <span className="text-xs text-[#9a907c] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#ffd56d]" />
                Canal Seguro
              </span>
            </div>

            <form onSubmit={handleSubmitDossier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Empresa / Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre comercial"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Identificación Fiscal *</label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="NIT / Cédula / RUC"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Detalle o Metas del Proyecto</label>
                  <textarea
                    rows={3}
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Describe los requerimientos principales..."
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#9a907c]">Información protegida bajo estricta confidencialidad.</span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitud y Recibir Propuesta'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </section>

        </div>

        {/* Right Side: Calculation Engine (Col 4) */}
        <div className="xl:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] font-bold text-[#ffd56d] uppercase font-display">PRESUPUESTO ESTIMADO</span>
              <span className="text-[11px] font-mono text-[#9a907c]">USD</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0e10] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#9a907c] block mb-1">RANGO PROYECTADO</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-extrabold text-[#ffd56d] font-display">${calculatedMin.toLocaleString()}</span>
                <span className="text-zinc-500 font-light">-</span>
                <span className="text-2xl font-bold text-white font-display">${calculatedMax.toLocaleString()}</span>
                <span className="text-xs text-[#9a907c] font-mono">USD</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#9a907c] block mb-2 font-display">
                SERVICIOS ACTIVOS ({selectedServices.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                {selectedServices.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-[#201f21] flex items-center justify-between">
                    <span className="text-zinc-200 truncate pr-2">{item.name}</span>
                    <span className="text-[#ffd56d] font-mono font-semibold">${item.basePrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#201f21] flex items-center justify-between text-xs">
              <span className="text-[#d1c5af]">Multiplicador Final:</span>
              <span className="text-[#ffd56d] font-bold font-mono">{totalMultiplier.toFixed(2)}x</span>
            </div>

            <a
              href="#quoteRequestForm"
              className="w-full block text-center py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow-md"
            >
              Completar y Enviar
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
