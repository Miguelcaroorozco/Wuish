import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

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

  const [optErrors, setOptErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!editingOption.name.trim()) errs.name = 'El nombre del módulo es obligatorio';
    if (!editingOption.description.trim()) errs.description = 'La descripción es obligatoria';
    if (!editingOption.basePrice && editingOption.basePrice !== 0) errs.basePrice = 'Ingresa un precio base';
    if (Object.keys(errs).length > 0) { setOptErrors(errs); return; }
    setOptErrors({});
    onSaveOption(e);
  };

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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Nombre del Servicio / Módulo
            </label>
            <input
              type="text"
              placeholder="Ej: Infraestructura Cloud & DevOps"
              value={editingOption.name}
              onChange={(e) => { onOptionChange({ ...editingOption, name: e.target.value }); if (optErrors.name) setOptErrors((p) => ({ ...p, name: undefined as any })); }}
              className={`w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border focus:outline-none transition ${optErrors.name ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]'}`}
            />
            {optErrors.name && <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 shrink-0" />{optErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Precio Base (COP)</label>
              <input
                type="number"
                value={editingOption.basePrice}
                onChange={(e) => { onOptionChange({ ...editingOption, basePrice: parseFloat(e.target.value) || 0 }); if (optErrors.basePrice) setOptErrors((p) => ({ ...p, basePrice: undefined as any })); }}
                className={`w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border focus:outline-none transition ${optErrors.basePrice ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]'}`}
              />
              {optErrors.basePrice && <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 shrink-0" />{optErrors.basePrice}</p>}
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
              placeholder="Breve descripción de las tecnologías o alcance..."
              value={editingOption.description}
              onChange={(e) => { onOptionChange({ ...editingOption, description: e.target.value }); if (optErrors.description) setOptErrors((p) => ({ ...p, description: undefined as any })); }}
              className={`w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border focus:outline-none transition ${optErrors.description ? 'border-red-500/70' : 'border-white/10 focus:border-[#ffd56d]'}`}
            />
            {optErrors.description && <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 shrink-0" />{optErrors.description}</p>}
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
