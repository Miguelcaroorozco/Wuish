import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Testimonial } from '../types';

interface ContentContextType {
  testimonials: Testimonial[];
  approvedTestimonials: Testimonial[];
  projects: Project[];
  plans: any[];
  cart: { id: string; name: string; type: 'plan' | 'service'; price: number | string }[];
  addTestimonial: (data: Omit<Testimonial, 'id' | 'date' | 'status'>) => void;
  approveTestimonial: (id: string) => void;
  removeTestimonial: (id: string) => void;
  addProject: (data: Omit<Project, 'id'>) => void;
  removeProject: (id: string) => void;
  addPlan: (data: any) => void;
  removePlan: (id: string) => void;
  addToCart: (item: { id: string; name: string; type: 'plan' | 'service'; price: number | string }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const TESTIMONIALS_KEY = 'wuish_testimonios_v1';
const PROJECTS_KEY = 'wuish_proyectos_v1';
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => load(TESTIMONIALS_KEY));
  const [projects, setProjects] = useState<Project[]>(() => load(PROJECTS_KEY));
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
    localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addTestimonial: ContentContextType['addTestimonial'] = (data) => {
    setTestimonials((prev) => [
      { ...data, id: `tst-${Date.now()}`, date: new Date().toISOString(), status: 'pending' },
      ...prev,
    ]);
  };

  const approveTestimonial = (id: string) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const removeTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const addProject: ContentContextType['addProject'] = (data) => {
    setProjects((prev) => [{ ...data, id: `prj-${Date.now()}` }, ...prev]);
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
        approvedTestimonials: testimonials.filter((t) => t.status === 'approved'),
        projects,
        plans,
        cart,
        addTestimonial,
        approveTestimonial,
        removeTestimonial,
        addProject,
        removeProject,
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
