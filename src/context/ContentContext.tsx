import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Testimonial, StatItem } from '../types';
import { comentariosApi, proyectosApi, metricasApi } from '../lib/api';

const DEFAULT_TESTIMONIALS: Testimonial[] = [];
const DEFAULT_PROJECTS: Project[] = [];
const DEFAULT_STATS: StatItem[] = [];

interface ContentContextType {
  testimonials: Testimonial[];
  approvedTestimonials: Testimonial[];
  projects: Project[];
  stats: StatItem[];
  plans: any[];
  cart: { id: string; name: string; type: 'plan' | 'service'; price: number | string }[];
  addTestimonial: (data: Omit<Testimonial, 'id' | 'date' | 'status' | 'userId'> & { userId?: string }) => void;
  approveTestimonial: (id: string) => void;
  removeTestimonial: (id: string) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  refreshTestimonials: () => Promise<void>;
  addProject: (data: Omit<Project, 'id'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addStat: (data: Omit<StatItem, 'id'>) => void;
  updateStat: (id: string, data: Partial<StatItem>) => void;
  removeStat: (id: string) => void;
  addPlan: (data: any) => void;
  removePlan: (id: string) => void;
  addToCart: (item: { id: string; name: string; type: 'plan' | 'service'; price: number | string }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const TESTIMONIALS_KEY = 'wuish_testimonios_v4';
const PROJECTS_KEY = 'wuish_proyectos_v3';
const STATS_KEY = 'wuish_stats_v2';
const PLANS_KEY = 'wuish_planes_v2';
const CART_KEY = 'wuish_cart_v1';

const load = <T,>(key: string): T[] => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = load<Project>(PROJECTS_KEY);
    return (saved || []).filter((p) => !p.id.startsWith('prj-'));
  });

  const [stats, setStats] = useState<StatItem[]>(() => {
    const saved = load<StatItem>(STATS_KEY);
    return (saved || []).filter((s) => !s.id.startsWith('stat-'));
  });

  const [plans, setPlans] = useState<any[]>(() => {
    return load<any>(PLANS_KEY);
  });

  const [cart, setCart] = useState<{ id: string; name: string; type: 'plan' | 'service'; price: number | string }[]>(() => load(CART_KEY));

  const refreshTestimonials = async () => {
    try {
      const apiComments = await comentariosApi.getPublicos();
      if (Array.isArray(apiComments)) {
        const mapped: Testimonial[] = apiComments.map((c) => ({
          id: c.id,
          userId: c.usuario_id || '',
          name: c.nombre_autor || (c.usuario ? `${c.usuario.nombres} ${c.usuario.apellidos}`.trim() : 'Cliente Wuish'),
          company: c.empresa_autor || c.usuario?.empresa || 'Empresa Aliada',
          rating: c.calificacion || 5,
          text: c.contenido,
          date: c.created_at || c.fecha_creacion || new Date().toISOString(),
          status: 'approved',
        }));
        setTestimonials(mapped);
      } else {
        setTestimonials([]);
      }
    } catch {
      setTestimonials([]);
    }
  };

  useEffect(() => {
    // 1. Testimonios públicos desde PostgreSQL
    refreshTestimonials();

    // 2. Proyectos del portafolio desde PostgreSQL
    proyectosApi.getAll(true).then((apiProjects) => {
      if (Array.isArray(apiProjects)) {
        const mapped: Project[] = apiProjects.map((p) => ({
          id: p.id,
          title: p.titulo,
          client: p.cliente || 'Wuish Client',
          category: (p.categoria === 'comunicacion' ? 'comunicacion' : 'tecnologia') as any,
          year: p.anio || '2026',
          description: p.descripcion || '',
          imageUrl: p.imagen_url || undefined,
          tags: Array.isArray(p.tags) ? p.tags : [],
          activo: p.activo !== false,
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    }).catch(() => {
      setProjects([]);
    });

    // 3. Métricas clave desde PostgreSQL
    metricasApi.getAll().then((apiMetricas) => {
      if (Array.isArray(apiMetricas)) {
        const mapped: StatItem[] = apiMetricas.map((m) => ({
          id: m.id,
          value: m.valor,
          suffix: m.sufijo || '+',
          label: m.etiqueta,
        }));
        setStats(mapped);
      } else {
        setStats([]);
      }
    }).catch(() => {
      setStats([]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addTestimonial: ContentContextType['addTestimonial'] = (data) => {
    setTestimonials((prev) => [
      { ...data, userId: data.userId ?? '', id: `tst-${Date.now()}`, date: new Date().toISOString(), status: 'approved' },
      ...prev,
    ]);
    comentariosApi.create({ contenido: data.text, calificacion: data.rating }).catch(() => {});
  };

  const approveTestimonial = (id: string) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const removeTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTestimonial = (id: string, data: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...data, status: 'approved' } : t)));
  };

  const addProject: ContentContextType['addProject'] = (data) => {
    const projectWithActivo = { ...data, activo: data.activo !== false };
    proyectosApi.create({
      titulo: data.title,
      cliente: data.client,
      categoria: data.category,
      anio: data.year,
      descripcion: data.description,
      imagen_url: data.imageUrl,
      tags: data.tags,
      activo: true,
    }).then((created) => {
      setProjects((prev) => [{ ...projectWithActivo, id: created.id }, ...prev]);
    }).catch(() => {
      setProjects((prev) => [{ ...projectWithActivo, id: `prj-${Date.now()}` }, ...prev]);
    });
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    const apiPayload: any = {};
    if (data.title !== undefined) apiPayload.titulo = data.title;
    if (data.client !== undefined) apiPayload.cliente = data.client;
    if (data.category !== undefined) apiPayload.categoria = data.category;
    if (data.year !== undefined) apiPayload.anio = data.year;
    if (data.description !== undefined) apiPayload.descripcion = data.description;
    if (data.imageUrl !== undefined) apiPayload.imagen_url = data.imageUrl;
    if (data.tags !== undefined) apiPayload.tags = data.tags;
    if (data.activo !== undefined) apiPayload.activo = data.activo;

    proyectosApi.update(id, apiPayload).catch(() => {});
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const removeProject = (id: string) => {
    proyectosApi.delete(id).catch(() => {});
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addStat = (data: Omit<StatItem, 'id'>) => {
    setStats((prev) => [...prev, { ...data, id: `stat-${Date.now()}` }]);
  };

  const updateStat = (id: string, data: Partial<StatItem>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const removeStat = (id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));
  };

  const addPlan = (data: any) => {
    setPlans((prev) => [...prev, { ...data, id: `plan-${Date.now()}` }]);
  };

  const removePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const addToCart = (item: { id: string; name: string; type: 'plan' | 'service'; price: number | string }) => {
    setCart((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <ContentContext.Provider
      value={{
        testimonials,
        approvedTestimonials: testimonials.filter((t) => t.status !== 'hidden'),
        projects,
        stats,
        plans,
        cart,
        addTestimonial,
        approveTestimonial,
        removeTestimonial,
        updateTestimonial,
        refreshTestimonials,
        addProject,
        updateProject,
        removeProject,
        addStat,
        updateStat,
        removeStat,
        addPlan,
        removePlan,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
