import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
  itemsPerPage: number;
  itemName: string;
  onPageChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages: propTotalPages,
  totalItems,
  itemsPerPage,
  itemName,
  onPageChange,
}) => {
  const totalPages = propTotalPages !== undefined ? propTotalPages : Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-[#9a907c]">
      <div className="text-[11px]">
        Mostrando <span className="font-semibold text-white">{startItem}</span> –{' '}
        <span className="font-semibold text-white">{endItem}</span> de{' '}
        <span className="font-semibold text-[#ffd56d]">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 font-semibold text-xs"
          title="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={`ell-${idx}`} className="px-1 text-zinc-600 font-mono text-xs">
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[30px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm'
                    : 'bg-[#201f21] text-[#d1c5af] hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 font-semibold text-xs"
          title="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
