import React from 'react';
import { Sliders, Plus, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';
import { AdminPagination } from './AdminPagination';

export interface CotizadorServiceItem {
  id: string;
  name: string;
  category: 'tecnologia' | 'comunicacion';
  basePrice: number;
  description: string;
  activo?: boolean;
}

interface AdminCotizadorTabProps {
  cotizadorOptions: CotizadorServiceItem[];
  cotizadorPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onOpenCreateOption: () => void;
  onOpenEditOption: (opt: CotizadorServiceItem) => void;
  onToggleOptionVisibility: (id: string) => void;
  onDeleteOption: (id: string, name: string) => void;
}

export const AdminCotizadorTab: React.FC<AdminCotizadorTabProps> = ({
  cotizadorOptions,
  cotizadorPage,
  itemsPerPage,
  onPageChange,
  onOpenCreateOption,
  onOpenEditOption,
  onToggleOptionVisibility,
  onDeleteOption,
}) => {
  const paginatedCotizador = cotizadorOptions.slice(
    (cotizadorPage - 1) * itemsPerPage,
    cotizadorPage * itemsPerPage
  );

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#ffd56d]" />
            <h3 className="text-lg font-bold text-white font-display">
              Módulos &amp; Opciones del Cotizador
            </h3>
          </div>
          <p className="text-xs text-[#9a907c] mt-1 max-w-2xl">
            Gestiona y añade los servicios y capacidades disponibles en el Cotizador Dinámico.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateOption}
          className="px-4 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffe082] text-[#3e2e00] text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md shadow-[#ffd56d]/10"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Módulo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {paginatedCotizador.map((opt) => {
          const isVisible = opt.activo !== false;
          return (
            <div
              key={opt.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                isVisible
                  ? 'bg-[#201f21] border-white/5 hover:border-white/20'
                  : 'bg-[#181719] border-amber-500/20 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-[#ffd56d] font-mono tracking-wider">
                      {opt.category === 'comunicacion' ? 'Comunicación' : 'Tecnología'}
                    </span>
                    {!isVisible && (
                      <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Oculto
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-[#ffd56d] font-mono">
                    ${opt.basePrice.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">{opt.name}</h4>
                <p className="text-xs text-[#9a907c] mt-1.5 leading-relaxed line-clamp-2">
                  {opt.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleOptionVisibility(opt.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                      isVisible
                        ? 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
                        : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                    }`}
                    title={
                      isVisible
                        ? 'Ocultar módulo del cotizador'
                        : 'Hacer visible el módulo en el cotizador'
                    }
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isVisible ? 'Visible' : 'Oculto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteOption(opt.id, opt.name)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition cursor-pointer border border-red-500/20"
                    title="Eliminar módulo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenEditOption(opt)}
                  className="px-3 py-1.5 rounded-lg bg-[#ffd56d]/15 hover:bg-[#ffd56d]/25 text-[#ffd56d] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-[#ffd56d]/30"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AdminPagination
        currentPage={cotizadorPage}
        totalItems={cotizadorOptions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="módulos"
      />
    </div>
  );
};
