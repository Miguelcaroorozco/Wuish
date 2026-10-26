import React from 'react';
import { PlusCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { EstadoSolicitud, ESTADO_SOLICITUD_LABELS } from '../../types';
import { BuzonChat } from './BuzonChat';

interface ResumenTabProps {
  user: any;
  solicitudes: any[];
  filterStatus: EstadoSolicitud | 'Todas';
  onFilterChange: (status: EstadoSolicitud | 'Todas') => void;
  filteredSolicitudes: any[];
  paginatedDashboardRequests: any[];
  dashboardRequestsPage: number;
  dashboardRequestsTotalPages: number;
  onPageChange: (updater: (prev: number) => number) => void;
  onNavigateTab: (tab: any) => void;
  messages: any[];
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  chatBottomRef: React.RefObject<HTMLDivElement>;
  requestsPerPage: number;
}

export const ResumenTab: React.FC<ResumenTabProps> = ({
  user,
  solicitudes,
  filterStatus,
  onFilterChange,
  filteredSolicitudes,
  paginatedDashboardRequests,
  dashboardRequestsPage,
  dashboardRequestsTotalPages,
  onPageChange,
  onNavigateTab,
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  chatBottomRef,
  requestsPerPage,
}) => {
  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#ffd56d]/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#353437]/80 border border-[#ffd56d]/30 text-xs font-semibold text-[#ffd56d]">
                <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
                Cuenta Corporativa
              </span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e5e1e4] font-display tracking-tight">
                Hola, {user?.nombres || 'Usuario'}
              </h1>
              <p className="text-sm text-[#d1c5af] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-white font-medium capitalize">{user?.rol || 'Cliente'}</span>
                <span className="text-[#9a907c]">—</span>
                <span className="text-[#ffd56d] font-medium">{user?.correo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('solicitudes')}
              className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition shadow-lg shadow-[#ffd56d]/15 flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-[#3e2e00]" />
              <span>Nueva Solicitud Estratégica</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                Mis Solicitudes e Historial
              </h3>
              <p className="text-xs text-[#d1c5af] mt-0.5">
                Trazabilidad en tiempo real de requerimientos ejecutivos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#131315] rounded-xl border border-white/5 text-xs">
              {(['Todas', 'pendiente', 'en_revision', 'en_proceso', 'aprobada', 'finalizada'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onFilterChange(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[#ffd56d] text-[#3e2e00] font-bold shadow-sm'
                      : 'text-[#d1c5af] hover:text-white'
                  }`}
                >
                  {st === 'Todas' ? `Todas (${solicitudes.length})` : ESTADO_SOLICITUD_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
                <tr>
                  <th className="pb-3 pr-4">Código</th>
                  <th className="pb-3 pr-4">Servicio Solicitado</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 pr-4">Plan</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSolicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                      <p className="text-sm font-semibold text-white">No hay requerimientos activos</p>
                      <p className="text-xs text-[#9a907c] mt-1">Haz clic en &quot;Nueva Solicitud Estratégica&quot; para registrar un proyecto.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedDashboardRequests.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#201f21]/70 transition-colors group"
                    >
                      <td className="py-4 pr-4 font-mono font-bold text-[#ffd56d]">
                        #{item.id?.slice(0, 8)}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-white text-sm group-hover:text-[#ffd56d] transition-colors">
                          {item.tipo}
                        </div>
                        <div className="text-[11px] text-[#9a907c] mt-0.5">
                          {item.descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-[#d1c5af] whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2.5 py-1 rounded bg-[#201f21] border border-white/5 text-zinc-300 font-medium">
                          {item.plan?.nombre || '—'}
                        </span>
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                            item.estado === 'en_proceso'
                              ? 'bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30'
                              : item.estado === 'en_revision' || item.estado === 'pendiente'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : item.estado === 'cancelada'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {ESTADO_SOLICITUD_LABELS[item.estado as EstadoSolicitud] ?? item.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#9a907c]">
              {filteredSolicitudes.length === 0
                ? 'No hay solicitudes para mostrar.'
                : `Mostrando ${(dashboardRequestsPage - 1) * requestsPerPage + 1} – ${Math.min(
                    dashboardRequestsPage * requestsPerPage,
                    filteredSolicitudes.length
                  )} de ${filteredSolicitudes.length} solicitudes.`}
            </span>
            {filteredSolicitudes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPageChange((page) => Math.max(page - 1, 1))}
                  disabled={dashboardRequestsPage <= 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-8 text-center text-[11px] font-bold text-white">
                  {dashboardRequestsPage} / {dashboardRequestsTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange((page) => Math.min(page + 1, dashboardRequestsTotalPages))}
                  disabled={dashboardRequestsPage >= dashboardRequestsTotalPages}
                  aria-label="Página siguiente"
                  className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => onNavigateTab('solicitudes')}
              className="text-xs font-bold text-[#ffd56d] hover:text-[#ffdf97] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ir al Centro de Solicitudes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <BuzonChat
          messages={messages}
          chatInput={chatInput}
          onChatInputChange={onChatInputChange}
          onSendMessage={onSendMessage}
          chatBottomRef={chatBottomRef}
          user={user}
        />
      </div>
    </div>
  );
};
