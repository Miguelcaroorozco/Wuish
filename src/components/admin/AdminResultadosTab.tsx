import React from 'react';
import { Briefcase, Plus, Eye, EyeOff, Trash2, Pencil, BarChart3 } from 'lucide-react';
import { Project, StatItem, ProjectCategory } from '../../types';
import { AdminPagination } from './AdminPagination';

interface AdminResultadosTabProps {
  projects: Project[];
  resultadosPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  newProject: {
    title: string;
    client: string;
    category: ProjectCategory;
    year: string;
    description: string;
    tags: string;
    imageUrl: string;
  };
  onNewProjectChange: (proj: any) => void;
  onCreateProject: (e: React.FormEvent) => void;
  onEditProject: (project: Project) => void;
  onToggleProjectVisibility: (id: string, current: boolean) => void;
  onDeleteProject: (id: string, title: string) => void;
  stats: StatItem[];
  newStatItem: { value: string; suffix: string; label: string };
  onNewStatChange: (stat: any) => void;
  onCreateStat: (e: React.FormEvent) => void;
  onDeleteStat: (id: string, label: string) => void;
}

export const AdminResultadosTab: React.FC<AdminResultadosTabProps> = ({
  projects,
  resultadosPage,
  itemsPerPage,
  onPageChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
  onEditProject,
  onToggleProjectVisibility,
  onDeleteProject,
  stats,
  newStatItem,
  onNewStatChange,
  onCreateStat,
  onDeleteStat,
}) => {
  const paginatedProjects = projects.slice(
    (resultadosPage - 1) * itemsPerPage,
    resultadosPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#ffd56d]" />
              <h3 className="text-lg font-bold text-white font-display">
                Portafolio: "Proyectos en los que participamos"
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd56d]/15 text-[#ffd56d]">
                {projects.length} en el inicio
              </span>
            </div>
            <p className="text-xs text-[#9a907c] mt-1">
              Administra los casos de éxito y proyectos que se exhiben en el carrusel de la página de inicio.
            </p>
          </div>
        </div>

        <form
          onSubmit={onCreateProject}
          className="p-4 rounded-xl bg-[#171618] border border-white/5 space-y-3 text-xs"
        >
          <span className="font-bold text-white uppercase tracking-wider block text-[11px]">
            + Agregar Nuevo Proyecto al Inicio
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Título del Proyecto</label>
              <input
                type="text"
                required
                value={newProject.title}
                onChange={(e) => onNewProjectChange({ ...newProject, title: e.target.value })}
                placeholder="Ej: Ecosistema Transaccional & Core"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Cliente / Marca</label>
              <input
                type="text"
                required
                value={newProject.client}
                onChange={(e) => onNewProjectChange({ ...newProject, client: e.target.value })}
                placeholder="Ej: Nexo Capital"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
              <select
                value={newProject.category}
                onChange={(e) =>
                  onNewProjectChange({ ...newProject, category: e.target.value as any })
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
                value={newProject.year}
                onChange={(e) => onNewProjectChange({ ...newProject, year: e.target.value })}
                placeholder="2026"
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Descripción del Logro</label>
              <input
                type="text"
                required
                value={newProject.description}
                onChange={(e) => onNewProjectChange({ ...newProject, description: e.target.value })}
                placeholder="Arquitectura en la nube y optimización..."
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Etiquetas (separadas por coma)</label>
              <input
                type="text"
                value={newProject.tags}
                onChange={(e) => onNewProjectChange({ ...newProject, tags: e.target.value })}
                placeholder="Next.js, AWS, ERP..."
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">URL de Imagen (Opcional)</label>
              <input
                type="text"
                value={newProject.imageUrl}
                onChange={(e) => onNewProjectChange({ ...newProject, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold flex items-center gap-1.5 cursor-pointer shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Proyecto</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {paginatedProjects.map((p) => {
            const isVisible = p.activo !== false;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs transition ${
                  isVisible
                    ? 'bg-[#201f21] border-white/5 hover:border-[#ffd56d]/30'
                    : 'bg-[#181719] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#2a292c] border border-white/10 flex items-center justify-center shrink-0 text-[#ffd56d]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{p.title}</span>
                      <span className="text-[10px] text-[#ffd56d] bg-[#ffd56d]/10 px-2 py-0.5 rounded font-mono">
                        {p.client} ({p.year})
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9a907c] truncate mt-0.5">{p.description}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {(p.tags || []).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleProjectVisibility(p.id, isVisible)}
                    className={`p-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 ${
                      isVisible
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                    title={isVisible ? 'Visible en Inicio' : 'Oculto'}
                  >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-[10px] font-semibold">
                      {isVisible ? 'Visible' : 'Oculto'}
                    </span>
                  </button>
                  <button
                    onClick={() => onEditProject(p)}
                    className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer transition"
                    title="Editar proyecto"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(p.id, p.title)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <AdminPagination
          currentPage={resultadosPage}
          totalItems={projects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          itemName="proyectos"
        />
      </div>

      <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <BarChart3 className="w-5 h-5 text-[#ffd56d]" />
          <h3 className="text-lg font-bold text-white font-display">
            Métricas de Impacto de la Portada
          </h3>
        </div>

        <form onSubmit={onCreateStat} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="number"
            step="any"
            required
            value={newStatItem.value}
            onChange={(e) => onNewStatChange({ ...newStatItem, value: e.target.value })}
            placeholder="Valor numérico (ej: 120)"
            className="bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
          />
          <input
            type="text"
            value={newStatItem.suffix}
            onChange={(e) => onNewStatChange({ ...newStatItem, suffix: e.target.value })}
            placeholder="Sufijo (ej: +, %, x, h)"
            className="bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
          />
          <input
            type="text"
            required
            value={newStatItem.label}
            onChange={(e) => onNewStatChange({ ...newStatItem, label: e.target.value })}
            placeholder="Etiqueta (ej: Clientes Satisfechos)"
            className="bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
          />
          <button
            type="submit"
            className="py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Métrica</span>
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {stats.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-xl font-black text-white font-display">
                  {s.value}
                  {s.suffix}
                </span>
                <span className="text-[11px] text-[#9a907c] block uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              <button
                onClick={() => onDeleteStat(s.id, s.label)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                title="Eliminar métrica"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
