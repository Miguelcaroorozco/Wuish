import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Sparkles,
  ArrowRight,
  Send,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { solicitudesApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface SolicitudesTabProps {
  solicitudes: any[];
  setSolicitudes: React.Dispatch<React.SetStateAction<any[]>>;
  contractedServices: any[];
  activePlanRecord: any;
  onNavigateTab: (tab: any) => void;
}

export const SolicitudesTab: React.FC<SolicitudesTabProps> = ({
  solicitudes,
  setSolicitudes,
  contractedServices,
  activePlanRecord,
  onNavigateTab,
}) => {
  const { showToast } = useToast();

  const [selectedContractedService, setSelectedContractedService] = useState('');
  const [solServiceTitle, setSolServiceTitle] = useState('');
  const [solServiceDesc, setSolServiceDesc] = useState('');
  const [solServiceNotes, setSolServiceNotes] = useState('');
  const [solServicePlazo, setSolServicePlazo] = useState('normal');
  const [solSubmitting, setSolSubmitting] = useState(false);

  const [solSearchTerm, setSolSearchTerm] = useState('');
  const [solTabFilter, setSolTabFilter] = useState('Todas');
  const [solTabCurPage, setSolTabCurPage] = useState(1);
  const SOL_TAB_PER_PAGE = 6;

  const filteredTabSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      if (s.tipo === 'cotizacion') return false;

      const matchSearch =
        solSearchTerm === '' ||
        (s.id || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.tipo || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.descripcion || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.empresa || '').toLowerCase().includes(solSearchTerm.toLowerCase());

      const matchStatus =
        solTabFilter === 'Todas' ||
        s.estado?.toLowerCase() === solTabFilter.toLowerCase().replace(' ', '_');

      return matchSearch && matchStatus;
    });
  }, [solicitudes, solSearchTerm, solTabFilter]);

  const solTabTotalPages = Math.max(1, Math.ceil(filteredTabSolicitudes.length / SOL_TAB_PER_PAGE));

  const paginatedTabSolicitudes = useMemo(() => {
    const start = (solTabCurPage - 1) * SOL_TAB_PER_PAGE;
    return filteredTabSolicitudes.slice(start, start + SOL_TAB_PER_PAGE);
  }, [filteredTabSolicitudes, solTabCurPage]);

  useEffect(() => {
    if (solTabCurPage > solTabTotalPages) setSolTabCurPage(solTabTotalPages);
  }, [filteredTabSolicitudes.length, solTabTotalPages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractedService || !solServiceTitle.trim() || !solServiceDesc.trim()) {
      showToast('Campos requeridos', 'Selecciona un servicio, título y descripción.', 'error');
      return;
    }
    setSolSubmitting(true);
    try {
      const newSol = await solicitudesApi.create({
        tipo: selectedContractedService,
        descripcion: `${solServiceTitle.trim()}: ${solServiceDesc.trim()}${
          solServiceNotes.trim() ? ' — Notas: ' + solServiceNotes.trim() : ''
        }`,
        velocidad_entrega: solServicePlazo,
        servicios_seleccionados: {
          servicio: selectedContractedService,
          titulo: solServiceTitle.trim(),
          plazo: solServicePlazo,
          notas: solServiceNotes.trim(),
        },
      });
      setSolicitudes((prev) => [newSol, ...prev]);
      showToast('¡Solicitud Enviada!', 'Tu solicitud fue registrada y será atendida por el equipo Wuish.', 'success');
      setSelectedContractedService('');
      setSolServiceTitle('');
      setSolServiceDesc('');
      setSolServiceNotes('');
      setSolServicePlazo('normal');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar la solicitud', 'error');
    } finally {
      setSolSubmitting(false);
    }
  };

  if (contractedServices.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="relative rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/20 p-8 sm:p-12 overflow-hidden text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd56d]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#ffd56d]/10 border border-[#ffd56d]/30 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-[#ffd56d]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
                Aún no tienes un plan activo
              </h2>
              <p className="text-sm text-[#9a907c] leading-relaxed">
                Para hacer solicitudes primero debes adquirir los servicios que necesitas en el
                <span className="text-[#ffd56d] font-semibold"> Cotizador</span>. Puedes usar una
                plantilla de <span className="text-[#ffd56d] font-semibold">Planes</span> como punto de partida.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Elige una Plantilla',
              desc: 'Visita la sección de Planes y selecciona la plantilla que mejor se ajuste a tu negocio como punto de partida.',
              cta: 'Ver Plantillas de Planes',
              tab: 'planes' as const,
              active: true,
            },
            {
              step: '02',
              title: 'Adquiere tus Servicios',
              desc: 'En el Cotizador personaliza los módulos y servicios que necesitas. Al cotizar quedan registrados en tu cuenta.',
              cta: 'Ir al Cotizador',
              tab: 'cotizador' as const,
              active: true,
            },
            {
              step: '03',
              title: 'Haz tus Solicitudes',
              desc: 'Una vez con servicios contratados podrás hacer solicitudes específicas para cada módulo de tu plan.',
              cta: null,
              tab: null,
              active: false,
            },
          ].map(({ step, title, desc, cta, tab, active }) => (
            <div
              key={step}
              className={`rounded-2xl p-6 border flex flex-col gap-4 ${
                active
                  ? 'bg-[#1c1b1d] border-white/10 hover:border-[#ffd56d]/40 transition-all'
                  : 'bg-[#151416] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-display text-[#ffd56d]/30">{step}</span>
                <h3 className="text-sm font-bold text-white">{title}</h3>
              </div>
              <p className="text-xs text-[#9a907c] leading-relaxed flex-1">{desc}</p>
              {cta && tab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(tab)}
                  className="mt-auto w-full px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ffd56d]/10"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {cta}
                </button>
              )}
              {!active && (
                <div className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-600 text-center font-semibold">
                  Disponible tras cotizar
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 text-center">
          <p className="text-xs text-zinc-500">
            Aún no tienes solicitudes registradas. Completa los pasos anteriores para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="relative rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-[#ffd56d]/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Plan activo con {contractedServices.length} servicio
              {contractedServices.length !== 1 ? 's' : ''} contratado
              {contractedServices.length !== 1 ? 's' : ''}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {activePlanRecord?.plan?.nombre || 'Tu Plan Personalizado'}
              </h2>
              <p className="text-xs text-[#9a907c] mt-1">
                Puedes hacer solicitudes sobre los servicios que contrataste en el Cotizador.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {contractedServices.map((srv: any, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/25 text-[11px] font-semibold text-[#ffd56d]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]" />
                  {srv.name || srv.nombre || srv.id || `Servicio ${idx + 1}`}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('cotizador')}
            className="shrink-0 px-4 py-2 rounded-xl border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold hover:bg-[#ffd56d]/10 transition cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ampliar Plan
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-[#ffd56d]/15 border border-[#ffd56d]/30 flex items-center justify-center text-[#ffd56d]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">Nueva Solicitud</h3>
            <p className="text-xs text-[#9a907c]">
              Selecciona el servicio contratado sobre el que harás la solicitud.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#ffd56d] mb-3">
              1. ¿Sobre qué servicio es tu solicitud?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {contractedServices.map((srv: any, idx: number) => {
                const srvId = srv.id || srv.name || `srv_${idx}`;
                const srvLabel = srv.name || srv.nombre || srvId;
                const isSelected = selectedContractedService === srvId;
                return (
                  <button
                    key={srvId}
                    type="button"
                    onClick={() => setSelectedContractedService(srvId)}
                    className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ffd56d]/15 border-[#ffd56d] ring-1 ring-[#ffd56d]/50 text-white shadow-md shadow-[#ffd56d]/10'
                        : 'bg-[#0e0e10] border-white/5 text-[#d1c5af] hover:border-white/20 hover:bg-[#161518]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ffd56d]" />
                      {isSelected && <span className="text-[#ffd56d] text-[10px]">✓</span>}
                    </div>
                    {srvLabel}
                    {srv.category && (
                      <div className="text-[10px] text-[#9a907c] font-normal mt-0.5">
                        {srv.category}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#ffd56d]">
              2. Describe tu requerimiento
            </label>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Título de la solicitud *
              </label>
              <input
                type="text"
                required
                value={solServiceTitle}
                onChange={(e) => setSolServiceTitle(e.target.value)}
                placeholder="Ej: Agregar sección de testimonios a la web"
                className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Descripción detallada *
              </label>
              <textarea
                required
                rows={4}
                value={solServiceDesc}
                onChange={(e) => setSolServiceDesc(e.target.value)}
                placeholder="Describe con detalle qué necesitas que el equipo realice..."
                className="w-full bg-[#0e0e10] text-white p-3.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Plazo deseado
                </label>
                <select
                  value={solServicePlazo}
                  onChange={(e) => setSolServicePlazo(e.target.value)}
                  className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                >
                  <option value="normal">Estándar (Tiempo sugerido Wuish)</option>
                  <option value="rapida">Prioritario / Rápido</option>
                  <option value="urgente">Urgente (Sprint acelerado)</option>
                  <option value="flexible">Flexible / Sin prisa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notas adicionales
                </label>
                <input
                  type="text"
                  value={solServiceNotes}
                  onChange={(e) => setSolServiceNotes(e.target.value)}
                  placeholder="Notas, referencias, links..."
                  className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0e0e10] border border-white/5 text-[11px] text-[#9a907c]">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd56d] shrink-0 mt-0.5" />
            <span>
              ¿Necesitas un servicio que no está en tu plan?{' '}
              <button
                type="button"
                onClick={() => onNavigateTab('cotizador')}
                className="text-[#ffd56d] font-semibold hover:underline cursor-pointer"
              >
                Amplía tu plan en el Cotizador
              </button>
              .
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
            <p className="text-[11px] text-[#9a907c]">
              🔒 Solicitud asignada inmediatamente a tu equipo técnico.
            </p>
            <button
              type="submit"
              disabled={solSubmitting || !selectedContractedService}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{solSubmitting ? 'Enviando...' : 'Enviar Solicitud'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Tus Solicitudes Registradas</h3>
            <p className="text-xs text-[#9a907c]">Monitorea el progreso y estados de tus requerimientos.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={solSearchTerm}
                onChange={(e) => {
                  setSolSearchTerm(e.target.value);
                  setSolTabCurPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ffd56d] w-48"
              />
            </div>
            <div className="flex items-center bg-[#0e0e10] p-1 rounded-xl border border-white/5 text-[11px]">
              {['Todas', 'Pendiente', 'En Proceso', 'Aprobada'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSolTabFilter(st);
                    setSolTabCurPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    solTabFilter === st
                      ? 'bg-[#ffd56d] text-[#3e2e00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#9a907c] tracking-wider border-b border-white/5">
              <tr>
                <th className="pb-3 pr-4">Código</th>
                <th className="pb-3 pr-4">Requerimiento</th>
                <th className="pb-3 pr-4">Servicio</th>
                <th className="pb-3 pr-4">Fecha</th>
                <th className="pb-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTabSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                    No hay solicitudes que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                paginatedTabSolicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-[#201f21]/70 transition">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">
                      #{sol.id?.slice(0, 8)}
                    </td>
                    <td className="py-3.5 pr-4 max-w-sm">
                      <div className="font-semibold text-white truncate">
                        {sol.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#d1c5af]">
                        {sol.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-[#9a907c]">
                      {new Date(sol.created_at || sol.fecha_solicitud).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          sol.estado === 'aprobada' || sol.estado === 'finalizada'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : sol.estado === 'en_proceso' || sol.estado === 'en_revision'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {sol.estado?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTabSolicitudes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-[#9a907c]">
            <div className="text-[11px]">
              Mostrando{' '}
              <span className="font-semibold text-white">
                {(solTabCurPage - 1) * SOL_TAB_PER_PAGE + 1}
              </span>{' '}
              –{' '}
              <span className="font-semibold text-white">
                {Math.min(solTabCurPage * SOL_TAB_PER_PAGE, filteredTabSolicitudes.length)}
              </span>{' '}
              de <span className="font-semibold text-[#ffd56d]">{filteredTabSolicitudes.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSolTabCurPage((p) => Math.max(p - 1, 1))}
                disabled={solTabCurPage <= 1}
                className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: solTabTotalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    onClick={() => setSolTabCurPage(i + 1)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                      solTabCurPage === i + 1
                        ? 'bg-[#ffd56d] text-[#3e2e00]'
                        : 'bg-[#201f21] text-[#d1c5af] hover:text-white border border-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSolTabCurPage((p) => Math.min(p + 1, solTabTotalPages))}
                disabled={solTabCurPage >= solTabTotalPages}
                className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
