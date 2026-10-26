import React from 'react';
import { Pencil, X } from 'lucide-react';
import { Project, ProjectCategory } from '../../types';

interface AdminEditProjectModalProps {
  editingProject: Project | null;
  editProjectForm: {
    title: string;
    client: string;
    category: ProjectCategory;
    year: string;
    description: string;
    tags: string;
    imageUrl: string;
  };
  onFormChange: (form: any) => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AdminEditProjectModal: React.FC<AdminEditProjectModalProps> = ({
  editingProject,
  editProjectForm,
  onFormChange,
  onSaveEdit,
  onClose,
}) => {
  if (!editingProject) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[#ffd56d]" />
            <h3 className="text-lg font-bold text-white font-display">
              Editar Proyecto de Resultados
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Título del Proyecto</label>
              <input
                type="text"
                required
                value={editProjectForm.title}
                onChange={(e) => onFormChange({ ...editProjectForm, title: e.target.value })}
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Cliente / Marca</label>
              <input
                type="text"
                required
                value={editProjectForm.client}
                onChange={(e) => onFormChange({ ...editProjectForm, client: e.target.value })}
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
              <select
                value={editProjectForm.category}
                onChange={(e) =>
                  onFormChange({ ...editProjectForm, category: e.target.value as any })
                }
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              >
                <option value="tecnologia">Tecnología</option>
                <option value="comunicacion">Comunicación</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Año</label>
              <input
                type="text"
                value={editProjectForm.year}
                onChange={(e) => onFormChange({ ...editProjectForm, year: e.target.value })}
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Descripción del Logro</label>
            <textarea
              rows={3}
              required
              value={editProjectForm.description}
              onChange={(e) =>
                onFormChange({ ...editProjectForm, description: e.target.value })
              }
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                value={editProjectForm.tags}
                onChange={(e) => onFormChange({ ...editProjectForm, tags: e.target.value })}
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">URL de Imagen</label>
              <input
                type="text"
                value={editProjectForm.imageUrl}
                onChange={(e) => onFormChange({ ...editProjectForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
