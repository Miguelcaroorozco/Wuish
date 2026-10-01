import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Network, ArrowUpRight, X, FolderOpen } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Project, ProjectCategory } from '../types';
import { Carousel } from './Carousel';

const EASE = [0.22, 1, 0.36, 1] as const;

type Filter = 'todos' | ProjectCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'comunicacion', label: 'Comunicación' },
  { id: 'tecnologia', label: 'Tecnología' },
];

const CATEGORY_ICON = { comunicacion: Megaphone, tecnologia: Network };

const ProjectCover: React.FC<{ project: Project; className?: string }> = ({ project, className = '' }) => {
  const Icon = CATEGORY_ICON[project.category];
  return project.imageUrl ? (
    <img src={project.imageUrl} alt={project.title} draggable={false} className={`w-full h-full object-cover ${className}`} />
  ) : (
    <div className={`w-full h-full bg-gradient-to-br from-[#2a2412] via-[#1c1b1d] to-[#131315] flex items-center justify-center ${className}`}>
      <Icon className="w-12 h-12 text-[#ffd56d]/40" />
    </div>
  );
};

export const PortfolioSection: React.FC = () => {
  const { projects } = useContent();
  const [filter, setFilter] = useState<Filter>('todos');
  const [selected, setSelected] = useState<Project | null>(null);

  const visible = filter === 'todos' ? projects : projects.filter((p) => p.category === filter);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (projects.length === 0) {
    return (
      <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center">
        <FolderOpen className="w-10 h-10 text-[#ffd56d]/50 mx-auto" />
        <p className="text-sm text-[#9a907c] mt-3">Muy pronto verás aquí nuestros proyectos.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex p-1 rounded-xl bg-[#1c1b1d] border border-white/5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${filter === f.id ? 'text-[#3e2e00]' : 'text-[#d1c5af] hover:text-white'}`}
            >
              {filter === f.id && <motion.span layoutId="portfolio-filter" className="absolute inset-0 rounded-lg bg-[#ffd56d]" />}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <Carousel<Project>
            items={visible}
            getKey={(p) => p.id}
            perView={{ base: 1, sm: 2, lg: 3 }}
            gap={20}
            ariaLabel="Proyectos"
            renderItem={(p) => (
              <motion.button
                layoutId={`project-${p.id}`}
                onClick={() => setSelected(p)}
                className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 text-left cursor-pointer"
              >
                <motion.div layoutId={`project-cover-${p.id}`} className="absolute inset-0">
                  <ProjectCover project={p} className="group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d]">
                    {p.client} · {p.year}
                  </span>
                  <h3 className="text-lg font-bold text-white font-display mt-1 flex items-center gap-2">
                    {p.title}
                    <ArrowUpRight className="w-4 h-4 text-[#ffd56d] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-20 opacity-100 [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300">
                    {p.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.button>
            )}
          />
        </motion.div>
      </AnimatePresence>

      {/* Detalle del proyecto */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              layoutId={`project-${selected.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[92svh] overflow-y-auto rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl"
            >
              <motion.div layoutId={`project-cover-${selected.id}`} className="relative aspect-video">
                <ProjectCover project={selected} />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                className="p-6 sm:p-7"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d]">
                  {selected.client} · {selected.year}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display mt-1">{selected.title}</h3>
                {selected.description && <p className="text-sm text-[#d1c5af] mt-3 leading-relaxed">{selected.description}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {selected.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-[#201f21] border border-white/5 text-[11px] text-[#d1c5af]">{t}</span>
                  ))}
                  {selected.link && /^https?:\/\//i.test(selected.link) && (
                    <a
                      href={selected.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 justify-center inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] text-xs font-bold hover:bg-[#ffdf97]"
                    >
                      Ver proyecto <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
