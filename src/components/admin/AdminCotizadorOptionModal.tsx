import React from 'react';

interface CotizadorServiceItem {
  id: string;
  name: string;
  category: 'tecnologia' | 'comunicacion';
  basePrice: number;
  description: string;
  activo?: boolean;
}

interface AdminCotizadorOptionModalProps {
  show: boolean;
  isCreating: boolean;
  editingOption: CotizadorServiceItem | null;
  onOptionChange: (opt: CotizadorServiceItem) => void;
  onSaveOption: (e: React.FormEvent) => void;
  savingOption: boolean;
  onClose: () => void;
}

export const AdminCotizadorOptionModal: React.FC<AdminCotizadorOptionModalProps> = ({
  show,
  isCreating,
  editingOption,
  onOptionChange,
  onSaveOption,
  savingOption,
  onClose,
}) => {
  if (!show || !editingOption) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white font-display">
            {isCreating ? 'Añadir Nuevo Módulo al Cotizador' : 'Editar Módulo del Cotizador'}
          </h3>
          <button onClick={onClose} className="text-[#9a907c] hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
        <form onSubmit={onSaveOption} className="space-y-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Nombre del Servicio / Módulo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Infraestructura Cloud & DevOps"
              value={editingOption.name}
              onChange={(e) => onOptionChange({ ...editingOption, name: e.target.value })}
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Precio Base (COP)</label>
              <input
                type="number"
                required
                value={editingOption.basePrice}
                onChange={(e) =>
                  onOptionChange({
                    ...editingOption,
                    basePrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Categoría</label>
              <select
                value={editingOption.category}
                onChange={(e) =>
                  onOptionChange({ ...editingOption, category: e.target.value as any })
                }
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              >
                <option value="tecnologia">Tecnología</option>
                <option value="comunicacion">Comunicación</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Descripción corta</label>
            <textarea
              rows={2}
              required
              placeholder="Breve descripción de las tecnologías o alcance..."
              value={editingOption.description}
              onChange={(e) =>
                onOptionChange({ ...editingOption, description: e.target.value })
              }
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="opt_activo"
              checked={editingOption.activo !== false}
              onChange={(e) => onOptionChange({ ...editingOption, activo: e.target.checked })}
              className="accent-[#ffd56d] w-4 h-4 rounded cursor-pointer"
            />
            <label
              htmlFor="opt_activo"
              className="text-zinc-300 font-semibold cursor-pointer select-none text-xs"
            >
              Visible en el Cotizador (desmarcar para ocultar a los clientes)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingOption}
              className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold cursor-pointer disabled:opacity-50 hover:bg-[#ffdf97]"
            >
              {savingOption
                ? 'Guardando...'
                : isCreating
                ? 'Añadir Módulo'
                : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
