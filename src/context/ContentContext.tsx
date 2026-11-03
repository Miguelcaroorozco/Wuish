import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Testimonial, StatItem } from '../types';
import { comentariosApi, proyectosApi, metricasApi } from '../lib/api';

interface ContentContextType {
  testimonials: Testimonial[];
  approvedTestimonials: Testimonial[];
  projects: Project[];
  stats: StatItem[];
  addTestimonial: (data: Omit<Testimonial, 'id' | 'date' | 'status' | 'userId'> & { userId?: string }) => Promise<Testimonial>;
  refreshTestimonials: () => Promise<void>;
  addProject: (data: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addStat: (data: Omit<StatItem, 'id'>) => Promise<void>;
  updateStat: (id: string, data: Partial<StatItem>) => Promise<void>;
  removeStat: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    ['wuish_testimonios_v4', 'wuish_proyectos_v3', 'wuish_stats_v2', 'wuish_planes_v2', 'wuish_cart_v1']
      .forEach((key) => localStorage.removeItem(key));
  }, []);

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
          status: c.mostrar_en_pagina ? 'approved' : 'pending',
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

  const addTestimonial: ContentContextType['addTestimonial'] = async (data) => {
    const created = await comentariosApi.create({
      contenido: data.text,
      calificacion: data.rating,
      nombre_autor: data.name,
      empresa_autor: data.company,
      usuario_id: data.userId,
    });
    setTestimonials((prev) => [{
      id: created.id,
      userId: created.usuario_id || data.userId || '',
      name: created.nombre_autor || data.name,
      company: created.empresa_autor || data.company,
      rating: created.calificacion || data.rating,
      text: created.contenido,
      date: created.created_at,
      status: created.mostrar_en_pagina ? 'approved' : 'pending',
    }, ...prev]);
    return {
      id: created.id,
      userId: created.usuario_id || data.userId || '',
      name: created.nombre_autor || data.name,
      company: created.empresa_autor || data.company,
      rating: created.calificacion || data.rating,
      text: created.contenido,
      date: created.created_at,
      status: created.mostrar_en_pagina ? 'approved' : 'pending',
    };
  };

  const addProject: ContentContextType['addProject'] = async (data) => {
    const created = await proyectosApi.create({
      titulo: data.title,
      cliente: data.client,
      categoria: data.category,
      anio: data.year,
      descripcion: data.description,
      imagen_url: data.imageUrl,
      tags: data.tags,
      activo: true,
    });
    setProjects((prev) => [{
      ...data,
      id: created.id,
      activo: created.activo !== false,
    }, ...prev]);
  };

  const updateProject: ContentContextType['updateProject'] = async (id, data) => {
    const apiPayload: Record<string, unknown> = {};
    if (data.title !== undefined) apiPayload.titulo = data.title;
    if (data.client !== undefined) apiPayload.cliente = data.client;
    if (data.category !== undefined) apiPayload.categoria = data.category;
    if (data.year !== undefined) apiPayload.anio = data.year;
    if (data.description !== undefined) apiPayload.descripcion = data.description;
    if (data.imageUrl !== undefined) apiPayload.imagen_url = data.imageUrl;
    if (data.tags !== undefined) apiPayload.tags = data.tags;
    if (data.activo !== undefined) apiPayload.activo = data.activo;
    await proyectosApi.update(id, apiPayload);
    setProjects((prev) => prev.map((project) => project.id === id ? { ...project, ...data } : project));
  };

  const removeProject: ContentContextType['removeProject'] = async (id) => {
    await proyectosApi.delete(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const addStat: ContentContextType['addStat'] = async (data) => {
    const created = await metricasApi.create({
      valor: data.value,
      sufijo: data.suffix,
      etiqueta: data.label,
    });
    setStats((prev) => [...prev, {
      id: created.id,
      value: created.valor,
      suffix: created.sufijo || '+',
      label: created.etiqueta,
    }]);
  };

  const updateStat: ContentContextType['updateStat'] = async (id, data) => {
    const updated = await metricasApi.update(id, {
      ...(data.value !== undefined ? { valor: data.value } : {}),
      ...(data.suffix !== undefined ? { sufijo: data.suffix } : {}),
      ...(data.label !== undefined ? { etiqueta: data.label } : {}),
    });
    setStats((prev) => prev.map((stat) => stat.id === id ? {
      ...stat,
      value: updated.valor,
      suffix: updated.sufijo || '+',
      label: updated.etiqueta,
    } : stat));
  };

  const removeStat: ContentContextType['removeStat'] = async (id) => {
    await metricasApi.delete(id);
    setStats((prev) => prev.filter((stat) => stat.id !== id));
  };

  return (
    <ContentContext.Provider
      value={{
        testimonials,
        approvedTestimonials: testimonials.filter((t) => t.status !== 'hidden'),
        projects,
        stats,
        addTestimonial,
        refreshTestimonials,
        addProject,
        updateProject,
        removeProject,
        addStat,
        updateStat,
        removeStat,
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
