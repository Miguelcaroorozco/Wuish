import React from 'react';
import { Search, CheckCircle2, MousePointerClick, Eye, XCircle } from 'lucide-react';
import { AdminPagination } from './AdminPagination';
import { SolicitudDetails } from '../SolicitudDetails';

const ESTADOS_SOLICITUD = [
  'aprobada',
  'finalizada',
];

const ESTADO_SOLICITUD_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  rechazado: 'Rechazado',
};

interface AdminSolicitudesTabProps {
  solicitudes: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  solicitudesPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onStatusChange: (id: string, nuevoEstado: string) => void;
  requestType?: 'servicio' | 'cotizacion';
  selectedRequestId: string | null;
  selectedRequestIds: string[];
  onSelectRequest: (request: any) => void;
  onAcceptRequest: (request: any) => void;
  onApproveQuotation: (request: any) => void;
  onRejectQuotation: (request: any) => void;
  admins: any[];
  onAssignAdmins: (requestId: string, adminIds: string[]) => void;
  currentAdmin?: any;
  serviceOptions?: any[];
}

export const AdminSolicitudesTab: React.FC<AdminSolicitudesTabProps> = ({
  solicitudes,
  searchTerm,
  onSearchChange,
  solicitudesPage,
  onPageChange,
  itemsPerPage,
  onStatusChange,
  requestType = 'servicio',
  selectedRequestId,
  selectedRequestIds,
  onSelectRequest,
  onAcceptRequest,
  onApproveQuotation,
  onRejectQuotation,
  admins,
  onAssignAdmins,
  currentAdmin,
  serviceOptions = [],
}) => {
  const categories = Array.from(new Set(
    solicitudes
      .filter((r) => requestType === 'cotizacion' ? r.tipo === 'cotizacion' : r.tipo !== 'cotizacion')
      .map((r) => r.tipo)
      .filter(Boolean)
  ));
  const [detailRequestId, setDetailRequestId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState('todas');
  const filtered = solicitudes.filter((r) => {
    const matchesType = requestType === 'cotizacion' ? r.tipo === 'cotizacion' : r.tipo !== 'cotizacion';
    const matchesCategory = category === 'todas' || r.tipo === category;
    const t = searchTerm.toLowerCase();
    return (
      matchesType &&
      matchesCategory &&
      (
        (r.usuario?.nombres || '').toLowerCase().includes(t) ||
        (r.usuario?.correo || '').toLowerCase().includes(t) ||
        (r.tipo || '').toLowerCase().includes(t) ||
        (r.descripcion || '').toLowerCase().includes(t)
      )
    );
  });

  const paginated = filtered.slice(
    (solicitudesPage - 1) * itemsPerPage,
    solicitudesPage * itemsPerPage
  );
  const isQuotation = requestType === 'cotizacion';
  const hasSelectedRequest = !isQuotation && selectedRequestIds.length > 0;
  const selectedRequest = solicitudes.find((request) => request.id === selectedRequestId);
  const detailRequest = solicitudes.find((request) => request.id === detailRequestId) || null;
  const getServiceName = (request: any) => {
    const selected = request.servicios_seleccionados;
    const serviceData = Array.isArray(selected) ? selected[0] : selected;
    const serviceId = serviceData?.servicio || serviceData?.id;
    const configuredService = serviceOptions.find((service) => (
      String(service.id).toLowerCase() === String(serviceId).toLowerCase()
    ));
    return serviceData?.nombre_servicio || serviceData?.nombre || serviceData?.name || configuredService?.name || configuredService?.nombre || serviceId || request.tipo;
  };
  const assignedAdminIds = (selectedRequest?.administradores || [])
    .map((assignment: any) => assignment.admin_id || assignment.admin?.id);
  if (selectedRequest?.admin_asignado_id && !assignedAdminIds.includes(selectedRequest.admin_asignado_id)) {
    assignedAdminIds.push(selectedRequest.admin_asignado_id);
  }

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">
            {requestType === 'cotizacion' ? 'Cotizaciones Registradas' : 'Solicitudes de Servicio'}
          </h3>
          <p className="text-xs text-[#9a907c]">
            {requestType === 'cotizacion' ? 'Gestión de propuestas comerciales.' : 'Monitoreo y cambio de estado de servicios.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              onPageChange(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white focus:border-[#ffd56d] focus:outline-none"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, correo, tipo..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              className="pl-9 pr-4 py-2 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:border-[#ffd56d] focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
            <tr>
              <th className="pb-3 pr-4">Código</th>
              <th className="pb-3 pr-4">Cliente</th>
              <th className="pb-3 pr-4">Tipo</th>
              <th className="pb-3 pr-4">Descripción</th>
              <th className="pb-3 pr-4">Fecha</th>
              {!isQuotation && <th className="pb-3 pr-4 text-center">Seleccionar</th>}
              {!isQuotation && <th className="pb-3 text-center">Detalles</th>}
              {isQuotation && <th className="pb-3 text-right">Acciones</th>}
              {hasSelectedRequest && <th className="pb-3 text-right">Estado</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isQuotation ? 6 : (hasSelectedRequest ? 8 : 7)} className="py-8 text-center text-zinc-500">
                  No hay solicitudes registradas.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-[#201f21]/70 transition-colors ${!isQuotation ? 'cursor-pointer' : ''} ${
                    ''
                  }`}
                >
                  <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">
                    #{r.id?.slice(0, 8)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white">
                      {r.usuario?.nombres} {r.usuario?.apellidos}
                    </div>
                    <div className="text-[11px] text-[#9a907c]">{r.usuario?.correo}</div>
                    {(r.empresa || r.usuario?.empresa) && (
                      <div className="text-[10px] text-[#ffd56d] font-medium mt-0.5">
                        🏢 {r.empresa || r.usuario?.empresa}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="capitalize text-[#d1c5af] font-semibold">
                      {r.tipo === 'cotizacion' ? 'Cotización' : getServiceName(r)}
                    </div>
                    {r.plan?.nombre && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd56d]/15 text-[#ffd56d] font-bold border border-[#ffd56d]/20 inline-block mt-0.5">
                        {r.plan.nombre}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 max-w-xs truncate text-[#d1c5af]">
                    {r.descripcion || '—'}
                  </td>
                  <td className="py-3.5 pr-4 text-[#9a907c]">
                    {new Date(r.created_at).toLocaleDateString('es-CO')}
                  </td>
                  {!isQuotation && <td className="py-3.5 pr-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(r)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                        selectedRequestIds.includes(r.id)
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-[#ffd56d] text-[#3e2e00] hover:bg-[#ffdf97] hover:scale-105 shadow-md shadow-[#ffd56d]/20'
                      }`}
                    >
                      {selectedRequestIds.includes(r.id) ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Seleccionada</>
                      ) : (
                        <><MousePointerClick className="w-3.5 h-3.5" /> Seleccionar solicitud</>
                      )}
                    </button>
                  </td>}
                  {!isQuotation && <td className="py-3.5 text-center">
                    <button type="button" onClick={() => setDetailRequestId(r.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#ffd56d] hover:bg-[#ffd56d]/10 text-[10px] font-bold cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> Ver detalles
                    </button>
                  </td>}
                  {isQuotation && <td className="py-3.5 text-right">
                    {r.estado === 'pendiente' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onApproveQuotation(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-bold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectQuotation(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/25 text-[10px] font-bold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.estado === 'aprobado' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' : 'bg-red-500/10 text-red-300 border border-red-400/20'}`}>
                        {r.estado?.toUpperCase()}
                      </span>
                    )}
                  </td>}
                  {hasSelectedRequest && (
                    <td className="py-3.5 text-right">
                      {selectedRequestIds.includes(r.id) && (
                        <select
                          value={r.estado}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onStatusChange(r.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#201f21] border border-[#ffd56d]/50 text-[11px] font-semibold text-[#ffd56d] focus:outline-none cursor-pointer"
                        >
                          {ESTADOS_SOLICITUD.map((st) => (
                            <option key={st} value={st}>{ESTADO_SOLICITUD_LABELS[st].toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={solicitudesPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="solicitudes"
      />
      {!isQuotation && detailRequestId && (
        <>
        <SolicitudDetails
          solicitud={detailRequest}
          onClose={() => setDetailRequestId(null)}
          currentAdmin={selectedRequestIds.includes(detailRequest.id) ? currentAdmin : undefined}
        />
        {selectedRequest?.estado === 'pendiente' && detailRequest.id === selectedRequest.id && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onAcceptRequest(selectedRequest)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aceptar solicitud
            </button>
          </div>
        )}
        {selectedRequest && (
          <div className="rounded-xl border border-[#ffd56d]/20 bg-[#201f21] p-4">
            <p className="text-xs font-bold text-white mb-3">Administradores asignados a esta solicitud</p>
            <div className="flex flex-wrap gap-2">
              {admins.map((admin) => {
                const checked = assignedAdminIds.includes(admin.id);
                return (
                  <label key={admin.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer ${checked ? 'border-[#ffd56d]/50 bg-[#ffd56d]/10 text-white' : 'border-white/10 text-[#9a907c]'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...assignedAdminIds, admin.id]
                          : assignedAdminIds.filter((id: string) => id !== admin.id);
                        onAssignAdmins(selectedRequest.id, next);
                      }}
                      className="accent-[#ffd56d]"
                    />
                    {admin.nombres} {admin.apellidos}
                  </label>
                );
              })}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};
