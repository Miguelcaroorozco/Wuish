import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { useContent } from '../../context/ContentContext';
import {
  planesApi,
  tiposServicioApi,
  solicitudesApi,
  infoGeneralApi,
  comentariosApi,
  cotizadorModulosApi,
  mensajesApi,
  proyectosApi,
} from '../../lib/api';
import {
  Plus,
  Download,
  ClipboardList,
  FileText,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Sliders,
  Star,
} from 'lucide-react';
import { Project, ProjectCategory } from '../../types';
import { AdminSolicitudesTab } from './AdminSolicitudesTab';
import { AdminMensajesTab } from './AdminMensajesTab';
import { AdminPlanesTab } from './AdminPlanesTab';
import { AdminCotizadorTab, CotizadorServiceItem } from './AdminCotizadorTab';
import { AdminCmsTab } from './AdminCmsTab';
import { AdminResultadosTab } from './AdminResultadosTab';
import { AdminComentariosTab } from './AdminComentariosTab';
import { AdminPlanModal } from './AdminPlanModal';
import { AdminCotizadorOptionModal } from './AdminCotizadorOptionModal';
import { AdminEditProjectModal } from './AdminEditProjectModal';

const DEFAULT_COTIZADOR_SERVICES: CotizadorServiceItem[] = [
  { id: 'opt_1', name: 'Desarrollo Web & E-Commerce', category: 'tecnologia', basePrice: 2850, description: 'Plataformas headless de alta conversión, SSR y checkout global.' },
  { id: 'opt_2', name: 'Arquitectura Cloud & DevOps', category: 'tecnologia', basePrice: 3400, description: 'Infraestructura contenerizada en AWS/GCP con CI/CD automatizado.' },
  { id: 'opt_3', name: 'Desarrollo de Software a Medida & Core', category: 'tecnologia', basePrice: 4200, description: 'Sistemas ERP, CRMs y microservicios transaccionales de alto tráfico.' },
  { id: 'opt_4', name: 'Inteligencia Artificial & Automatización', category: 'tecnologia', basePrice: 3800, description: 'Modelos predictivos, agentes autónomos y flujos de automatización de datos.' },
  { id: 'opt_5', name: 'Producción Audiovisual 4K', category: 'comunicacion', basePrice: 3200, description: 'Spots cinematográficos corporativos, dirección de arte y postproducción.' },
  { id: 'opt_6', name: 'Rebranding & Identidad Corporativa', category: 'comunicacion', basePrice: 2600, description: 'Ecosistema de marca, lineamientos de diseño y manuales de identidad.' },
  { id: 'opt_7', name: 'Estrategia de Comunicación & PR', category: 'comunicacion', basePrice: 2200, description: 'Relacionamiento estratégico, media training y posicionamiento en prensa.' },
  { id: 'opt_8', name: 'Pauta Digital Omnicanal & Performance', category: 'comunicacion', basePrice: 1950, description: 'Adquisición de clientes B2B/B2C mediante pauta cuantitativa orientada a ROI.' },
];

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();
  const {
    projects,
    addProject,
    updateProject,
    removeProject,
    stats,
    addStat,
    removeStat,
    addTestimonial,
  } = useContent();

  const [activeTab, setActiveTab] = useState<
    'solicitudes' | 'mensajes' | 'planes' | 'cotizador_admin' | 'cms' | 'resultados' | 'comentarios'
  >('solicitudes');

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchMsgTerm, setSearchMsgTerm] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [cotizadorOptions, setCotizadorOptions] = useState<CotizadorServiceItem[]>(DEFAULT_COTIZADOR_SERVICES);
  const [editingOption, setEditingOption] = useState<CotizadorServiceItem | null>(null);
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [savingOption, setSavingOption] = useState(false);

  const [cms, setCms] = useState({ slogan: '', vision: '', mision: '' });
  const [savingCms, setSavingCms] = useState(false);

  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ nombre: '', precio: '', tipo_id: '', desc: '', features: '' });
  const [planes, setPlanes] = useState<any[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [recomendadoPlanId, setRecomendadoPlanId] = useState<string>('');

  const [comentarios, setComentarios] = useState<any[]>([]);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectForm, setEditProjectForm] = useState<{
    title: string;
    client: string;
    category: ProjectCategory;
    year: string;
    description: string;
    tags: string;
    imageUrl: string;
  }>({
    title: '',
    client: '',
    category: 'tecnologia',
    year: '',
    description: '',
    tags: '',
    imageUrl: '',
  });

  const [newProject, setNewProject] = useState<{
    title: string;
    client: string;
    category: ProjectCategory;
    year: string;
    description: string;
    tags: string;
    imageUrl: string;
  }>({
    title: '',
    client: '',
    category: 'tecnologia',
    year: '2026',
    description: '',
    tags: '',
    imageUrl: '',
  });

  const [showNewTestimonialForm, setShowNewTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    company: '',
    rating: 5,
    text: '',
  });

  const [newStatItem, setNewStatItem] = useState({
    value: '',
    suffix: '+',
    label: '',
  });

  const [solicitudesPage, setSolicitudesPage] = useState(1);
  const [planesPage, setPlanesPage] = useState(1);
  const [cotizadorPage, setCotizadorPage] = useState(1);
  const [resultadosPage, setResultadosPage] = useState(1);
  const [testimoniosPage, setTestimoniosPage] = useState(1);

  const SOLICITUDES_PER_PAGE = 8;
  const PLANES_PER_PAGE = 6;
  const COTIZADOR_PER_PAGE = 8;
  const RESULTADOS_PER_PAGE = 6;
  const TESTIMONIOS_PER_PAGE = 6;

  useEffect(() => {
    loadData();

    const pollInterval = setInterval(async () => {
      try {
        const [msgRes, solRes] = await Promise.allSettled([
          mensajesApi.getAll(),
          solicitudesApi.getAll(),
        ]);

        if (msgRes.status === 'fulfilled' && Array.isArray(msgRes.value)) {
          setAllMessages((prev) => {
            if (
              prev.length === msgRes.value.length &&
              (prev.length === 0 || prev[0]?.id === msgRes.value[0]?.id)
            ) {
              return prev;
            }
            return msgRes.value;
          });
        }

        if (solRes.status === 'fulfilled' && Array.isArray(solRes.value)) {
          const newSols = solRes.value;
          setSolicitudes((prev) => {
            const hasChanged =
              prev.length !== newSols.length ||
              newSols.some((item, idx) => {
                const old = prev[idx];
                return !old || old.id !== item.id || old.estado !== item.estado || old.updated_at !== item.updated_at;
              });
            return hasChanged ? newSols : prev;
          });
        }
      } catch {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadData = async () => {
    try {
      const [sol, info, tipos, com, msg, pls] = await Promise.allSettled([
        solicitudesApi.getAll(),
        infoGeneralApi.getAll(),
        tiposServicioApi.getAll(),
        comentariosApi.getAll(),
        mensajesApi.getAll(),
        planesApi.getAll(true),
      ]);

      if (pls.status === 'fulfilled') setPlanes(pls.value);
      if (sol.status === 'fulfilled') setSolicitudes(sol.value);
      if (tipos.status === 'fulfilled') {
        setTiposServicio(tipos.value);
        if (tipos.value.length > 0) setNewPlan((p) => ({ ...p, tipo_id: tipos.value[0].id }));
      }
      if (com.status === 'fulfilled') setComentarios(com.value);
      if (msg.status === 'fulfilled') {
        setAllMessages(msg.value);
        if (msg.value.length > 0 && !selectedClientId) {
          setSelectedClientId(msg.value[0].usuario_id || null);
        }
      }
      if (info.status === 'fulfilled') {
        const list = (info.value || []) as any[];
        const getSec = (k: string) => list.find((i: any) => i.seccion === k)?.contenido || '';
        setCms({
          slogan: getSec('slogan') || 'Comunicación y tecnología a la medida de tu negocio.',
          vision: getSec('vision') || getSec('manifesto'),
          mision: getSec('mision'),
        });
        const recId = getSec('plan_recomendado_id');
        if (recId) setRecomendadoPlanId(recId);
      }

      cotizadorModulosApi.getAll(true).then((dbModules) => {
        if (Array.isArray(dbModules) && dbModules.length > 0) {
          setCotizadorOptions(
            dbModules.map((m: any) => ({
              id: m.id,
              name: m.nombre,
              category: m.categoria,
              basePrice: Number(m.precio_base),
              description: m.descripcion,
              activo: m.activo,
            }))
          );
        }
      }).catch(() => {});
    } catch (err) {
      console.error('Error cargando datos de administración:', err);
    }
  };

  const conversations = useMemo(() => {
    const map = new Map<string, { userId: string; userName: string; userEmail: string; lastMessage: string; lastTime: string; unreadCount: number }>();
    allMessages.forEach((m) => {
      const uId = m.usuario_id;
      if (!uId) return;
      const uName = m.usuario ? `${m.usuario.nombres} ${m.usuario.apellidos}` : 'Usuario';
      const uEmail = m.usuario?.correo || '';
      const existing = map.get(uId);
      const isUnread = !m.es_admin && !m.leido;

      if (!existing) {
        map.set(uId, {
          userId: uId,
          userName: uName,
          userEmail: uEmail,
          lastMessage: m.contenido,
          lastTime: new Date(m.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        if (isUnread) existing.unreadCount++;
      }
    });
    return Array.from(map.values());
  }, [allMessages]);

  const activeClient = useMemo(() => {
    if (!selectedClientId) return null;
    return conversations.find((c) => c.userId === selectedClientId) || null;
  }, [selectedClientId, conversations]);

  const activeChatMessages = useMemo(() => {
    if (!selectedClientId) return [];
    return allMessages
      .filter((m) => m.usuario_id === selectedClientId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allMessages, selectedClientId]);

  useEffect(() => {
    const box = chatBottomRef.current?.parentElement;
    if (box) {
      setTimeout(() => {
        box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [activeChatMessages.length, selectedClientId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedClientId) return;
    setSendingReply(true);
    try {
      const created = await mensajesApi.send({
        contenido: adminReplyText.trim(),
        asunto: 'Respuesta de Soporte WUISH',
        usuario_id: selectedClientId,
      });
      setAllMessages((prev) => [...prev, created]);
      setAdminReplyText('');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    try {
      await solicitudesApi.updateEstado(id, { estado: nuevoEstado });
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      );
      showToast('Estado Actualizado', `Solicitud #${id.slice(0, 8)}: ${nuevoEstado}`, 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Error al actualizar', 'error');
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      await Promise.all([
        infoGeneralApi.upsert('slogan', cms.slogan),
        infoGeneralApi.upsert('vision', cms.vision),
        infoGeneralApi.upsert('mision', cms.mision),
      ]);
      showToast('CMS Actualizado', 'La información institucional fue guardada.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo guardar la información institucional.', 'error');
    } finally {
      setSavingCms(false);
    }
  };

  const reloadPlanes = async () => {
    try {
      const res = await planesApi.getAll(true);
      setPlanes(res);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleTogglePlan = async (plan: any) => {
    try {
      if (plan.activo) {
        await planesApi.delete(plan.id);
        showToast('Plan Oculto', `"${plan.nombre}" ahora está oculto para los clientes.`, 'info');
      } else {
        await planesApi.update(plan.id, { activo: true });
        showToast('Plan Visible', `"${plan.nombre}" vuelve a estar visible para los clientes.`, 'info');
      }
      reloadPlanes();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el plan.', 'error');
    }
  };

  const handleSetRecomendado = async (plan: any) => {
    try {
      await infoGeneralApi.upsert('plan_recomendado_id', plan.id);
      setRecomendadoPlanId(plan.id);
      showToast('Plan Recomendado Actualizado', `"${plan.nombre}" ahora es el plan recomendado oficial en la web.`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo fijar el plan recomendado.', 'error');
    }
  };

  const openCreatePlan = () => {
    setEditingPlanId(null);
    setNewPlan({
      nombre: '',
      precio: '',
      tipo_id: tiposServicio[0]?.id || '',
      desc: '',
      features: '',
    });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    let featText = '';
    if (Array.isArray(plan.caracteristicas)) featText = plan.caracteristicas.join('\n');
    else if (typeof plan.caracteristicas === 'string') {
      try {
        const parsed = JSON.parse(plan.caracteristicas);
        featText = Array.isArray(parsed) ? parsed.join('\n') : plan.caracteristicas;
      } catch {
        featText = plan.caracteristicas;
      }
    }
    setNewPlan({
      nombre: plan.nombre,
      precio: plan.precio != null ? String(plan.precio) : '',
      tipo_id: plan.tipo_id || tiposServicio[0]?.id || '',
      desc: plan.descripcion || '',
      features: featText,
    });
    setShowPlanModal(true);
  };

  const toggleFeatureModule = (moduleName: string) => {
    setNewPlan((prev) => {
      const currentList = prev.features.split('\n').map((l) => l.trim()).filter(Boolean);
      const exists = currentList.some((l) => l.toLowerCase() === moduleName.toLowerCase());
      const updatedList = exists
        ? currentList.filter((l) => l.toLowerCase() !== moduleName.toLowerCase())
        : [...currentList, moduleName];
      return { ...prev, features: updatedList.join('\n') };
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: newPlan.nombre.trim(),
        precio: parseFloat(newPlan.precio),
        tipo_servicio_id: newPlan.tipo_id,
        descripcion: newPlan.desc.trim(),
        caracteristicas: newPlan.features.split('\n').map((f) => f.trim()).filter(Boolean),
      };

      if (editingPlanId) {
        await planesApi.update(editingPlanId, payload);
        showToast('Plan Actualizado', `"${newPlan.nombre}" se guardó correctamente.`, 'success');
      } else {
        await planesApi.create(payload);
        showToast('Plan Creado', `"${newPlan.nombre}" fue registrado exitosamente.`, 'success');
      }
      setShowPlanModal(false);
      reloadPlanes();
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo guardar el plan', 'error');
    }
  };

  const handleOpenCreateOption = () => {
    setIsCreatingOption(true);
    setEditingOption({
      id: `opt_${Date.now()}`,
      name: '',
      category: 'tecnologia',
      basePrice: 1000,
      description: '',
      activo: true,
    });
    setShowOptionModal(true);
  };

  const handleOpenEditOption = (opt: CotizadorServiceItem) => {
    setIsCreatingOption(false);
    setEditingOption({ ...opt });
    setShowOptionModal(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption) return;
    setSavingOption(true);
    try {
      await cotizadorModulosApi.upsert({
        id: editingOption.id,
        nombre: editingOption.name.trim(),
        categoria: editingOption.category || 'tecnologia',
        precio_base: Number(editingOption.basePrice) || 0,
        descripcion: editingOption.description.trim(),
        activo: editingOption.activo !== false,
      });

      const refreshed = await cotizadorModulosApi.getAll(true);
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        setCotizadorOptions(
          refreshed.map((m: any) => ({
            id: m.id,
            name: m.nombre,
            category: m.categoria,
            basePrice: Number(m.precio_base),
            description: m.descripcion,
            activo: m.activo,
          }))
        );
      }
      setShowOptionModal(false);
      setEditingOption(null);
      setIsCreatingOption(false);
      showToast(
        isCreatingOption ? 'Módulo Añadido' : 'Módulo Actualizado',
        `"${editingOption.name}" se guardó exitosamente en la base de datos.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo guardar la opción', 'error');
    } finally {
      setSavingOption(false);
    }
  };

  const handleToggleOptionVisibility = async (id: string) => {
    try {
      const target = cotizadorOptions.find((o) => o.id === id);
      if (!target) return;
      const nextActivo = target.activo === false;
      await cotizadorModulosApi.upsert({
        id: target.id,
        nombre: target.name,
        categoria: target.category,
        precio_base: target.basePrice,
        descripcion: target.description,
        activo: nextActivo,
      });

      const refreshed = await cotizadorModulosApi.getAll(true);
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        setCotizadorOptions(
          refreshed.map((m: any) => ({
            id: m.id,
            name: m.nombre,
            category: m.categoria,
            basePrice: Number(m.precio_base),
            description: m.descripcion,
            activo: m.activo,
          }))
        );
      }
      showToast(
        nextActivo ? 'Módulo Visible' : 'Módulo Ocultado',
        `"${target?.name}" ahora está ${nextActivo ? 'visible' : 'oculto'} en el cotizador.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo cambiar la visibilidad', 'error');
    }
  };

  const handleDeleteOption = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar el módulo "${name}" del cotizador?`)) return;
    try {
      await cotizadorModulosApi.delete(id);
      const refreshed = await cotizadorModulosApi.getAll(true);
      setCotizadorOptions(
        refreshed.map((m: any) => ({
          id: m.id,
          name: m.nombre,
          category: m.categoria,
          basePrice: Number(m.precio_base),
          description: m.descripcion,
          activo: m.activo,
        }))
      );
      showToast('Módulo Eliminado', `"${name}" fue eliminado del cotizador.`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo eliminar el módulo', 'error');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectForm({
      title: project.title,
      client: project.client,
      category: project.category,
      year: project.year,
      description: project.description,
      tags: (project.tags || []).join(', '),
      imageUrl: project.imageUrl || '',
    });
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const tagsArray = editProjectForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await proyectosApi.update(editingProject.id, {
        titulo: editProjectForm.title,
        cliente: editProjectForm.client,
        categoria: editProjectForm.category,
        anio: editProjectForm.year,
        descripcion: editProjectForm.description,
        tags: tagsArray,
        imagen_url: editProjectForm.imageUrl.trim() || undefined,
      });

      updateProject(editingProject.id, {
        title: editProjectForm.title,
        client: editProjectForm.client,
        category: editProjectForm.category,
        year: editProjectForm.year,
        description: editProjectForm.description,
        tags: tagsArray,
        imageUrl: editProjectForm.imageUrl.trim() || undefined,
      });

      showToast('Proyecto Actualizado', `"${editProjectForm.title}" se guardó en la base de datos.`, 'success');
      setEditingProject(null);
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el proyecto', 'error');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    try {
      const tagsArray = newProject.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await proyectosApi.create({
        titulo: newProject.title.trim(),
        cliente: newProject.client.trim(),
        categoria: newProject.category,
        anio: newProject.year.trim() || '2026',
        descripcion: newProject.description.trim(),
        tags: tagsArray,
        imagen_url: newProject.imageUrl.trim() || undefined,
      });

      addProject({
        title: newProject.title.trim(),
        client: newProject.client.trim(),
        category: newProject.category,
        year: newProject.year.trim() || '2026',
        description: newProject.description.trim(),
        tags: tagsArray,
        imageUrl: newProject.imageUrl.trim() || undefined,
        activo: true,
      });

      showToast('Proyecto Creado', `"${newProject.title}" se guardó en la base de datos.`, 'success');
      setNewProject({
        title: '',
        client: '',
        category: 'tecnologia',
        year: '2026',
        description: '',
        tags: '',
        imageUrl: '',
      });
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear el proyecto', 'error');
    }
  };

  const handleToggleProjectVisibility = async (id: string, current: boolean) => {
    try {
      await proyectosApi.update(id, { activo: !current });
      updateProject(id, { activo: !current });
      showToast('Proyecto', !current ? 'Visible en Inicio' : 'Oculto en Inicio', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo cambiar la visibilidad', 'error');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`¿Eliminar el proyecto "${title}"?`)) return;
    try {
      await proyectosApi.delete(id);
      removeProject(id);
      showToast('Proyecto Eliminado', `"${title}" fue removido de la base de datos.`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo eliminar el proyecto', 'error');
    }
  };

  const allComentarios = useMemo(() => {
    return comentarios.map((c: any) => ({
      id: c.id,
      contenido: c.contenido,
      calificacion: c.calificacion,
      mostrar_en_pagina: c.mostrar_en_pagina,
      created_at: c.created_at,
      usuario: c.usuario,
    }));
  }, [comentarios]);

  const handleToggleComentario = async (id: string, current: boolean) => {
    try {
      await comentariosApi.toggleMostrar(id, !current);
      setComentarios((prev) =>
        prev.map((c) => (c.id === id ? { ...c, mostrar_en_pagina: !current } : c))
      );
      showToast('Testimonio', !current ? 'Visible en Inicio' : 'Oculto', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Error al actualizar testimonio', 'error');
    }
  };

  const handleDeleteComentario = async (id: string) => {
    if (!window.confirm('¿Eliminar este testimonio permanentemente?')) return;
    try {
      await comentariosApi.delete(id);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
      showToast('Testimonio Eliminado', 'Se eliminó el testimonio.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Error al eliminar testimonio', 'error');
    }
  };

  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) {
      showToast('Campos requeridos', 'Ingresa nombre y contenido.', 'error');
      return;
    }
    try {
      addTestimonial({
        name: newTestimonial.name.trim(),
        company: newTestimonial.company.trim(),
        rating: newTestimonial.rating,
        text: newTestimonial.text.trim(),
      });
      setShowNewTestimonialForm(false);
      setNewTestimonial({ name: '', company: '', rating: 5, text: '' });
      showToast('Testimonio Publicado', 'Se añadió al carrusel de la página de inicio.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear el testimonio', 'error');
    }
  };

  const handleCreateStat = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(newStatItem.value);
    if (isNaN(valNum) || !newStatItem.label.trim()) {
      showToast('Dato inválido', 'Ingresa un valor numérico y etiqueta para la métrica', 'error');
      return;
    }
    addStat({
      value: valNum,
      suffix: newStatItem.suffix || '',
      label: newStatItem.label.trim(),
    });
    showToast('Métrica Agregada', `"${newStatItem.label}" se agregó a las cifras del inicio.`, 'success');
    setNewStatItem({ value: '', suffix: '+', label: '' });
  };

  const handleDeleteStat = (id: string, label: string) => {
    removeStat(id);
    showToast('Métrica Eliminada', `"${label}" fue removida del inicio.`, 'info');
  };

  const handleExportCSV = () => {
    const csvDelimiter = ';';
    const escapeCsvCell = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const normalized = String(value).replace(/\r\n|\r|\n/g, ' ');
      return new RegExp(`[${csvDelimiter}"\\n\\r]`).test(normalized)
        ? `"${normalized.replace(/"/g, '""')}"`
        : normalized;
    };

    const getSelectedServices = (value: unknown) => {
      if (!Array.isArray(value)) return '';
      return value
        .map((service: any) => {
          if (typeof service === 'string') return service;
          return service?.name || service?.nombre || service?.id || '';
        })
        .filter(Boolean)
        .join(' | ');
    };

    const rows = [
      ['ID', 'Cliente', 'Email', 'Empresa', 'Tipo', 'Estado', 'Plan', 'Servicios seleccionados', 'Presupuesto mínimo', 'Presupuesto máximo', 'Velocidad', 'Soporte', 'Fecha', 'Descripción'],
      ...solicitudes.map((r) => [
        r.id || '',
        `${r.usuario?.nombres || ''} ${r.usuario?.apellidos || ''}`.trim(),
        r.usuario?.correo || '',
        r.empresa || r.usuario?.empresa || '',
        r.tipo || '',
        r.estado || '',
        r.plan?.nombre || '',
        getSelectedServices(r.servicios_seleccionados),
        r.presupuesto_min ?? '',
        r.presupuesto_max ?? '',
        r.velocidad_entrega || '',
        r.nivel_soporte || '',
        r.created_at || r.fecha_solicitud || '',
        r.descripcion || '',
      ]),
    ];

    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(csvDelimiter)).join('\r\n')}\r\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `solicitudes_wuish_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    showToast('Exportación', 'CSV descargado exitosamente.', 'success');
  };

  const kpis = [
    { label: 'Total Solicitudes', val: solicitudes.length, color: 'text-white' },
    { label: 'Pendientes', val: solicitudes.filter((s) => s.estado === 'pendiente').length, color: 'text-amber-400' },
    { label: 'Aprobadas', val: solicitudes.filter((s) => s.estado === 'aprobada').length, color: 'text-emerald-400' },
    { label: 'Mensajes Sin Leer', val: conversations.reduce((a, c) => a + c.unreadCount, 0), color: 'text-sky-400' },
    { label: 'Planes Activos', val: planes.filter((p) => p.activo).length, color: 'text-[#ffd56d]' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd56d] font-display block mb-1">
            Dirección Ejecutiva
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Panel de Administración
          </h1>
          <p className="text-xs text-[#9a907c] mt-1">
            Gestión centralizada de solicitudes, clientes y contenidos del inicio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreatePlan}
            className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Plan</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#1c1b1d] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
              {k.label}
            </span>
            <div className={`text-2xl sm:text-3xl font-extrabold mt-1 font-display ${k.color}`}>
              {k.val}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-[#1c1b1d] border border-white/5 p-1.5 rounded-2xl overflow-x-auto">
        {[
          { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList, count: solicitudes.length },
          { id: 'mensajes', label: 'Mensajes de Clientes', icon: MessageSquare, count: conversations.reduce((a, c) => a + c.unreadCount, 0) },
          { id: 'planes', label: 'Planes (Plantillas)', icon: CreditCard, count: planes.filter((p) => p.activo).length },
          { id: 'cotizador_admin', label: 'Opciones Cotizador', icon: Sliders, count: cotizadorOptions.length },
          { id: 'cms', label: 'CMS Institucional', icon: FileText },
          { id: 'resultados', label: 'Resultados & Portafolio', icon: TrendingUp, count: projects.length },
          { id: 'comentarios', label: 'Testimonios', icon: Star, count: allComentarios.length },
        ].map((tab: any) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                active ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm' : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-black/20 text-[#3e2e00]' : 'bg-white/10 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'solicitudes' && (
        <AdminSolicitudesTab
          solicitudes={solicitudes}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          solicitudesPage={solicitudesPage}
          onPageChange={setSolicitudesPage}
          itemsPerPage={SOLICITUDES_PER_PAGE}
          onStatusChange={handleStatusChange}
        />
      )}

      {activeTab === 'mensajes' && (
        <AdminMensajesTab
          conversations={conversations}
          searchMsgTerm={searchMsgTerm}
          onSearchMsgChange={setSearchMsgTerm}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          activeClient={activeClient}
          activeChatMessages={activeChatMessages}
          adminReplyText={adminReplyText}
          onReplyTextChange={setAdminReplyText}
          onSendReply={handleSendReply}
          sendingReply={sendingReply}
          chatBottomRef={chatBottomRef as any}
        />
      )}

      {activeTab === 'cms' && (
        <AdminCmsTab
          cms={cms}
          onCmsChange={setCms}
          onSaveCms={handleSaveCms}
          savingCms={savingCms}
        />
      )}

      {activeTab === 'resultados' && (
        <AdminResultadosTab
          projects={projects}
          resultadosPage={resultadosPage}
          itemsPerPage={RESULTADOS_PER_PAGE}
          onPageChange={setResultadosPage}
          newProject={newProject}
          onNewProjectChange={setNewProject}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onToggleProjectVisibility={handleToggleProjectVisibility}
          onDeleteProject={handleDeleteProject}
          stats={stats}
          newStatItem={newStatItem}
          onNewStatChange={setNewStatItem}
          onCreateStat={handleCreateStat}
          onDeleteStat={handleDeleteStat}
        />
      )}

      {activeTab === 'comentarios' && (
        <AdminComentariosTab
          comentarios={comentarios}
          allComentarios={allComentarios}
          testimoniosPage={testimoniosPage}
          itemsPerPage={TESTIMONIOS_PER_PAGE}
          onPageChange={setTestimoniosPage}
          showNewTestimonialForm={showNewTestimonialForm}
          onToggleNewForm={() => setShowNewTestimonialForm(!showNewTestimonialForm)}
          newTestimonial={newTestimonial}
          onNewTestimonialChange={setNewTestimonial}
          onCreateTestimonial={handleCreateTestimonial}
          onToggleComentario={handleToggleComentario}
          onDeleteComentario={handleDeleteComentario}
        />
      )}

      {activeTab === 'planes' && (
        <AdminPlanesTab
          planes={planes}
          recomendadoPlanId={recomendadoPlanId}
          planesPage={planesPage}
          itemsPerPage={PLANES_PER_PAGE}
          onPageChange={setPlanesPage}
          onOpenCreatePlan={openCreatePlan}
          onOpenEditPlan={openEditPlan}
          onTogglePlan={handleTogglePlan}
          onSetRecomendado={handleSetRecomendado}
        />
      )}

      {activeTab === 'cotizador_admin' && (
        <AdminCotizadorTab
          cotizadorOptions={cotizadorOptions}
          cotizadorPage={cotizadorPage}
          itemsPerPage={COTIZADOR_PER_PAGE}
          onPageChange={setCotizadorPage}
          onOpenCreateOption={handleOpenCreateOption}
          onOpenEditOption={handleOpenEditOption}
          onToggleOptionVisibility={handleToggleOptionVisibility}
          onDeleteOption={handleDeleteOption}
        />
      )}

      <AdminPlanModal
        show={showPlanModal}
        editingPlanId={editingPlanId}
        newPlan={newPlan}
        onPlanChange={setNewPlan}
        tiposServicio={tiposServicio}
        cotizadorOptions={cotizadorOptions}
        onToggleFeatureModule={toggleFeatureModule}
        onSavePlan={handleSavePlan}
        onClose={() => setShowPlanModal(false)}
      />

      <AdminCotizadorOptionModal
        show={showOptionModal}
        isCreating={isCreatingOption}
        editingOption={editingOption}
        onOptionChange={setEditingOption}
        onSaveOption={handleSaveOption}
        savingOption={savingOption}
        onClose={() => setShowOptionModal(false)}
      />

      <AdminEditProjectModal
        editingProject={editingProject}
        editProjectForm={editProjectForm}
        onFormChange={setEditProjectForm}
        onSaveEdit={handleSaveEditProject}
        onClose={() => setEditingProject(null)}
      />
    </div>
  );
};
