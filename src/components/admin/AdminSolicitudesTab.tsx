import React from 'react';
import { Search } from 'lucide-react';
import { AdminPagination } from './AdminPagination';

const ESTADOS_SOLICITUD = [
  'pendiente',
  'en_revision',
  'en_proceso',
  'aprobada',
  'finalizada',
  'cancelada',
];

const ESTADO_SOLICITUD_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  en_proceso: 'En Proceso',
  aprobada: 'Aprobada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

interface AdminSolicitudesTabProps {
  solicitudes: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  solicitudesPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onStatusChange: (id: string, nuevoEstado: string) => void;
}

export const AdminSolicitudesTab: React.FC<AdminSolicitudesTabProps> = ({
  solicitudes,
  searchTerm,
  onSearchChange,
  solicitudesPage,
  onPageChange,
  itemsPerPage,
  onStatusChange,
}) => {
  const filtered = solicitudes.filter((r) => {
    const t = searchTerm.toLowerCase();
    return (
      (r.usuario?.nombres || '').toLowerCase().includes(t) ||
      (r.usuario?.correo || '').toLowerCase().includes(t) ||
      (r.tipo || '').toLowerCase().includes(t) ||
      (r.descripcion || '').toLowerCase().includes(t)
    );
  });

  const paginated = filtered.slice(
    (solicitudesPage - 1) * itemsPerPage,
    solicitudesPage * itemsPerPage
  );

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Solicitudes Registradas</h3>
          <p className="text-xs text-[#9a907c]">Monitoreo y cambio de estado de servicios.</p>
        </div>
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
            <tr>
              <th className="pb-3 pr-4">Código</th>
              <th className="pb-3 pr-4">Cliente</th>
              <th className="pb-3 pr-4">Tipo</th>
              <th className="pb-3 pr-4">Descripción</th>
              <th className="pb-3 pr-4">Fecha</th>
              <th className="pb-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No hay solicitudes registradas.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className="hover:bg-[#201f21]/70 transition-colors">
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
                    <div className="capitalize text-[#d1c5af] font-semibold">{r.tipo}</div>
                    {r.plan?.nombre && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd56d]/15 text-[#ffd56d] font-bold border border-[#ffd56d]/20 inline-block mt-0.5">
                        {r.plan.nombre}
                      </span>
                    )}
                    {r.presupuesto_min && r.presupuesto_max && (
                      <div className="text-[10px] font-mono text-[#ffd56d] font-bold mt-1">
                        ${Number(r.presupuesto_min).toLocaleString('es-CO')} - $
                        {Number(r.presupuesto_max).toLocaleString('es-CO')} COP
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 max-w-xs truncate text-[#d1c5af]">
                    {r.descripcion || '—'}
                  </td>
                  <td className="py-3.5 pr-4 text-[#9a907c]">
                    {new Date(r.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-3.5 text-right">
                    <select
                      value={r.estado}
                      onChange={(e) => onStatusChange(r.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-[#201f21] border border-white/10 text-[11px] font-semibold text-[#ffd56d] focus:outline-none cursor-pointer"
                    >
                      {ESTADOS_SOLICITUD.map((st) => (
                        <option key={st} value={st}>
                          {ESTADO_SOLICITUD_LABELS[st].toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
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
    </div>
  );
};
