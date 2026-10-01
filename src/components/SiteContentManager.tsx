import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Check, Trash2, Plus, MessageSquare, FolderKanban } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import { ProjectCategory } from '../types';

type Tab = 'comentarios' | 'proyectos';

const isHttpUrl = (value: string) => !value || /^https?:\/\//i.test(value);

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-white/10 focus:border-[#ffd56d]/50 outline-none text-xs text-white placeholder:text-[#9a907c]';

export const SiteContentManager: React.FC = () => {
  const { testimonials, approveTestimonial, removeTestimonial, projects, addProject, removeProject } = useContent();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('comentarios');

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('tecnologia');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');

  const pending = testimonials.filter((t) => t.status === 'pending').length;

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) {
      showToast('Faltan datos', 'El proyecto necesita título y cliente.', 'error');
      return;
    }
    if (!isHttpUrl(imageUrl.trim()) || !isHttpUrl(link.trim())) {
      showToast('URL inválida', 'La imagen y el enlace deben empezar con http:// o https://', 'error');
      return;
    }
    addProject({
      title: title.trim(),
      client: client.trim(),
      category,
      year: year.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      link: link.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    showToast('Proyecto publicado', `"${title.trim()}" ya aparece en el inicio.`, 'success');
    setTitle('');
    setClient('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setTags('');
  };

  return (
    <div className="p-5 sm:p-7 min-w-0 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Contenido del sitio</h3>
          <p className="text-xs text-[#9a907c] mt-0.5">Comentarios de clientes y portafolio del inicio.</p>
        </div>
        <div className="flex sm:inline-flex p-1 rounded-xl bg-[#0e0e10] border border-white/5 text-xs font-semibold">
          {([
            { id: 'comentarios', label: 'Comentarios', icon: MessageSquare, badge: pending },
            { id: 'proyectos', label: 'Proyectos', icon: FolderKanban, badge: 0 },
          ] as const).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${tab === id ? 'text-[#3e2e00]' : 'text-[#d1c5af] hover:text-white'}`}
            >
              {tab === id && <motion.span layoutId="content-tab" className="absolute inset-0 rounded-lg bg-[#ffd56d]" />}
              <Icon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{label}</span>
              {badge > 0 && (
                <span className="relative z-10 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'comentarios' ? (
          <motion.div key="comentarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {testimonials.length === 0 && <p className="text-xs text-[#9a907c] py-6 text-center">Aún no hay comentarios.</p>}
            <AnimatePresence initial={false}>
              {testimonials.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{t.name}</span>
                        {t.company && <span className="text-[11px] text-[#9a907c]">{t.company}</span>}
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-3 h-3 ${n <= t.rating ? 'fill-[#ffd56d] text-[#ffd56d]' : 'text-white/15'}`} />
                          ))}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {t.status === 'approved' ? 'Publicado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-[#d1c5af] mt-1.5">“{t.text}”</p>
                    </div>
                    <div className="flex justify-end gap-2 shrink-0">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => {
                            approveTestimonial(t.id);
                            showToast('Comentario publicado', 'Ya aparece en el inicio.', 'success');
                          }}
                          className="px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Aprobar
                        </button>
                      )}
                      <button
                        onClick={() => removeTestimonial(t.id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        aria-label="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="proyectos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-5 gap-6">
            <form onSubmit={handleAddProject} className="lg:col-span-2 space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del proyecto *" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente *" className={inputClass} />
                <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Año" className={inputClass} />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)} className={inputClass}>
                <option value="tecnologia">Tecnología</option>
                <option value="comunicacion">Comunicación</option>
              </select>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descripción breve" className={`${inputClass} resize-none`} />
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL de imagen (https://...)" className={inputClass} />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Enlace al proyecto (opcional)" className={inputClass} />
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Etiquetas separadas por coma" className={inputClass} />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" /> Agregar proyecto
              </button>
            </form>

            <div className="lg:col-span-3 space-y-2.5">
              {projects.length === 0 && <p className="text-xs text-[#9a907c] py-6 text-center">Aún no hay proyectos publicados.</p>}
              <AnimatePresence initial={false}>
                {projects.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 rounded-xl bg-[#201f21] border border-white/5 flex items-center gap-3"
                  >
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#0e0e10] shrink-0">
                      {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-[#9a907c]">
                        {p.client} · {p.year} · {p.category === 'tecnologia' ? 'Tecnología' : 'Comunicación'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeProject(p.id);
                        showToast('Proyecto eliminado', `"${p.title}" ya no aparece en el inicio.`, 'info');
                      }}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      aria-label="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
