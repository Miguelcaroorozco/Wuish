import React from 'react';
import { Plus, Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { AdminPagination } from './AdminPagination';

interface AdminComentariosTabProps {
  comentarios: any[];
  allComentarios: any[];
  testimoniosPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showNewTestimonialForm: boolean;
  onToggleNewForm: () => void;
  newTestimonial: { name: string; company: string; rating: number; text: string };
  onNewTestimonialChange: (t: any) => void;
  onCreateTestimonial: (e: React.FormEvent) => void;
  onToggleComentario: (id: string, current: boolean) => void;
  onDeleteComentario: (id: string) => void;
}

export const AdminComentariosTab: React.FC<AdminComentariosTabProps> = ({
  allComentarios,
  testimoniosPage,
  itemsPerPage,
  onPageChange,
  showNewTestimonialForm,
  onToggleNewForm,
  newTestimonial,
  onNewTestimonialChange,
  onCreateTestimonial,
  onToggleComentario,
  onDeleteComentario,
}) => {
  const paginatedComentarios = allComentarios.slice(
    (testimoniosPage - 1) * itemsPerPage,
    testimoniosPage * itemsPerPage
  );

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Testimonios de Clientes</h3>
          <p className="text-xs text-[#9a907c]">
            Modera qué testimonios se publican en el carrusel de la página de inicio o agrega nuevas reseñas de clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] text-xs font-bold">
            {allComentarios.length} Registrados
          </span>
          <button
            type="button"
            onClick={onToggleNewForm}
            className="px-3.5 py-1.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showNewTestimonialForm ? 'Cerrar Formulario' : 'Nuevo Testimonio'}</span>
          </button>
        </div>
      </div>

      {showNewTestimonialForm && (
        <form
          onSubmit={onCreateTestimonial}
          className="p-4 rounded-xl bg-[#201f21] border border-[#ffd56d]/30 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase tracking-wider text-[#ffd56d]">
              Nuevo Testimonio Corporativo
            </span>
            <button
              type="button"
              onClick={onToggleNewForm}
              className="text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Nombre del Cliente / Representante
              </label>
              <input
                type="text"
                required
                value={newTestimonial.name}
                onChange={(e) =>
                  onNewTestimonialChange({ ...newTestimonial, name: e.target.value })
                }
                placeholder="Ej: Mariana Silva"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Empresa o Cargo</label>
              <input
                type="text"
                value={newTestimonial.company}
                onChange={(e) =>
                  onNewTestimonialChange({ ...newTestimonial, company: e.target.value })
                }
                placeholder="Ej: Directora de Operaciones, NovaPay"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Calificación (Estrellas)
              </label>
              <select
                value={newTestimonial.rating}
                onChange={(e) =>
                  onNewTestimonialChange({
                    ...newTestimonial,
                    rating: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
                <option value={2}>⭐⭐ (2 Estrellas)</option>
                <option value={1}>⭐ (1 Estrella)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Contenido de la Reseña</label>
            <textarea
              required
              rows={2}
              value={newTestimonial.text}
              onChange={(e) =>
                onNewTestimonialChange({ ...newTestimonial, text: e.target.value })
              }
              placeholder="Describe la experiencia de trabajo con Wuish y los resultados obtenidos..."
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onToggleNewForm}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold cursor-pointer"
            >
              Guardar y Publicar en Inicio
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {paginatedComentarios.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex items-start justify-between gap-4 text-xs group hover:border-[#ffd56d]/20 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">
                  {c.usuario?.nombres || 'Cliente Wuish'}
                </span>
                {c.usuario?.empresa && (
                  <span className="text-[10px] text-[#9a907c]">({c.usuario.empresa})</span>
                )}
                <span className="flex items-center text-[#ffd56d] gap-0.5 ml-2">
                  <Star className="w-3 h-3 fill-current" />
                  {c.calificacion || 5}
                </span>
              </div>
              <p className="text-[#d1c5af]">{c.contenido}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleComentario(c.id, c.mostrar_en_pagina)}
                className={`p-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 ${
                  c.mostrar_en_pagina
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-zinc-500 hover:text-white'
                }`}
                title={c.mostrar_en_pagina ? 'Visible en Inicio' : 'Oculto'}
              >
                {c.mostrar_en_pagina ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-[10px] font-semibold">
                  {c.mostrar_en_pagina ? 'Visible' : 'Oculto'}
                </span>
              </button>
              <button
                onClick={() => onDeleteComentario(c.id)}
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                title="Eliminar testimonio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminPagination
        currentPage={testimoniosPage}
        totalItems={allComentarios.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="testimonios"
      />
    </div>
  );
};
