import React, { useState } from 'react';
import { solicitudesApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface NuevaSolicitudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSol: any) => void;
}

export const NuevaSolicitudModal: React.FC<NuevaSolicitudModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('cotizacion');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const newSol = await solicitudesApi.create({
        tipo: type,
        descripcion: `${title.trim()}${desc.trim() ? ' — ' + desc.trim() : ''}`,
      });
      onSuccess(newSol);
      setTitle('');
      setDesc('');
      setType('cotizacion');
      onClose();
      showToast('Solicitud Creada', 'Tu solicitud ha sido registrada exitosamente.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear la solicitud', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-lg font-bold text-white font-display">
            Nueva Solicitud Estratégica
          </h3>
          <button
            onClick={onClose}
            className="text-[#9a907c] hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
              Título del Requerimiento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título o nombre del requerimiento..."
              className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
              Tipo de Solicitud *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            >
              <option value="cotizacion">Cotización</option>
              <option value="soporte">Soporte Técnico</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="consultoria">Consultoría</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
              Alcance y Especificaciones Técnicas
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe la necesidad técnica o metas del negocio..."
              className="w-full bg-[#0e0e10] text-[#e5e1e4] p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Registrar Requerimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
