import React from 'react';
import { Plus, Star, Pencil, Eye, EyeOff } from 'lucide-react';
import { AdminPagination } from './AdminPagination';

interface AdminPlanesTabProps {
  planes: any[];
  recomendadoPlanId: string;
  planesPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onOpenCreatePlan: () => void;
  onOpenEditPlan: (plan: any) => void;
  onTogglePlan: (plan: any) => void;
  onSetRecomendado: (plan: any) => void;
}

export const AdminPlanesTab: React.FC<AdminPlanesTabProps> = ({
  planes,
  recomendadoPlanId,
  planesPage,
  itemsPerPage,
  onPageChange,
  onOpenCreatePlan,
  onOpenEditPlan,
  onTogglePlan,
  onSetRecomendado,
}) => {
  const paginatedPlanes = planes.slice(
    (planesPage - 1) * itemsPerPage,
    planesPage * itemsPerPage
  );

  const getPlanFeatures = (plan: any) => {
    if (Array.isArray(plan.caracteristicas)) return plan.caracteristicas;
    if (typeof plan.caracteristicas === 'string') {
      try {
        const parsed = JSON.parse(plan.caracteristicas);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return plan.caracteristicas.split('\n').filter(Boolean);
      }
    }
    return [];
  };

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Gestión de Planes</h3>
          <p className="text-xs text-[#9a907c]">
            Administra precios, descripciones y características de las soluciones.
          </p>
        </div>
        <button
          onClick={onOpenCreatePlan}
          className="px-4 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {planes.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#9a907c]">
          No hay planes registrados todavía.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedPlanes.map((plan) => {
              const features = getPlanFeatures(plan);
              const isRec = plan.id === recomendadoPlanId;
              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border flex flex-col gap-3 transition ${
                    isRec
                      ? 'bg-[#201f21] border-[#ffd56d] shadow-lg shadow-[#ffd56d]/10'
                      : plan.activo
                      ? 'bg-[#201f21] border-white/10'
                      : 'bg-[#161617] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-wider font-display">
                        {plan.tipo_servicio?.nombre || 'Plan'}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{plan.nombre}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRec && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ffd56d] text-[#3e2e00] border border-[#ffd56d] shadow-sm flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-[#3e2e00]" />
                          Recomendado
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          plan.activo
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {plan.activo ? 'Visible' : 'Oculto'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xl font-extrabold text-white font-display">
                    {plan.precio != null
                      ? `$${parseFloat(plan.precio).toLocaleString('es-CO')}`
                      : 'Personalizado'}
                    {plan.precio != null && (
                      <span className="text-[10px] text-[#9a907c] font-semibold ml-1">COP</span>
                    )}
                  </div>

                  <p className="text-xs text-[#9a907c] line-clamp-2 min-h-[32px]">
                    {plan.descripcion || 'Sin descripción'}
                  </p>
                  <span className="text-[11px] text-[#d1c5af]">
                    {features.length}{' '}
                    {features.length === 1 ? 'característica' : 'características'}
                  </span>

                  <div className="space-y-2 pt-3 mt-auto border-t border-white/5">
                    <button
                      onClick={() => onSetRecomendado(plan)}
                      disabled={isRec}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isRec
                          ? 'bg-[#ffd56d]/15 text-[#ffd56d] border-[#ffd56d]/40 font-bold cursor-default'
                          : 'bg-[#252427] hover:bg-[#ffd56d] hover:text-[#3e2e00] text-[#d1c5af] border-white/5'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isRec ? 'fill-[#ffd56d]' : ''}`} />
                      <span>
                        {isRec ? '★ Plan Recomendado Oficial' : 'Fijar como Recomendado'}
                      </span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenEditPlan(plan)}
                        className="flex-1 py-2 rounded-lg bg-[#2a2a2c] hover:bg-[#353437] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => onTogglePlan(plan)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          plan.activo
                            ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                            : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                        }`}
                        title={
                          plan.activo
                            ? 'Ocultar plan a los clientes'
                            : 'Hacer visible el plan a los clientes'
                        }
                      >
                        {plan.activo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {plan.activo ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={planesPage}
            totalItems={planes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            itemName="planes"
          />
        </>
      )}
    </div>
  );
};
