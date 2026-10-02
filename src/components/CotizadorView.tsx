import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { solicitudesApi, planesApi, cotizadorModulosApi } from '../lib/api';
import {
  DEFAULT_COTIZADOR_SERVICES,
  CotizadorServiceItem,
} from '../lib/cotizadorDefaults';
import {
  Megaphone,
  Film,
  Palette,
  Globe,
  Smartphone,
  Database,
  Cpu,
  Shield,
  Send,
  Lock,
  Check,
  Trash2,
  X,
  Layers,
} from 'lucide-react';

interface CotizadorViewProps {
  initialPlanId?: string | null;
  activePlanRecord?: any | null;
  contractedServices?: any[];
  onSuccessSubmit?: () => void;
}

const ICON_MAP: Record<string, any> = {
  ads: Megaphone,
  video: Film,
  branding: Palette,
  web: Globe,
  mobile: Smartphone,
  erp: Database,
  automatizacion: Cpu,
  sec: Shield,
};

const getServiceIcon = (id: string, name: string) => {
  if (ICON_MAP[id]) return ICON_MAP[id];
  const t = name.toLowerCase();
  if (t.includes('web') || t.includes('commerce') || t.includes('tienda') || t.includes('core')) return Globe;
  if (t.includes('mobile') || t.includes('app') || t.includes('móvil')) return Smartphone;
  if (t.includes('video') || t.includes('film') || t.includes('audiovisual')) return Film;
  if (t.includes('branding') || t.includes('marca') || t.includes('identidad')) return Palette;
  if (t.includes('erp') || t.includes('crm') || t.includes('software')) return Database;
  if (t.includes('auto') || t.includes('ia') || t.includes('inteligencia') || t.includes('devops')) return Cpu;
  if (t.includes('ciber') || t.includes('seguridad') || t.includes('cloud')) return Shield;
  return Megaphone;
};

export const CotizadorView: React.FC<CotizadorViewProps> = ({
  initialPlanId,
  activePlanRecord,
  contractedServices = [],
  onSuccessSubmit,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [availableServices, setAvailableServices] = useState<CotizadorServiceItem[]>(DEFAULT_COTIZADOR_SERVICES);
  const [activePlanTemplate, setActivePlanTemplate] = useState<any | null>(null);

  // Servicios actualmente contratados por el usuario
  const contractedIds = useMemo(() => {
    const list = contractedServices.length > 0
      ? contractedServices
      : (activePlanRecord?.servicios_seleccionados || []);
    if (!Array.isArray(list)) return [];
    return list.map((s: any) => (typeof s === 'string' ? s : s.id || s.name)).filter(Boolean);
  }, [contractedServices, activePlanRecord]);

  // Una modificación de un plan parte de su última configuración aprobada.
  // Si esa configuración está vacía, se conserva vacía para permitir quedar sin plan.
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    if (activePlanRecord && !initialPlanId) {
      return contractedIds;
    }
    return ['ads', 'web'];
  });

  const [timelineSpeed, setTimelineSpeed] = useState<'standard' | 'express' | 'urgent'>('standard');
  const [supportLevel, setSupportLevel] = useState<'tier1' | 'tier2' | 'concierge'>('tier1');

  const isCurrentlyContracted = (srvId: string, srvName: string) => {
    return contractedIds.some((cid) => {
      const normC = String(cid).toLowerCase().trim();
      const normId = srvId.toLowerCase().trim();
      const normName = srvName.toLowerCase().trim();
      return normC === normId || normC === normName || normC.includes(normName) || normName.includes(normC);
    });
  };

  // Cargar opciones del cotizador guardadas en la base de datos y sincronizar plan si viene seleccionado
  useEffect(() => {
    Promise.all([
      cotizadorModulosApi.getAll().catch(() => []),
      initialPlanId ? planesApi.getAll().catch(() => []) : Promise.resolve([]),
    ]).then(([dbModulos, allPlanes]) => {
      let currentServices = DEFAULT_COTIZADOR_SERVICES;
      if (Array.isArray(dbModulos) && dbModulos.length > 0) {
        currentServices = dbModulos.map((m: any) => ({
          id: m.id,
          name: m.nombre,
          category: m.categoria,
          basePrice: Number(m.precio_base),
          description: m.descripcion,
          activo: m.activo,
        }));
        setAvailableServices(currentServices);
      }

      if (initialPlanId && Array.isArray(allPlanes)) {
        const found = allPlanes.find((p: any) => p.id === initialPlanId);
        if (found) {
          setActivePlanTemplate(found);
          const rawFeats: string[] = Array.isArray(found.caracteristicas)
            ? found.caracteristicas
            : found.caracteristicas?.features || [];

          // Emparejar características del plan con las opciones del cotizador
          const matchedIds: string[] = [];
          currentServices.forEach((srv) => {
            const match = rawFeats.some((f) => {
              const fNorm = f.toLowerCase().trim();
              const nameNorm = srv.name.toLowerCase().trim();
              return fNorm.includes(nameNorm) || nameNorm.includes(fNorm) || fNorm.includes(srv.id);
            });
            if (match) matchedIds.push(srv.id);
          });

          if (matchedIds.length > 0) {
            setSelectedServiceIds(matchedIds);
          }
        }
      } else if (activePlanRecord && !initialPlanId) {
        // Emparejar la configuración aprobada vigente, incluso si está vacía.
        const matchedIds: string[] = [];
        currentServices.forEach((srv) => {
          if (isCurrentlyContracted(srv.id, srv.name)) {
            matchedIds.push(srv.id);
          }
        });
        setSelectedServiceIds(matchedIds);
      }
    });
  }, [initialPlanId, contractedIds, activePlanRecord]);

  // PASO 03: solo campos que el usuario no tiene en su perfil
  const [company, setCompany] = useState(user?.empresa || '');
  const [challenge, setChallenge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Servicios marcados en el resumen para eliminarlos en bloque
  const [markedForRemoval, setMarkedForRemoval] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setMarkedForRemoval((prev) => prev.filter((item) => item !== id));
  };

  const removeServices = (ids: string[]) => {
    setSelectedServiceIds((prev) => prev.filter((item) => !ids.includes(item)));
    setMarkedForRemoval((prev) => prev.filter((item) => !ids.includes(item)));
  };

  const toggleMarked = (id: string) => {
    setMarkedForRemoval((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = useMemo(() => {
    return availableServices
      .filter((s) => s.activo !== false)
      .filter((s) => selectedServiceIds.includes(s.id));
  }, [availableServices, selectedServiceIds]);

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
    const isPlanChange = Boolean(activePlanRecord) && !initialPlanId;
    if (selectedServices.length === 0 && !isPlanChange) {
      showToast('Selecciona Servicios', 'Debes incluir al menos un servicio en tu cotización.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedNames = selectedServices.map((s) => s.name).join(', ');
      const userName = user ? `${user.nombres} ${user.apellidos || ''}`.trim() : '';
      await solicitudesApi.create({
        tipo: 'cotizacion',
        plan_id: activePlanTemplate?.id || undefined,
        empresa: company.trim() || user?.empresa || undefined,
        telefono_contacto: user?.telefono || undefined,
        servicios_seleccionados: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: s.basePrice,
        })),
        presupuesto_min: calculatedMin,
        presupuesto_max: calculatedMax,
        velocidad_entrega: timelineSpeed,
        nivel_soporte: supportLevel,
        descripcion: challenge.trim() || (
          selectedServices.length > 0
            ? `Cotización de ${userName} (${company.trim() || 'Sin empresa'}) para: ${selectedNames}. Presupuesto estimado: $${calculatedMin} – $${calculatedMax} USD`
            : `Solicitud de cancelación del plan de ${userName} (${company.trim() || 'Sin empresa'}).`
        ),
      });

      showToast('¡Cotización Registrada!', 'Hemos recibido tu selección de servicios. Un Director Estratégico te contactará pronto.', 'success');
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
          {activePlanRecord && !initialPlanId ? 'Ajusta tu plan' : 'Cotiza tu solución'}
        </h1>
        <p className="text-sm font-medium text-[#d1c5af]">
          {activePlanRecord && !initialPlanId
            ? 'Quita o agrega servicios. El cambio solo se aplicará cuando tu solicitud sea aprobada.'
            : 'Elige los servicios que necesitas y recibe un presupuesto preliminar con SLA garantizado.'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { step: '01', label: 'Servicios' },
          { step: '02', label: 'Prioridad' },
          { step: '03', label: 'Confirmación' },
        ].map((item) => (
          <div key={item.step} className="flex items-center gap-2 sm:gap-3">
            <span className="w-7 h-7 rounded-full bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center text-[10px] font-black shrink-0">
              {item.step}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide">{item.label}</span>
            {item.step !== '03' && <div className="h-px bg-[#ffd56d]/30 flex-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Steps (Col 8) */}
        <div className="xl:col-span-8 space-y-8">

          {/* Banner de Plantilla de Plan Activa */}
          {activePlanTemplate && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#ffd56d]/15 via-[#1c1b1d] to-[#1c1b1d] border border-[#ffd56d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center font-black shrink-0 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#ffd56d] font-mono tracking-wider px-2 py-0.5 rounded bg-[#ffd56d]/20 border border-[#ffd56d]/30">
                      Plantilla Activa
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base font-display">{activePlanTemplate.nombre}</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">
                    Módulos de este plan preseleccionados automáticamente. Puedes añadir o quitar servicios para personalizar tu cotización.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePlanTemplate(null)}
                className="text-xs text-[#ffd56d] hover:text-[#ffdf97] font-semibold underline underline-offset-4 self-start sm:self-auto cursor-pointer"
              >
                Cotización libre
              </button>
            </div>
          )}

          {activePlanRecord && !activePlanTemplate && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1b1d] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Plan vigente</span>
                <p className="text-sm font-bold text-white mt-1">
                  {activePlanRecord.plan?.nombre || 'Configuración personalizada'}
                </p>
                <p className="text-xs text-[#9a907c] mt-1">
                  Esta es tu configuración actual. Modifícala y envía una nueva solicitud para reemplazarla.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">Aprobado</span>
            </div>
          )}
          
          {/* PASO 1: Selección de Servicios */}
          <section className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 01
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Elige tus servicios</h2>
                  <p className="text-xs text-[#9a907c] mt-1">Haz clic en una tarjeta para agregarla o quitarla.</p>
                </div>
              </div>
              <span className="text-xs text-[#ffd56d] font-bold font-mono bg-[#ffd56d]/10 border border-[#ffd56d]/20 rounded-full px-2.5 py-1 whitespace-nowrap">
                {selectedServices.length} {selectedServices.length === 1 ? 'activo' : 'activos'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-[#9a907c]">
              <span>Selecciona uno o varios servicios para calcular tu inversión.</span>
              {activePlanRecord && !initialPlanId && (
                <button
                  type="button"
                  onClick={() => setSelectedServiceIds(contractedIds)}
                  className="text-[#ffd56d] hover:text-[#ffdf97] font-semibold whitespace-nowrap cursor-pointer"
                >
                  Restaurar plan actual
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableServices.filter((s) => s.activo !== false).map((s) => {
                const Icon = getServiceIcon(s.id, s.name);
                const isSelected = selectedServiceIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleService(s.id);
                      }
                    }}
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

          {/* PASO 3: Confirmación */}
          <section id="quoteRequestForm" className="bg-[#1c1b1d] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded bg-[#ffd56d] text-[#3e2e00] font-display uppercase">
                  PASO 03
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Confirmar y Enviar
                </h2>
              </div>
              <span className="text-xs text-[#9a907c] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#ffd56d]" />
                Canal Seguro
              </span>
            </div>

            {/* Resumen del usuario autenticado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Cliente', value: user ? `${user.nombres} ${user.apellidos || ''}`.trim() : '—' },
                { label: 'Correo', value: user?.correo || '—' },
                { label: 'Teléfono', value: user?.telefono || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3 rounded-xl bg-[#0e0e10] border border-white/5">
                  <span className="block text-[10px] uppercase font-bold text-[#9a907c] mb-0.5">{label}</span>
                  <span className="text-xs text-white font-medium truncate block">{value}</span>
                </div>
              ))}
            </div>

            <form id="quoteForm" onSubmit={handleSubmitDossier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Empresa / Razón Social</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre de tu empresa o negocio"
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase text-[#9a907c] mb-1">Detalle o Metas del Proyecto</label>
                  <textarea
                    rows={3}
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Describe brevemente los objetivos, alcance o requerimientos principales de tu proyecto..."
                    className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d] leading-relaxed"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#9a907c]">🔒 Información protegida bajo estricta confidencialidad. Tus datos de perfil se incluyen automáticamente.</p>
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#9a907c] font-display">
                  SERVICIOS ACTIVOS ({selectedServices.length})
                </span>
                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeServices(selectedServiceIds)}
                    className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    Quitar todo
                  </button>
                )}
              </div>

              {selectedServices.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#201f21] border border-dashed border-[#ffd56d]/30 text-center text-[11px] text-[#d1c5af]">
                  <span className="block font-bold text-[#ffd56d]">Sin servicios seleccionados</span>
                  <span className="block mt-1 text-[#9a907c]">
                    {activePlanRecord
                      ? 'Puedes enviar la solicitud para quedar sin plan.'
                      : 'Selecciona al menos un servicio en el Paso 01.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1 text-[11px]">
                  {selectedServices.map((item) => {
                    const isMarked = markedForRemoval.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`min-h-8 px-2 py-1.5 rounded-lg flex items-center gap-1.5 border transition ${
                          isMarked ? 'bg-rose-500/10 border-rose-500/40' : 'bg-[#201f21] border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isMarked}
                          onChange={() => toggleMarked(item.id)}
                          aria-label={`Seleccionar ${item.name} para eliminar`}
                          className="w-3 h-3 shrink-0 accent-rose-500 cursor-pointer"
                        />
                        <span className="text-zinc-200 truncate flex-1 min-w-0 text-[10px] sm:text-[11px]">{item.name}</span>
                        <span className="text-[#ffd56d] font-mono font-semibold text-[10px] shrink-0">${item.basePrice.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => removeServices([item.id])}
                          title="Eliminar de la cotización"
                          aria-label={`Eliminar ${item.name}`}
                          className="p-0.5 rounded-md text-[#9a907c] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {markedForRemoval.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeServices(markedForRemoval)}
                  className="mt-2 w-full py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar seleccionados ({markedForRemoval.length})
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#201f21] flex items-center justify-between text-xs">
              <span className="text-[#d1c5af]">Multiplicador Final:</span>
              <span className="text-[#ffd56d] font-bold font-mono">{totalMultiplier.toFixed(2)}x</span>
            </div>

            {/* Único botón de envío: envía el formulario del Paso 03 (id="quoteForm") */}
            <button
              type="submit"
              form="quoteForm"
              disabled={isSubmitting || (selectedServices.length === 0 && !activePlanRecord)}
              className="w-full py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isSubmitting
                  ? 'Enviando...'
                  : selectedServices.length === 0
                    ? 'Solicitar quedar sin plan'
                    : activePlanRecord && !initialPlanId
                      ? 'Solicitar cambio de plan'
                      : 'Completar y Enviar'}
              </span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
