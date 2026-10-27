import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';
import {
  planesApi,
  tiposServicioApi,
  solicitudesApi,
  infoGeneralApi,
  comentariosApi,
  cotizadorModulosApi,
  mensajesApi,
  proyectosApi,
  usuariosApi,
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
  Users,
  KeyRound,
  AlertTriangle,
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
import { AdminUsuariosTab } from './AdminUsuariosTab';
import { AdminPermisosTab, ADMIN_VIEWS } from './AdminPermisosTab';

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

export type AdminTabType =
  | 'solicitudes'
  | 'mensajes'
  | 'planes'
  | 'cotizador_admin'
  | 'cms'
  | 'resultados'
  | 'comentarios'
  | 'usuarios'
  | 'permisos';

export const VALID_ADMIN_TABS: AdminTabType[] = [
  'solicitudes',
  'mensajes',
  'planes',
  'cotizador_admin',
  'cms',
  'resultados',
  'comentarios',
  'usuarios',
  'permisos',
];

const getInitialAdminTab = (allowedList?: string[] | null): AdminTabType => {
  const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
  let requested: string | null = null;
  if (pathParts[0] === 'admin' && pathParts[1]) {
    requested = pathParts[1];
  }
  if (!requested) {
    try {
      requested = localStorage.getItem('admin_active_tab');
    } catch {}
  }

  if (allowedList && Array.isArray(allowedList) && allowedList.length > 0) {
    if (requested && allowedList.includes(requested) && VALID_ADMIN_TABS.includes(requested as AdminTabType)) {
      return requested as AdminTabType;
    }
    const firstAllowed = allowedList.find((v) => VALID_ADMIN_TABS.includes(v as AdminTabType));
    if (firstAllowed) return firstAllowed as AdminTabType;
  }

  if (requested && VALID_ADMIN_TABS.includes(requested as AdminTabType)) {
    return requested as AdminTabType;
  }

  return 'solicitudes';
};

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
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

  const userPermisos = useMemo(() => {
    return Array.isArray(currentUser?.permisos)
      ? (currentUser?.permisos as string[])
      : null;
  }, [currentUser?.permisos]);

  const [activeTab, setActiveTab] = useState<AdminTabType>(() => {
    return getInitialAdminTab(userPermisos);
  });

  useEffect(() => {
    if (userPermisos && !userPermisos.includes(activeTab)) {
      const firstAllowed = VALID_ADMIN_TABS.find((v) => userPermisos.includes(v));
      if (firstAllowed) {
        setActiveTab(firstAllowed);
        try {
          localStorage.setItem('admin_active_tab', firstAllowed);
        } catch {}
      }
    }
  }, [userPermisos, activeTab]);

  const [allUsuarios, setAllUsuarios] = useState<any[]>([]);

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

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    title: string;
    description: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    confirmButtonText?: string;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);

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

  useEffect(() => {
    const handleOpenAdminTab = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const tab = (typeof detail === 'string' ? detail : detail?.tab) as AdminTabType;
      const clientId = typeof detail === 'object' ? detail?.clientId : null;
      if (tab && VALID_ADMIN_TABS.includes(tab)) {
        setActiveTab(tab);
        if (clientId) setSelectedClientId(clientId);
        try {
          localStorage.setItem('admin_active_tab', tab);
        } catch {}
        if (window.location.pathname.startsWith('/admin')) {
          window.history.replaceState(null, '', `/admin/${tab}`);
        }
      }
    };
    window.addEventListener('wuish:openAdminTab', handleOpenAdminTab);
    return () => window.removeEventListener('wuish:openAdminTab', handleOpenAdminTab);
  }, []);

  const loadAllUsuarios = async () => {
    try {
      const res = await usuariosApi.getAll();
      if (Array.isArray(res)) setAllUsuarios(res);
    } catch {}
  };

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
      await loadAllUsuarios();

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

  // Redirigir automáticamente si el usuario no tiene permiso sobre activeTab
  useEffect(() => {
    if (userPermisos && userPermisos.length > 0) {
      if (!userPermisos.includes(activeTab)) {
        const fallback = (userPermisos.find((v) => VALID_ADMIN_TABS.includes(v as AdminTabType)) as AdminTabType) || 'solicitudes';
        setActiveTab(fallback);
        try {
          localStorage.setItem('admin_active_tab', fallback);
        } catch {}
        if (window.location.pathname.startsWith('/admin')) {
          window.history.replaceState(null, '', `/admin/${fallback}`);
        }
      }
    }
  }, [userPermisos, activeTab]);

  // Sincronizar localStorage y la URL cada vez que activeTab cambie
  useEffect(() => {
    try {
      localStorage.setItem('admin_active_tab', activeTab);
    } catch {}
    if (window.location.pathname.startsWith('/admin')) {
      const targetUrl = `/admin/${activeTab}`;
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState(null, '', targetUrl);
      }
    }
  }, [activeTab]);

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

  const handleDeleteOption = (id: string, name: string) => {
    setDeleteConfirmModal({
      title: '¿Eliminar módulo del cotizador?',
      description: (
        <>
          Esta acción eliminará permanentemente el módulo{' '}
          <strong className="text-white">"{name}"</strong> de las opciones activas del cotizador.
        </>
      ),
      onConfirm: async () => {
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
      },
    });
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

  const handleDeleteProject = (id: string, title: string) => {
    setDeleteConfirmModal({
      title: '¿Eliminar proyecto?',
      description: (
        <>
          Esta acción eliminará permanentemente el proyecto{' '}
          <strong className="text-white">"{title}"</strong> del portafolio y resultados.
        </>
      ),
      onConfirm: async () => {
        try {
          await proyectosApi.delete(id);
          removeProject(id);
          showToast('Proyecto Eliminado', `"${title}" fue removido de la base de datos.`, 'success');
        } catch (err: any) {
          showToast('Error', err.message || 'No se pudo eliminar el proyecto', 'error');
        }
      },
    });
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

  const handleDeleteComentario = (id: string) => {
    const item = comentarios.find((c: any) => c.id === id);
    const author = item?.usuario?.nombres
      ? `${item.usuario.nombres} ${item.usuario.apellidos || ''}`.trim()
      : 'este cliente';

    setDeleteConfirmModal({
      title: '¿Eliminar testimonio?',
      description: (
        <>
          Esta acción eliminará permanentemente el testimonio de{' '}
          <strong className="text-white">{author}</strong> de la plataforma.
        </>
      ),
      onConfirm: async () => {
        try {
          await comentariosApi.delete(id);
          setComentarios((prev) => prev.filter((c) => c.id !== id));
          showToast('Testimonio Eliminado', 'Se eliminó el testimonio.', 'success');
        } catch (err: any) {
          showToast('Error', err.message || 'Error al eliminar testimonio', 'error');
        }
      },
    });
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
    setDeleteConfirmModal({
      title: '¿Eliminar métrica institucional?',
      description: (
        <>
          Esta acción removerá la cifra <strong className="text-white">"{label}"</strong> de los resultados mostrados en la página principal.
        </>
      ),
      onConfirm: () => {
        removeStat(id);
        showToast('Métrica Eliminada', `"${label}" fue removida del inicio.`, 'info');
      },
    });
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
    (userPermisos === null || userPermisos.includes('solicitudes')) && { label: 'Total Solicitudes', val: solicitudes.length, color: 'text-white' },
    (userPermisos === null || userPermisos.includes('solicitudes')) && { label: 'Pendientes', val: solicitudes.filter((s) => s.estado === 'pendiente').length, color: 'text-amber-400' },
    (userPermisos === null || userPermisos.includes('solicitudes')) && { label: 'Aprobadas', val: solicitudes.filter((s) => s.estado === 'aprobada').length, color: 'text-emerald-400' },
    (userPermisos === null || userPermisos.includes('mensajes')) && { label: 'Mensajes Sin Leer', val: conversations.reduce((a, c) => a + c.unreadCount, 0), color: 'text-sky-400' },
    (userPermisos === null || userPermisos.includes('usuarios') || userPermisos.includes('permisos')) && { label: 'Usuarios Totales', val: allUsuarios.length, color: 'text-[#ffd56d]' },
  ].filter(Boolean) as { label: string; val: number; color: string }[];

  const allTabs: { id: AdminTabType; label: string; icon: any; count?: number }[] = [
    { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList, count: solicitudes.length },
    { id: 'mensajes', label: 'Mensajes de Clientes', icon: MessageSquare, count: conversations.reduce((a, c) => a + c.unreadCount, 0) },
    { id: 'planes', label: 'Planes (Plantillas)', icon: CreditCard, count: planes.filter((p) => p.activo).length },
    { id: 'cotizador_admin', label: 'Opciones Cotizador', icon: Sliders, count: cotizadorOptions.length },
    { id: 'cms', label: 'CMS Institucional', icon: FileText },
    { id: 'resultados', label: 'Resultados & Portafolio', icon: TrendingUp, count: projects.length },
    { id: 'comentarios', label: 'Testimonios', icon: Star, count: allComentarios.length },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users, count: allUsuarios.length },
    { id: 'permisos', label: 'Control de Permisos', icon: KeyRound, count: allUsuarios.filter((u) => u.rol === 'admin' || u.rol === 'administrador').length },
  ];

  const visibleTabs = userPermisos !== null
    ? allTabs.filter((tab) => userPermisos.includes(tab.id))
    : allTabs;

  // Track animated tab ids: 'entering' | 'visible' | 'leaving'
  const [tabAnimStates, setTabAnimStates] = useState<Record<string, 'entering' | 'visible' | 'leaving'>>({});
  const prevVisibleTabIdsRef = useRef<Set<AdminTabType>>(new Set<AdminTabType>());

  // Tab bar horizontal drag-to-scroll & auto-fit logic
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const checkScrollable = useCallback(() => {
    if (tabsContainerRef.current) {
      const el = tabsContainerRef.current;
      setCanScroll(el.scrollWidth > el.clientWidth + 2);
    }
  }, []);

  useEffect(() => {
    checkScrollable();
    const handleResize = () => checkScrollable();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleTabs.length, checkScrollable]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !tabsContainerRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = tabsContainerRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !tabsContainerRef.current) return;
      const walk = e.pageX - startXRef.current;
      if (Math.abs(walk) > 4) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsDragActive(true);
        }
        tabsContainerRef.current.scrollLeft = scrollLeftStartRef.current - walk;
      }
    };

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setTimeout(() => {
          hasDraggedRef.current = false;
          setIsDragActive(false);
        }, 80);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    if (e.deltaY !== 0 && e.deltaX === 0) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const newIds = new Set(visibleTabs.map((t) => t.id));
    const prevIds = prevVisibleTabIdsRef.current;

    const entering = visibleTabs.filter((t) => !prevIds.has(t.id)).map((t) => t.id);
    const leaving = [...prevIds].filter((id) => !newIds.has(id));

    if (entering.length === 0 && leaving.length === 0) return;

    setTabAnimStates((prev) => {
      const next = { ...prev };
      entering.forEach((id) => { next[id] = 'entering'; });
      leaving.forEach((id) => { next[id] = 'leaving'; });
      return next;
    });

    // entering → visible after transition
    if (entering.length > 0) {
      const t = setTimeout(() => {
        setTabAnimStates((prev) => {
          const next = { ...prev };
          entering.forEach((id) => { next[id] = 'visible'; });
          return next;
        });
      }, 350);
      return () => clearTimeout(t);
    }

    prevVisibleTabIdsRef.current = newIds;
  }, [visibleTabs.map((t) => t.id).join(',')]);

  // Sync prevRef after leaving tabs finish fading out
  useEffect(() => {
    const leavingIds = Object.entries(tabAnimStates)
      .filter(([, s]) => s === 'leaving')
      .map(([id]) => id);
    if (leavingIds.length === 0) return;
    const t = setTimeout(() => {
      prevVisibleTabIdsRef.current = new Set(visibleTabs.map((t) => t.id));
      setTabAnimStates((prev) => {
        const next = { ...prev };
        leavingIds.forEach((id) => { delete next[id]; });
        return next;
      });
    }, 320);
    return () => clearTimeout(t);
  }, [JSON.stringify(tabAnimStates)]);

  // Auto-scroll active tab into view so it is always visible
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeEl = tabsContainerRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTab]);

  const hasTabPermission = (tab: AdminTabType) => userPermisos === null || userPermisos.includes(tab);

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

        {(hasTabPermission('planes') || hasTabPermission('solicitudes')) && (
          <div className="flex items-center gap-3">
            {hasTabPermission('planes') && (
              <button
                onClick={openCreatePlan}
                className="px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Plan</span>
              </button>
            )}
            {hasTabPermission('solicitudes') && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            )}
          </div>
        )}
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-in fade-in duration-300">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              style={{ animationDelay: `${i * 40}ms` }}
              className="p-4 rounded-2xl bg-[#1c1b1d] border border-white/5 animate-in fade-in zoom-in-95 duration-300 transition-all hover:border-white/10"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">
                {k.label}
              </span>
              <div className={`text-2xl sm:text-3xl font-extrabold mt-1 font-display ${k.color}`}>
                {k.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleTabs.length > 0 && (
        <div
          ref={tabsContainerRef}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          className={`admin-tabs-scrollbar w-fit max-w-full flex items-center gap-2 bg-[#1c1b1d] border border-white/10 hover:border-[#ffd56d]/35 hover:shadow-[0_0_24px_rgba(255,213,109,0.12)] p-1.5 rounded-2xl overflow-x-auto transition-all duration-300 select-none ${
            isDragActive
              ? 'cursor-grabbing'
              : canScroll
              ? 'cursor-grab'
              : 'cursor-default'
          }`}
        >
          {/* render visible + leaving tabs so they can animate out */}
          {allTabs
            .filter((tab) => visibleTabs.some((v) => v.id === tab.id) || tabAnimStates[tab.id] === 'leaving')
            .map((tab: any, index: number) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const animState = tabAnimStates[tab.id];
              const isLeaving = animState === 'leaving';
              const isEntering = animState === 'entering';

              return (
                <button
                  key={tab.id}
                  disabled={isLeaving}
                  draggable={false}
                  data-active={active ? 'true' : 'false'}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={() => {
                    if (isLeaving) return;
                    if (hasDraggedRef.current) return;
                    setActiveTab(tab.id as any);
                    try {
                      localStorage.setItem('admin_active_tab', tab.id);
                    } catch {}
                    if (window.location.pathname.startsWith('/admin')) {
                      window.history.replaceState(null, '', `/admin/${tab.id}`);
                    }
                  }}
                  style={{
                    animationDelay: `${index * 35}ms`,
                    transition:
                      'opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.3s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    opacity: isLeaving ? 0 : isEntering ? 0 : 1,
                    transform: isLeaving
                      ? 'translateY(-6px) scale(0.88)'
                      : isEntering
                      ? 'translateY(6px) scale(0.9)'
                      : 'translateY(0) scale(1)',
                    maxWidth: isLeaving ? '0px' : '400px',
                    overflow: isLeaving ? 'hidden' : 'visible',
                    padding: isLeaving ? '0' : undefined,
                    marginRight: isLeaving ? '-8px' : undefined,
                    pointerEvents: isLeaving ? 'none' : 'auto',
                  }}
                  className={`group shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isDragActive ? 'cursor-grabbing' : 'cursor-pointer'
                  } ${
                    active
                      ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm ring-1 ring-[#ffd56d]'
                      : 'text-[#d1c5af] hover:text-[#ffd56d] hover:bg-[#ffd56d]/10 hover:border-[#ffd56d]/30 border border-transparent hover:shadow-[0_0_14px_rgba(255,213,109,0.15)]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      active ? 'text-[#3e2e00]' : 'text-[#d1c5af] group-hover:text-[#ffd56d]'
                    }`}
                  />
                  <span className="transition-colors duration-200">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono transition-colors duration-200 ${
                        active
                          ? 'bg-black/20 text-[#3e2e00] font-bold'
                          : 'bg-white/10 text-white group-hover:bg-[#ffd56d]/20 group-hover:text-[#ffd56d]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}

      {visibleTabs.length === 0 ? (
        <div className="bg-[#1c1b1d] border border-white/5 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">Sin Módulos Asignados</h2>
          <p className="text-xs text-[#9a907c] max-w-sm mx-auto">
            Tu cuenta de administrador no tiene módulos ni vistas asignadas actualmente. Comunícate con el administrador principal para solicitar acceso.
          </p>
        </div>
      ) : (
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'solicitudes' && hasTabPermission('solicitudes') && (
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

          {activeTab === 'mensajes' && hasTabPermission('mensajes') && (
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

          {activeTab === 'cms' && hasTabPermission('cms') && (
            <AdminCmsTab
              cms={cms}
              onCmsChange={setCms}
              onSaveCms={handleSaveCms}
              savingCms={savingCms}
            />
          )}

          {activeTab === 'resultados' && hasTabPermission('resultados') && (
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

          {activeTab === 'comentarios' && hasTabPermission('comentarios') && (
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

          {activeTab === 'usuarios' && hasTabPermission('usuarios') && (
            <AdminUsuariosTab
              usuarios={allUsuarios}
              onReload={loadAllUsuarios}
            />
          )}

          {activeTab === 'permisos' && hasTabPermission('permisos') && (
            <AdminPermisosTab
              usuarios={allUsuarios}
              onReload={loadAllUsuarios}
            />
          )}

          {activeTab === 'planes' && hasTabPermission('planes') && (
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

          {activeTab === 'cotizador_admin' && hasTabPermission('cotizador_admin') && (
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
        </div>
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

      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1c1b1d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-white font-display">
                {deleteConfirmModal.title}
              </h3>
              <p className="text-xs text-[#9a907c] leading-relaxed">
                {deleteConfirmModal.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deletingItem}
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer flex-1 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingItem}
                onClick={async () => {
                  setDeletingItem(true);
                  try {
                    await deleteConfirmModal.onConfirm();
                    setDeleteConfirmModal(null);
                  } finally {
                    setDeletingItem(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex-1 disabled:opacity-50 shadow-lg shadow-red-500/10"
              >
                {deletingItem ? 'Eliminando...' : deleteConfirmModal.confirmButtonText || 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
