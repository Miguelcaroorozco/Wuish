import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Megaphone,
  Film,
  Palette,
  Share2,
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
  // Comunicaciones
  {
    id: 'ads',
    name: 'Marketing & Pauta Omnicanal',
    category: 'comunicacion',
    basePrice: 1200,
    description: 'Meta, Google Ads, LinkedIn B2B + ROAS Tracking',
    icon: Megaphone
  },
  {
    id: 'video',
    name: 'Producción de Video Cinemático',
    category: 'comunicacion',
    basePrice: 1450,
    description: 'Brand films 4K, Motion Design y comerciales 3D',
    icon: Film
  },
  {
    id: 'branding',
    name: 'Identidad & Branding Corporativo',
    category: 'comunicacion',
    basePrice: 950,
    description: 'Manual de marca, tipografía y activos gráficos',
    icon: Palette
  },
  {
    id: 'social',
    name: 'Estrategia Redes & Conversión',
    category: 'comunicacion',
    basePrice: 800,
    description: 'Contenido orgánico, copys y funnel de atracción',
    icon: Share2
  },
  // Sistemas y Tecnología
  {
    id: 'web',
    name: 'Desarrollo Web & E-Commerce',
    category: 'tecnologia',
    basePrice: 1800,
    description: 'Headless Next.js, pasarelas globales y alta velocidad',
    icon: Globe
  },
  {
    id: 'mobile',
    name: 'Apps Móviles (iOS & Android)',
    category: 'tecnologia',
    basePrice: 2600,
    description: 'Flutter / Swift nativo, offline-first y notificaciones push',
    icon: Smartphone
  },
  {
    id: 'erp',
    name: 'Software ERP / CRM a Medida',
    category: 'tecnologia',
    basePrice: 2900,
    description: 'Gestión de inventarios, roles RBAC y facturación multi-país',
    icon: Database
  },
  {
    id: 'ia',
    name: 'Automatización con IA & BI',
    category: 'tecnologia',
    basePrice: 1600,
    description: 'Agentes LLM integrados, webhooks y tableros en tiempo real',
    icon: Bot
  }
];

export const CotizadorView: React.FC<CotizadorViewProps> = ({ onSuccessSubmit }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Selected services (starts empty for user selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scaleTier, setScaleTier] = useState<number>(1.0);
  const [speedTier, setSpeedTier] = useState<number>(1.0);

  // Dossier contact inputs without hardcoded mock fallbacks
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [taxId, setTaxId] = useState(user?.docNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [challenge, setChallenge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = useMemo(() => {
    return AVAILABLE_SERVICES.filter((s) => selectedIds.includes(s.id));
  }, [selectedIds]);

  const baseSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.basePrice, 0);
  }, [selectedServices]);

  const totalMultiplier = scaleTier * speedTier;

  const calculatedMin = Math.round(baseSubtotal * totalMultiplier);
  const calculatedMax = Math.round(calculatedMin * 1.38);

  const handleSubmitDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      showToast('Selección Requerida', 'Debes marcar al menos un módulo o servicio', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      // Save real quotation to local storage for AdminPanel
      try {
        const newQuotation = {
          id: `quote-${Date.now()}`,
          client: company.trim() || name.trim() || 'Cliente Sin Nombre',
          email: email.trim() || 'contacto@empresa.com',
          services: selectedServices.map((s) => s.name).join(', '),
          budget: `$${calculatedMin.toLocaleString()} USD`,
          status: 'En revisión',
          assigned: 'Por Asignar'
        };
        const existingQuotes = JSON.parse(localStorage.getItem('wuish_cotizaciones_v1') || '[]');
        localStorage.setItem('wuish_cotizaciones_v1', JSON.stringify([newQuotation, ...existingQuotes]));

        // Also save as a real solicitud for ClientDashboard
        const newCode = `#SOL-${Math.floor(7000 + Math.random() * 2900)}`;
        const newSolicitud = {
          id: `sol-${Date.now()}`,
          code: newCode,
          title: selectedServices.map((s) => s.name).slice(0, 2).join(' & ') || 'Proyecto Estratégico',
          subtitle: challenge.trim() || `Presupuesto estimado: $${calculatedMin.toLocaleString()} USD`,
          date: 'Hoy',
          plan: selectedServices.length > 2 ? 'Optimización & Escala' : 'Crecimiento Digital',
          status: 'En Revisión',
          assignedTo: 'Mesa Técnica WUISH',
          budget: `$${calculatedMin.toLocaleString()} USD`
        };
        const existingSols = JSON.parse(localStorage.getItem('wuish_solicitudes_v1') || '[]');
        localStorage.setItem('wuish_solicitudes_v1', JSON.stringify([newSolicitud, ...existingSols]));
      } catch (err) {
        console.error('Error guardando cotización:', err);
      }

      showToast(
        'Expediente Corporativo Creado',
        `Expediente generado con éxito. Su solicitud ha sido enviada al equipo técnico.`,
        'success'
      );
      if (onSuccessSubmit) onSuccessSubmit();
    }, 1100);
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Executive Section Banner (Exact to reference) */}
      <div className="relative bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/5 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#ffd56d]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] text-[11px] font-semibold tracking-wider uppercase font-display border border-[#ffd56d]/30">
                ARQUITECTURA DE PROYECTO • COTIZADOR DINÁMICO
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2c] text-[#d1c5af] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d] animate-ping" />
                VERSIÓN 2025.2
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#e5e1e4] font-display tracking-tight leading-tight">
              Cotizador Inteligente &amp; Solicitud de <span className="text-[#ffd56d]">Transformación Digital</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#d1c5af] leading-relaxed font-sans">
              Configura los componentes estratégicos de comunicación, desarrollo tecnológico e inteligencia operativa que tu organización requiere para recibir un desglose técnico-financiero preliminar y diagnóstico de entrada.
            </p>
          </div>

          {/* Mini Status Card */}
          <div className="bg-[#0e0e10]/90 backdrop-blur-md p-4 rounded-xl border border-white/5 flex items-center gap-4 shadow-md min-w-[280px]">
            <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center shrink-0 text-[#ffd56d]">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#ffd56d] tracking-wider uppercase font-display">
                GARANTÍA EJECUTIVA
              </span>
              <span className="text-sm font-bold text-white font-display">Acuerdo de Confidencialidad</span>
              <span className="text-xs text-[#9a907c]">Evaluación directa por Senior Partners</span>
            </div>
          </div>
        </div>

        {/* 4 Breadcrumb Steps Indicator */}
        <div className="mt-8 pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#ffd56d] text-[#3e2e00] text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-xs font-semibold text-white">Soluciones &amp; Módulos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#201f21] text-[#ffd56d] text-xs flex items-center justify-center font-semibold">2</span>
            <span className="text-xs text-[#d1c5af]">Escala &amp; Plazos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#201f21] text-[#ffd56d] text-xs flex items-center justify-center font-semibold">3</span>
            <span className="text-xs text-[#d1c5af]">Valuación en Vivo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#201f21] text-[#ffd56d] text-xs flex items-center justify-center font-semibold">4</span>
            <span className="text-xs text-[#d1c5af]">Despacho &amp; Expediente</span>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Steps (Col 8) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* PASO 1: Selección de Módulos & Capacidades */}
          <section className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 01
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Selección de Módulos &amp; Capacidades
                </h2>
              </div>
              <span className="text-xs text-[#9a907c]">Multi-selección activa</span>
            </div>

            {/* Pilar I: Comunicaciones & Marca */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-[#ffd56d]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Pilar I: Comunicaciones &amp; Marca
                </h3>
                <div className="h-px bg-white/10 flex-1 ml-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_SERVICES.filter((s) => s.category === 'comunicacion').map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`p-4 rounded-xl transition-all cursor-pointer border flex flex-col justify-between group ${
                        isChecked
                          ? 'bg-[#2a2a2c] border-[#ffd56d] shadow-sm'
                          : 'bg-[#201f21] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isChecked ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#0e0e10] text-[#ffd56d]'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block font-display">{s.name}</span>
                            <span className="text-xs text-[#9a907c] mt-0.5 block leading-tight">{s.description}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#0e0e10] border border-white/20'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[#9a907c] uppercase tracking-wider font-semibold">ESTIMADO BASE</span>
                        <span className="text-[#ffd56d] font-bold text-sm font-mono">${s.basePrice.toLocaleString()} USD</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pilar II: Sistemas & Tecnología Avanzada */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-[#ffd56d]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Pilar II: Sistemas &amp; Tecnología Avanzada
                </h3>
                <div className="h-px bg-white/10 flex-1 ml-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_SERVICES.filter((s) => s.category === 'tecnologia').map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`p-4 rounded-xl transition-all cursor-pointer border flex flex-col justify-between group ${
                        isChecked
                          ? 'bg-[#2a2a2c] border-[#ffd56d] shadow-sm'
                          : 'bg-[#201f21] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isChecked ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#0e0e10] text-[#ffd56d]'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block font-display">{s.name}</span>
                            <span className="text-xs text-[#9a907c] mt-0.5 block leading-tight">{s.description}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#0e0e10] border border-white/20'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[#9a907c] uppercase tracking-wider font-semibold">ESTIMADO BASE</span>
                        <span className="text-[#ffd56d] font-bold text-sm font-mono">${s.basePrice.toLocaleString()} USD</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PASO 2: Escala Organizacional & Cronograma */}
          <section className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 02
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Escala Organizacional &amp; Cronograma
                </h2>
              </div>
              <span className="text-xs text-[#9a907c]">Calibración de multiplicadores</span>
            </div>

            {/* Subsección Madurez */}
            <div>
              <label className="text-sm font-bold text-white block mb-3 font-display">
                Nivel de madurez y tamaño de la estructura:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { tier: 'FASE 1', name: 'Startup / Inicial', sub: '1 a 10 colaboradores', val: 1.0 },
                  { tier: 'FASE 2', name: 'En Crecimiento', sub: '11 a 50 colaboradores', val: 1.3 },
                  { tier: 'FASE 3', name: 'Mediana Empresa', sub: '51 a 250 colaboradores', val: 1.7 },
                  { tier: 'FASE 4', name: 'Corporativo Multinacional', sub: '> 250 colaboradores', val: 2.3 },
                ].map((item) => (
                  <div
                    key={item.tier}
                    onClick={() => setScaleTier(item.val)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      scaleTier === item.val
                        ? 'bg-[#2a2a2c] border-[#ffd56d] shadow-sm'
                        : 'bg-[#201f21] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#ffd56d] block mb-1 uppercase font-display">{item.tier}</span>
                    <span className="text-sm font-bold text-white block font-display">{item.name}</span>
                    <span className="text-xs text-[#9a907c] mt-1 block">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsección Plazo Deseado */}
            <div>
              <label className="text-sm font-bold text-white block mb-3 font-display">
                Ventana temporal objetivo para despliegue:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Prioritario (Sprint)', time: '2 a 4 semanas', tag: '+25%', val: 1.25 },
                  { name: 'Estándar Ejecutivo', time: '1 a 2 meses', tag: 'Óptimo', val: 1.0 },
                  { name: 'Fases Trimestrales', time: '3 a 6 meses', tag: '-10%', val: 0.9 },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSpeedTier(item.val)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                      speedTier === item.val
                        ? 'bg-[#2a2a2c] border-[#ffd56d] shadow-sm'
                        : 'bg-[#201f21] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold text-white block font-display">{item.name}</span>
                      <span className="text-xs text-[#9a907c] block mt-0.5">{item.time}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#ffd56d]/15 text-[#ffd56d]">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PASO 4: Expediente Corporativo & Contacto */}
          <section id="quoteRequestForm" className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 04
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Expediente Corporativo &amp; Contacto
                </h2>
              </div>
              <span className="text-xs text-[#9a907c] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#ffd56d]" />
                Canal Seguro Encriptado
              </span>
            </div>

            <form onSubmit={handleSubmitDossier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Nombre Completo del Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Razón Social / Organización *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre comercial o razón social"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Identificación Fiscal (RIF / NIT / CIF / RUC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="N° de identificación fiscal"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Teléfono Directo / WhatsApp de Coordinación *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a907c] mb-1.5">
                    Objetivo Estratégico o Reto Inmediato
                  </label>
                  <textarea
                    rows={3}
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Describe brevemente el alcance del proyecto, sistemas existentes a integrar o metas comerciales clave para este trimestre..."
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
              </div>

              {/* Attention Process Flow Visual */}
              <div className="mt-6 p-4 rounded-xl bg-[#0e0e10] border border-white/5">
                <span className="text-[10px] font-bold text-[#9a907c] uppercase tracking-widest block mb-3 font-display">
                  RUTA DE ATENCIÓN CORPORATIVA
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-[#ffd56d]/10 border border-[#ffd56d]/30">
                    <span className="text-[10px] font-bold text-[#ffd56d] block font-display">01. RECEPCIÓN</span>
                    <span className="font-semibold text-white mt-0.5 block">Validación &amp; Ticket</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1c1b1d] border border-white/5">
                    <span className="text-[10px] font-semibold text-[#9a907c] block font-display">02. ARQUITECTURA</span>
                    <span className="text-[#d1c5af] mt-0.5 block">Revisión Técnica</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1c1b1d] border border-white/5">
                    <span className="text-[10px] font-semibold text-[#9a907c] block font-display">03. EXPEDIENTE</span>
                    <span className="text-[#d1c5af] mt-0.5 block">Propuesta en Firme</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1c1b1d] border border-white/5">
                    <span className="text-[10px] font-semibold text-[#9a907c] block font-display">04. BOARDROOM</span>
                    <span className="text-[#d1c5af] mt-0.5 block">Sesión Directiva</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#9a907c]">
                  <Lock className="w-4 h-4 text-[#ffd56d]" />
                  <span>Encriptación AES-256 de extremo a extremo.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Generando Expediente...' : 'Enviar Solicitud y Recibir Propuesta'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </section>

        </div>

        {/* Right Side: Sticky Live Interactive Quote Calculation Engine (Col 4) */}
        <div className="xl:col-span-4 sticky top-24 flex flex-col gap-4">
          
          <div className="relative rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5">
            {/* Subtle Gold Horizon Glow */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#ffd56d]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
                <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider font-display">
                  MOTOR DINÁMICO WUISH
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#9a907c]">MONEDA: USD</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Presupuesto Estimado Preliminar
              </h3>
              <p className="text-xs text-[#9a907c] mt-1 leading-relaxed">
                Cálculo paramétrico en tiempo real sujeto a especificación de alcance técnico definitivo.
              </p>
            </div>

            {/* Price Numbers Box */}
            <div className="p-4 rounded-xl bg-[#0e0e10] border border-white/5 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-[#9a907c] tracking-widest block mb-1">
                RANGO PROYECTADO
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#ffd56d] font-display">
                  ${calculatedMin.toLocaleString()}
                </span>
                <span className="text-xl text-zinc-500 font-light">-</span>
                <span className="text-2xl sm:text-3xl font-bold text-white font-display">
                  ${calculatedMax.toLocaleString()}
                </span>
                <span className="text-xs text-[#9a907c] font-mono">USD</span>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#d1c5af] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd56d]" />
                  Diagnóstico técnico inicial
                </span>
                <span className="text-[#ffd56d] font-bold uppercase text-[10px] font-display">
                  SIN COSTO
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#9a907c] tracking-widest block mb-2 font-display">
                DESGLOSE DE SERVICIOS ACTIVOS ({selectedServices.length})
              </span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
                {selectedServices.length === 0 ? (
                  <div className="text-zinc-500 italic py-2 text-center">
                    Selecciona al menos una solución.
                  </div>
                ) : (
                  selectedServices.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-[#201f21] flex items-center justify-between text-xs"
                    >
                      <span className="text-zinc-200 truncate pr-2">{item.name}</span>
                      <span className="text-[#ffd56d] font-mono font-semibold shrink-0">
                        ${item.basePrice.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Multiplier Info */}
            <div className="p-3 rounded-xl bg-[#201f21] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#d1c5af]">
                <Sliders className="w-4 h-4 text-[#ffd56d]" />
                <span>Multiplicador Estructura:</span>
              </div>
              <span className="text-[#ffd56d] font-bold font-mono">
                {totalMultiplier.toFixed(2)}x
              </span>
            </div>

            {/* Complementary Value Badges */}
            <div className="space-y-2 text-xs text-[#d1c5af] pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd56d] shrink-0" />
                <span>Asignación de Partner Director Dedicado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd56d] shrink-0" />
                <span>Acuerdo NDA firmado previo a recepción de datos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd56d] shrink-0" />
                <span>SLA de entrega formal en menos de 48h hábiles</span>
              </div>
            </div>

            {/* Fast Action Scroll Trigger */}
            <a
              href="#quoteRequestForm"
              className="w-full block text-center py-3 rounded-xl bg-[#2a2a2c] hover:bg-[#353437] text-[#ffd56d] hover:text-white font-bold text-xs uppercase tracking-wider transition border border-white/10"
            >
              Completar Expediente y Enviar
            </a>
          </div>

          {/* Contact Direct Advisor */}
          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center text-[#ffd56d] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider block font-display">
                ¿REQUERIMIENTOS ESPECIALES?
              </span>
              <h4 className="text-sm font-bold text-white font-display">Consultoría Directa</h4>
              <p className="text-xs text-[#9a907c] mt-0.5">
                Agendar llamada técnica confidencial con un Partner
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
