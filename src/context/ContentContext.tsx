import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Testimonial, StatItem } from '../types';
import { comentariosApi } from '../lib/api';

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'tst-1',
    userId: 'usr-corp-1',
    name: 'Alejandro Morales',
    company: 'Grupo Nexo Capital · CEO',
    rating: 5,
    text: 'WUISH reestructuró por completo nuestra infraestructura digital y la narrativa de marca. Redujimos tiempos de respuesta en un 40% y el impacto ante nuestros inversores fue inmediato.',
    date: '2026-08-14T10:00:00.000Z',
    status: 'approved',
  },
  {
    id: 'tst-2',
    userId: 'usr-corp-2',
    name: 'Valeria Restrepo',
    company: 'Andina Logistics · VP de Operaciones',
    rating: 5,
    text: 'La implementación de la plataforma a medida y las automatizaciones con IA revolucionaron nuestra operación diaria. La dedicación técnica y el acompañamiento estratégico son de primer nivel.',
    date: '2026-08-28T14:30:00.000Z',
    status: 'approved',
  },
  {
    id: 'tst-3',
    userId: 'usr-corp-3',
    name: 'Santiago Benítez',
    company: 'Fintech Aurora · Chief Technology Officer',
    rating: 5,
    text: 'Excelente nivel de ingeniería y estándares de seguridad corporativa. Cumplieron cada hito de entrega y construyeron una arquitectura sólida, escalable y sin fisuras.',
    date: '2026-09-10T16:15:00.000Z',
    status: 'approved',
  },
  {
    id: 'tst-4',
    userId: 'usr-corp-4',
    name: 'Camila Delgado',
    company: 'Krea Brands · Directora Creativa',
    rating: 5,
    text: 'Unificar producción audiovisual 4K y desarrollo tecnológico en un solo socio estratégico nos otorgó una ventaja competitiva decisiva en el mercado internacional.',
    date: '2026-09-21T09:45:00.000Z',
    status: 'approved',
  },
  {
    id: 'tst-5',
    userId: 'usr-corp-5',
    name: 'Mauricio Gómez',
    company: 'Vanguard Retail · Director Comercial',
    rating: 5,
    text: 'El portal corporativo y los tableros analíticos en tiempo real nos permitieron triplicar la tasa de conversión en nuestro canal B2B durante el último trimestre.',
    date: '2026-09-25T11:20:00.000Z',
    status: 'approved',
  },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    title: 'Ecosistema Transaccional & Core Digital',
    client: 'Nexo Capital',
    category: 'tecnologia',
    year: '2026',
    description: 'Arquitectura escalable en microservicios, portal de clientes con encriptación bancaria y liquidación de operaciones en tiempo real.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Cloud'],
  },
  {
    id: 'prj-2',
    title: 'Campaña Global de Rebranding & Video 4K',
    client: 'Krea Brands',
    category: 'comunicacion',
    year: '2026',
    description: 'Producción audiovisual cinematográfica, manual de identidad corporativa y estrategia de pauta omnicanal de alto impacto.',
    tags: ['Video 4K', 'Branding', 'Estrategia', 'Pauta'],
  },
  {
    id: 'prj-3',
    title: 'Automatización Logística & ERP Cloud',
    client: 'Andina Logistics',
    category: 'tecnologia',
    year: '2025',
    description: 'Sistema ERP a medida para tracking de flotas en tiempo real, integración aduanera y automatizaciones operativas con IA.',
    tags: ['ERP', 'IA', 'Dashboards BI', 'APIs'],
  },
  {
    id: 'prj-4',
    title: 'Estrategia de Comunicación Institucional & PR',
    client: 'Fintech Aurora',
    category: 'comunicacion',
    year: '2025',
    description: 'Diseño de comunicaciones corporativas para ronda de inversión Serie A, relaciones públicas e informes ejecutivos de sostenibilidad.',
    tags: ['PR', 'Narrativa', 'Media Relations', 'Keynotes'],
  },
];

const DEFAULT_STATS: StatItem[] = [
  { id: 'stat-1', value: 120, suffix: '+', label: 'Proyectos' },
  { id: 'stat-2', value: 98, suffix: '%', label: 'Retención' },
  { id: 'stat-3', value: 3, suffix: 'x', label: 'ROI promedio' },
  { id: 'stat-4', value: 72, suffix: 'h', label: 'Kickoff' },
];

interface ContentContextType {
  testimonials: Testimonial[];
  approvedTestimonials: Testimonial[];
  projects: Project[];
  stats: StatItem[];
  plans: any[];
  cart: { id: string; name: string; type: 'plan' | 'service'; price: number | string }[];
  addTestimonial: (data: Omit<Testimonial, 'id' | 'date' | 'status'>) => void;
  approveTestimonial: (id: string) => void;
  removeTestimonial: (id: string) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
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

const TESTIMONIALS_KEY = 'wuish_testimonios_v3';
const PROJECTS_KEY = 'wuish_proyectos_v2';
const STATS_KEY = 'wuish_stats_v2';
const PLANS_KEY = 'wuish_planes_v1';
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = load<Testimonial>(TESTIMONIALS_KEY);
    const defaultIds = new Set(DEFAULT_TESTIMONIALS.map((d) => d.id));
    const userReviews = (saved || []).filter((s) => !defaultIds.has(s.id));
    // Normalize user reviews so they are visible
    const normalizedUserReviews = userReviews.map((r) => ({ ...r, status: 'approved' as const }));
    return [...DEFAULT_TESTIMONIALS, ...normalizedUserReviews];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = load<Project>(PROJECTS_KEY);
    const defaultIds = new Set(DEFAULT_PROJECTS.map((d) => d.id));
    const userProjects = (saved || []).filter((s) => !defaultIds.has(s.id));
    return [...DEFAULT_PROJECTS, ...userProjects];
  });

  const [stats, setStats] = useState<StatItem[]>(() => {
    const saved = load<StatItem>(STATS_KEY);
    return saved && saved.length > 0 ? saved : DEFAULT_STATS;
  });

  const [plans, setPlans] = useState<any[]>(() => {
    const saved = load<any>(PLANS_KEY);
    return saved.length > 0 ? saved : [
      { id: 'crecimiento', name: 'Crecimiento Digital', badge: 'Marca & pauta', price: '1850', highlight: false, features: ['Estrategia de comunicación', 'Pauta Meta & Google Ads', '4 videos al mes', 'Reporte mensual de ROAS'] },
      { id: 'digitalizacion', name: 'Digitalización Operativa', badge: 'Sistemas', price: '2900', highlight: false, features: ['Web headless de alta velocidad', 'CRM o ERP a medida', 'Automatizaciones con IA', 'Soporte prioritario 12h'] },
      { id: 'optimizacion', name: 'Optimización & Escala', badge: 'Full suite', price: '4200', highlight: true, features: ['Todo lo anterior', 'Video 4K & motion graphics', 'App móvil o portal de clientes', 'Dashboard BI en tiempo real', 'SLA crítico < 2h'] },
      { id: 'transformacion', name: 'Transformación Integral', badge: 'Enterprise', price: null, highlight: false, features: ['Arquitectura multi-país', 'Equipo dedicado in-house', 'Cloud privada GCP/AWS', 'SLA 24/7'] },
    ];
  });

  const [cart, setCart] = useState<{ id: string; name: string; type: 'plan' | 'service'; price: number | string }[]>(() => load(CART_KEY));

  useEffect(() => {
    comentariosApi.getPublicos()
      .then((apiComments) => {
        if (Array.isArray(apiComments) && apiComments.length > 0) {
          const mapped: Testimonial[] = apiComments.map((c) => ({
            id: c.id,
            userId: c.usuario_id || '',
            name: c.usuario ? `${c.usuario.nombres} ${c.usuario.apellidos}`.trim() : 'Cliente Wuish',
            company: c.usuario?.empresa || 'Empresa Aliada',
            rating: c.calificacion || 5,
            text: c.contenido,
            date: c.fecha_creacion || new Date().toISOString(),
            status: 'approved',
          }));
          setTestimonials((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newFromApi = mapped.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newFromApi];
          });
        }
      })
      .catch(() => {});
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
      { ...data, id: `tst-${Date.now()}`, date: new Date().toISOString(), status: 'approved' },
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
    setProjects((prev) => [{ ...data, id: `prj-${Date.now()}` }, ...prev]);
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const removeProject = (id: string) => {
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
