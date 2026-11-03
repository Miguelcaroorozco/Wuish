import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface CotizacionesTableProps {
  solicitudes: any[];
}

const PAGE_SIZE = 6;

export const CotizacionesTable: React.FC<CotizacionesTableProps> = ({ solicitudes }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const cotizaciones = useMemo(() => solicitudes.filter((sol) => sol.tipo === 'cotizacion'), [solicitudes]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cotizaciones.filter((sol) => !term || [sol.id, sol.descripcion, sol.plan?.nombre]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)));
  }, [cotizaciones, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Cotizaciones</h3>
          <p className="text-xs text-[#9a907c]">Historial de planes y propuestas comerciales.</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar cotización..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ffd56d] w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase font-bold text-[#9a907c] tracking-wider border-b border-white/5">
            <tr>
              <th className="pb-3 pr-4">Código</th>
              <th className="pb-3 pr-4">Descripción</th>
              <th className="pb-3 pr-4">Plan</th>
              <th className="pb-3 pr-4">Fecha</th>
              <th className="pb-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visible.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No hay cotizaciones registradas.</td></tr>
            ) : visible.map((sol) => (
              <tr key={sol.id} className="hover:bg-[#201f21]/70 transition">
                <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">#{sol.id?.slice(0, 8)}</td>
                <td className="py-3.5 pr-4 max-w-sm text-white truncate">{sol.descripcion || 'Sin descripción'}</td>
                <td className="py-3.5 pr-4 text-[#d1c5af]">{sol.plan?.nombre || 'Personalizada'}</td>
                <td className="py-3.5 pr-4 text-[#9a907c]">
                  {new Date(sol.created_at || sol.fecha_solicitud).toLocaleDateString('es-CO')}
                </td>
                <td className="py-3.5 text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {sol.estado?.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-[#9a907c]">
          <span>{filtered.length} cotización{filtered.length === 1 ? '' : 'es'}</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 disabled:opacity-30 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 disabled:opacity-30 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
