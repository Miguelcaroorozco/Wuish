import React from 'react';

interface AdminPlanModalProps {
  show: boolean;
  editingPlanId: string | null;
  newPlan: {
    nombre: string;
    precio: string;
    tipo_id: string;
    desc: string;
    features: string;
  };
  onPlanChange: (plan: any) => void;
  tiposServicio: any[];
  cotizadorOptions: any[];
  onToggleFeatureModule: (moduleName: string) => void;
  onSavePlan: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AdminPlanModal: React.FC<AdminPlanModalProps> = ({
  show,
  editingPlanId,
  newPlan,
  onPlanChange,
  tiposServicio,
  cotizadorOptions,
  onToggleFeatureModule,
  onSavePlan,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              {editingPlanId ? 'Editar Plan (Plantilla)' : 'Nuevo Plan Corporativo'}
            </h3>
            <p className="text-[11px] text-[#9a907c] mt-0.5">
              Define los módulos del cotizador que componen este paquete.
            </p>
          </div>
          <button onClick={onClose} className="text-[#9a907c] hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={onSavePlan} className="space-y-4">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Nombre</label>
            <input
              type="text"
              required
              value={newPlan.nombre}
              onChange={(e) => onPlanChange({ ...newPlan, nombre: e.target.value })}
              placeholder="Ej: Plan Enterprise Growth"
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Precio (COP)</label>
              <input
                type="number"
                required
                value={newPlan.precio}
                onChange={(e) => onPlanChange({ ...newPlan, precio: e.target.value })}
                placeholder="1200"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Tipo de Servicio</label>
              <select
                value={newPlan.tipo_id}
                onChange={(e) => onPlanChange({ ...newPlan, tipo_id: e.target.value })}
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              >
                {tiposServicio.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Descripción</label>
            <textarea
              rows={2}
              value={newPlan.desc}
              onChange={(e) => onPlanChange({ ...newPlan, desc: e.target.value })}
              placeholder="Alcance del plan..."
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-zinc-300 font-semibold">
                Características del Plan (Módulos del Cotizador):
              </label>
              <span className="text-[11px] text-[#ffd56d] font-mono font-semibold">
                {newPlan.features.split('\n').filter(Boolean).length} seleccionados
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-[#0e0e10] border border-white/10 max-h-60 overflow-y-auto">
              {cotizadorOptions.map((opt) => {
                const isChecked = newPlan.features
                  .split('\n')
                  .map((l) => l.trim().toLowerCase())
                  .filter(Boolean)
                  .some((l) => l === opt.name.toLowerCase() || l.includes(opt.name.toLowerCase()));
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs cursor-pointer border transition select-none ${
                      isChecked
                        ? 'bg-[#ffd56d]/15 border-[#ffd56d]/50 text-white'
                        : 'bg-[#181719] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleFeatureModule(opt.name)}
                      className="accent-[#ffd56d] w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="truncate flex-1 font-medium">{opt.name}</span>
                    {opt.activo === false && (
                      <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                        Oculto
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-[#ffd56d]">
                      ${opt.basePrice}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold cursor-pointer hover:bg-[#ffdf97]"
            >
              {editingPlanId ? 'Guardar Cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
