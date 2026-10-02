import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { useContent } from '../context/ContentContext';
import {
  planesApi,
  tiposServicioApi,
  solicitudesApi,
  infoGeneralApi,
  comentariosApi,
  cotizadorModulosApi,
  mensajesApi,
} from '../lib/api';
import {
  Search,
  Trash2,
  Plus,
  Download,
  Eye,
  EyeOff,
  Star,
  Send,
  ClipboardList,
  FileText,
  TrendingUp,
  MessageSquare,
  Briefcase,
  CreditCard,
  Pencil,
  Sliders,
  Sparkles,
  Target,
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DEFAULT_COTIZADOR_SERVICES,
  CotizadorServiceItem,
} from '../lib/cotizadorDefaults';

const ESTADOS = ['pendiente', 'en_revision', 'en_proceso', 'aprobada', 'finalizada'] as const;

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'elementos',
}) => {
  if (totalItems === 0) return null;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-[#9a907c]">
      <div className="text-[11px]">
        Mostrando <span className="font-semibold text-white">{startItem}</span> –{' '}
        <span className="font-semibold text-white">{endItem}</span> de{' '}
        <span className="font-semibold text-[#ffd56d]">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 font-semibold text-xs"
          title="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={`ell-${idx}`} className="px-1 text-zinc-600 font-mono text-xs">
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[30px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm'
                    : 'bg-[#201f21] text-[#d1c5af] hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 font-semibold text-xs"
          title="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();
  const {
    projects,
    addProject,
    removeProject,
    stats,
    addStat,
    removeStat,
    testimonials: contentTestimonials,
    addTestimonial,
    approveTestimonial,
    removeTestimonial,
  } = useContent();

  const [activeTab, setActiveTab] = useState<'solicitudes' | 'mensajes' | 'planes' | 'cotizador_admin' | 'cms' | 'resultados' | 'comentarios'>('solicitudes');

  // Data states
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchMsgTerm, setSearchMsgTerm] = useState('');

  // Cotizador Options state
  const [cotizadorOptions, setCotizadorOptions] = useState<CotizadorServiceItem[]>(DEFAULT_COTIZADOR_SERVICES);
  const [editingOption, setEditingOption] = useState<CotizadorServiceItem | null>(null);
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [savingOption, setSavingOption] = useState(false);

  // CMS state
  const [cms, setCms] = useState({ slogan: '', vision: '', mision: '' });
  const [savingCms, setSavingCms] = useState(false);

  // Planes state
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ nombre: '', precio: '', tipo_id: '', desc: '', features: '' });
  // Planes (incluye inactivos) y plan en edición (null = creando uno nuevo)
  const [planes, setPlanes] = useState<any[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [recomendadoPlanId, setRecomendadoPlanId] = useState<string>('');

  // Testimonios state
  const [comentarios, setComentarios] = useState<any[]>([]);

  // Nuevo Proyecto (Portafolio del Inicio)
  const [newProject, setNewProject] = useState<{
    title: string;
    client: string;
    category: 'comunicacion' | 'tecnologia';
    year: string;
    description: string;
    tags: string;
    imageUrl: string;
  }>({
    title: '',
    client: '',
    category: 'tecnologia',
    year: new Date().getFullYear().toString(),
    description: '',
    tags: '',
    imageUrl: '',
  });

  // Nuevo Testimonio (Formulario Admin)
  const [showNewTestimonialForm, setShowNewTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    company: '',
    rating: 5,
    text: '',
  });

  // Nueva Métrica de Inicio
  const [newStatItem, setNewStatItem] = useState<{
    value: string;
    suffix: string;
    label: string;
  }>({
    value: '',
    suffix: '+',
    label: '',
  });

  useEffect(() => {
    loadData();
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
        if (tipos.value.length > 0) setNewPlan(p => ({ ...p, tipo_id: tipos.value[0].id }));
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
          slogan: getSec('slogan') || 'Ecosistema integral que fusiona tecnología de punta y comunicación estratégica para empresas en crecimiento.',
          vision: getSec('vision') || getSec('manifesto') || 'Creemos en la velocidad, en el código robusto y en historias memorables que impulsan organizaciones hacia el futuro.',
          mision: getSec('mision') || 'Potenciar a negocios y líderes corporativos con soluciones digitales vanguardistas y resultados medibles.',
        });
        setRecomendadoPlanId(getSec('plan_recomendado_id'));

        // Cargar opciones del cotizador desde la base de datos
        try {
          const dbModulos = await cotizadorModulosApi.getAll(true);
          if (Array.isArray(dbModulos) && dbModulos.length > 0) {
            setCotizadorOptions(
              dbModulos.map((m: any) => ({
                id: m.id,
                name: m.nombre,
                category: m.categoria,
                basePrice: Number(m.precio_base),
                description: m.descripcion,
                activo: m.activo,
              }))
            );
          }
        } catch {}
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  // Memoized conversations grouping
  const conversations = useMemo(() => {
    const map = new Map<string, {
      userId: string; userName: string; userEmail: string;
      lastMessage: string; lastTime: string; lastDate: Date; unreadCount: number;
    }>();

    for (const msg of allMessages) {
      const uid = msg.usuario_id;
      if (!uid) continue;
      const isUnread = !msg.leido && !msg.es_admin;
      const date = new Date(msg.created_at);
      const prev = map.get(uid);

      if (!prev) {
        map.set(uid, {
          userId: uid,
          userName: `${msg.usuario?.nombres || 'Cliente'} ${msg.usuario?.apellidos || ''}`.trim(),
          userEmail: msg.usuario?.correo || '',
          lastMessage: msg.contenido || '',
          lastTime: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          lastDate: date,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        if (isUnread) prev.unreadCount += 1;
        if (date > prev.lastDate) {
          prev.lastMessage = msg.contenido || '';
          prev.lastTime = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          prev.lastDate = date;
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
  }, [allMessages]);

  const filteredConversations = useMemo(() => {
    const term = searchMsgTerm.toLowerCase();
    return conversations.filter(c =>
      c.userName.toLowerCase().includes(term) ||
      c.userEmail.toLowerCase().includes(term) ||
      c.lastMessage.toLowerCase().includes(term)
    );
  }, [conversations, searchMsgTerm]);

  const activeChatMessages = useMemo(() => {
    if (!selectedClientId) return [];
    return allMessages
      .filter(m => m.usuario_id === selectedClientId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allMessages, selectedClientId]);

  const activeClient = useMemo(() => conversations.find(c => c.userId === selectedClientId), [conversations, selectedClientId]);

  // Handlers
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
      setAllMessages(prev => [...prev, created]);
      setAdminReplyText('');
      showToast('Respuesta Enviada', 'Mensaje enviado al cliente.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    try {
      await solicitudesApi.updateEstado(id, { estado: nuevoEstado });
      setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s));
      showToast('Estado Actualizado', `Solicitud #${id.slice(0, 8)}: ${nuevoEstado}`, 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar', 'error');
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      await Promise.all([
        infoGeneralApi.upsert('slogan', cms.slogan),
        infoGeneralApi.upsert('vision', cms.vision),
        infoGeneralApi.upsert('manifesto', cms.vision),
        infoGeneralApi.upsert('mision', cms.mision),
      ]);
      showToast('CMS Guardado', 'Información corporativa actualizada.', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setSavingCms(false);
    }
  };

  const handleOpenCreateOption = () => {
    setIsCreatingOption(true);
    setEditingOption({
      id: '',
      name: '',
      basePrice: 1000,
      category: 'tecnologia',
      description: '',
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
    if (!editingOption || !editingOption.name.trim()) return;
    setSavingOption(true);
    try {
      if (isCreatingOption) {
        const baseSlug = editingOption.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '_')
          .replace(/^_+|_+$/g, '');
        const tempId = baseSlug || `modulo_${Date.now()}`;
        const finalId = cotizadorOptions.some(o => o.id === tempId) ? `${tempId}_${Date.now()}` : tempId;
        
        await cotizadorModulosApi.upsert({
          id: finalId,
          nombre: editingOption.name.trim(),
          categoria: editingOption.category || 'tecnologia',
          precio_base: Number(editingOption.basePrice) || 0,
          descripcion: editingOption.description.trim(),
          activo: editingOption.activo !== false,
        });
      } else {
        await cotizadorModulosApi.upsert({
          id: editingOption.id,
          nombre: editingOption.name.trim(),
          categoria: editingOption.category || 'tecnologia',
          precio_base: Number(editingOption.basePrice) || 0,
          descripcion: editingOption.description.trim(),
          activo: editingOption.activo !== false,
        });
      }

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
      const nextActivo = target.activo === false ? true : false;
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

  const toggleFeatureModule = (optName: string) => {
    const currentLines = newPlan.features.split('\n').map(l => l.trim()).filter(Boolean);
    const exists = currentLines.some(l => l.toLowerCase() === optName.toLowerCase() || l.toLowerCase().includes(optName.toLowerCase()));
    let nextLines: string[];
    if (exists) {
      nextLines = currentLines.filter(l => l.toLowerCase() !== optName.toLowerCase() && !l.toLowerCase().includes(optName.toLowerCase()));
    } else {
      nextLines = [...currentLines, optName];
    }
    setNewPlan({ ...newPlan, features: nextLines.join('\n') });
  };

  const getPlanFeatures = (plan: any): string[] => {
    if (Array.isArray(plan.caracteristicas)) return plan.caracteristicas;
    if (plan.caracteristicas?.features) return plan.caracteristicas.features;
    return [];
  };

  const reloadPlanes = async () => {
    try {
      setPlanes(await planesApi.getAll(true));
    } catch {}
  };

  const openCreatePlan = () => {
    setEditingPlanId(null);
    setNewPlan({ nombre: '', precio: '', tipo_id: tiposServicio[0]?.id || '', desc: '', features: '' });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      nombre: plan.nombre || '',
      precio: plan.precio != null ? String(parseFloat(plan.precio)) : '',
      tipo_id: plan.tipo_servicio_id || tiposServicio[0]?.id || '',
      desc: plan.descripcion || '',
      features: getPlanFeatures(plan).join('\n'),
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.nombre || !newPlan.precio || !newPlan.tipo_id) {
      showToast('Campos requeridos', 'Completa nombre, precio y tipo.', 'error');
      return;
    }
    const data = {
      nombre: newPlan.nombre,
      precio: parseFloat(newPlan.precio),
      tipo_servicio_id: newPlan.tipo_id,
      descripcion: newPlan.desc,
      caracteristicas: newPlan.features.split('\n').map(f => f.trim()).filter(Boolean),
    };
    try {
      if (editingPlanId) {
        await planesApi.update(editingPlanId, data);
        showToast('Plan Actualizado', 'Los cambios del plan fueron guardados.', 'success');
      } else {
        await planesApi.create(data);
        showToast('Plan Creado', 'El plan ha sido registrado.', 'success');
      }
      setShowPlanModal(false);
      setEditingPlanId(null);
      setNewPlan({ nombre: '', precio: '', tipo_id: tiposServicio[0]?.id || '', desc: '', features: '' });
      reloadPlanes();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // El backend no borra planes (tienen solicitudes y carritos asociados): los desactiva y dejan de mostrarse
  const handleTogglePlan = async (plan: any) => {
    try {
      if (plan.activo) {
        if (!window.confirm(`¿Quitar el plan "${plan.nombre}"? Dejará de mostrarse a los clientes.`)) return;
        await planesApi.delete(plan.id);
        showToast('Plan Quitado', `"${plan.nombre}" ya no es visible para los clientes.`, 'success');
      } else {
        await planesApi.update(plan.id, { activo: true });
        showToast('Plan Reactivado', `"${plan.nombre}" vuelve a estar visible.`, 'success');
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
      showToast('Error', err.message || 'No se pudo actualizar el plan recomendado.', 'error');
    }
  };

  const allComentarios = useMemo(() => {
    const apiIds = new Set(comentarios.map(c => c.id));
    const fromContent = contentTestimonials.map(t => ({
      id: t.id,
      usuario: { nombres: t.name, empresa: t.company },
      contenido: t.text,
      calificacion: t.rating,
      mostrar_en_pagina: t.status === 'approved',
      isLocal: true,
    }));
    return [...comentarios, ...fromContent.filter(f => !apiIds.has(f.id))];
  }, [comentarios, contentTestimonials]);

  const handleToggleComentario = async (id: string, current: boolean) => {
    try {
      if (id.startsWith('tst-')) {
        if (current) {
          removeTestimonial(id);
          showToast('Testimonio Ocultado', 'Se removió del carrusel de la página de inicio.', 'info');
        } else {
          approveTestimonial(id);
          showToast('Testimonio Publicado', 'Ahora es visible en la página de inicio.', 'success');
        }
        return;
      }
      await comentariosApi.toggleMostrar(id, !current);
      setComentarios(prev => prev.map(c => c.id === id ? { ...c, mostrar_en_pagina: !current } : c));
      showToast('Testimonio', !current ? 'Publicado en la web' : 'Ocultado de la web', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar comentario', 'error');
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.client.trim()) {
      showToast('Campos requeridos', 'Ingresa título y cliente del proyecto', 'error');
      return;
    }
    const tagsArray = newProject.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    addProject({
      title: newProject.title.trim(),
      client: newProject.client.trim(),
      category: newProject.category,
      year: newProject.year || new Date().getFullYear().toString(),
      description: newProject.description.trim(),
      imageUrl: newProject.imageUrl.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ['Estrategia', 'Wuish'],
    });
    showToast('Proyecto Agregado', `"${newProject.title}" ya es visible en el Portafolio del inicio.`, 'success');
    setNewProject({
      title: '',
      client: '',
      category: 'tecnologia',
      year: new Date().getFullYear().toString(),
      description: '',
      tags: '',
      imageUrl: '',
    });
  };

  const handleDeleteProject = (id: string, title: string) => {
    removeProject(id);
    showToast('Proyecto Eliminado', `"${title}" fue removido del portafolio.`, 'info');
  };

  const handleDeleteComentario = async (id: string) => {
    try {
      if (id.startsWith('tst-')) {
        removeTestimonial(id);
      } else {
        await comentariosApi.delete(id);
        setComentarios(prev => prev.filter(c => c.id !== id));
      }
      showToast('Testimonio Eliminado', 'Se removió el testimonio.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo eliminar el testimonio', 'error');
    }
  };

  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) {
      showToast('Campos requeridos', 'Ingresa el nombre del cliente y el contenido.', 'error');
      return;
    }
    addTestimonial({
      name: newTestimonial.name.trim(),
      company: newTestimonial.company.trim() || 'Cliente Wuish',
      rating: Number(newTestimonial.rating) || 5,
      text: newTestimonial.text.trim(),
    });
    setNewTestimonial({ name: '', company: '', rating: 5, text: '' });
    setShowNewTestimonialForm(false);
    showToast('Testimonio Publicado', 'Se añadió al carrusel de la página de inicio.', 'success');
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

    // BOM + CRLF ensure correct accents and columns when opening the file in Excel.
    // Excel en configuraciones regionales hispanas usa punto y coma como separador.
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

  const filteredSolicitudes = solicitudes.filter(r => {
    const t = searchTerm.toLowerCase();
    return (
      (r.usuario?.nombres || '').toLowerCase().includes(t) ||
      (r.usuario?.correo || '').toLowerCase().includes(t) ||
      (r.tipo || '').toLowerCase().includes(t) ||
      (r.descripcion || '').toLowerCase().includes(t)
    );
  });

  // Paginación y límites por sección
  const SOLICITUDES_PER_PAGE = 8;
  const PLANES_PER_PAGE = 6;
  const COTIZADOR_PER_PAGE = 8;
  const RESULTADOS_PER_PAGE = 6;
  const TESTIMONIOS_PER_PAGE = 6;

  const [solicitudesPage, setSolicitudesPage] = useState(1);
  const [planesPage, setPlanesPage] = useState(1);
  const [cotizadorPage, setCotizadorPage] = useState(1);
  const [resultadosPage, setResultadosPage] = useState(1);
  const [testimoniosPage, setTestimoniosPage] = useState(1);

  // Control de límites de página al filtrar o eliminar elementos
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredSolicitudes.length / SOLICITUDES_PER_PAGE));
    if (solicitudesPage > maxPage) setSolicitudesPage(maxPage);
  }, [filteredSolicitudes.length, solicitudesPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(planes.length / PLANES_PER_PAGE));
    if (planesPage > maxPage) setPlanesPage(maxPage);
  }, [planes.length, planesPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(cotizadorOptions.length / COTIZADOR_PER_PAGE));
    if (cotizadorPage > maxPage) setCotizadorPage(maxPage);
  }, [cotizadorOptions.length, cotizadorPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(projects.length / RESULTADOS_PER_PAGE));
    if (resultadosPage > maxPage) setResultadosPage(maxPage);
  }, [projects.length, resultadosPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(allComentarios.length / TESTIMONIOS_PER_PAGE));
    if (testimoniosPage > maxPage) setTestimoniosPage(maxPage);
  }, [allComentarios.length, testimoniosPage]);

  // Listados paginados memorizados
  const paginatedSolicitudes = useMemo(() => {
    const start = (solicitudesPage - 1) * SOLICITUDES_PER_PAGE;
    return filteredSolicitudes.slice(start, start + SOLICITUDES_PER_PAGE);
  }, [filteredSolicitudes, solicitudesPage]);

  const paginatedPlanes = useMemo(() => {
    const start = (planesPage - 1) * PLANES_PER_PAGE;
    return planes.slice(start, start + PLANES_PER_PAGE);
  }, [planes, planesPage]);

  const paginatedCotizador = useMemo(() => {
    const start = (cotizadorPage - 1) * COTIZADOR_PER_PAGE;
    return cotizadorOptions.slice(start, start + COTIZADOR_PER_PAGE);
  }, [cotizadorOptions, cotizadorPage]);

  const paginatedProjects = useMemo(() => {
    const start = (resultadosPage - 1) * RESULTADOS_PER_PAGE;
    return projects.slice(start, start + RESULTADOS_PER_PAGE);
  }, [projects, resultadosPage]);

  const paginatedComentarios = useMemo(() => {
    const start = (testimoniosPage - 1) * TESTIMONIOS_PER_PAGE;
    return allComentarios.slice(start, start + TESTIMONIOS_PER_PAGE);
  }, [allComentarios, testimoniosPage]);

  const kpis = [
    { label: 'Total Solicitudes', val: solicitudes.length, color: 'text-white' },
    { label: 'Pendientes', val: solicitudes.filter(s => s.estado === 'pendiente').length, color: 'text-[#ffd56d]' },
    { label: 'Mensajes Clientes', val: conversations.length, color: 'text-sky-400' },
    { label: 'Proyectos Inicio', val: projects.length, color: 'text-amber-400' },
    { label: 'Testimonios', val: allComentarios.length, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 font-display">
            ADMIN MASTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            Panel Administrativo Global WUISH
          </h1>
          <p className="text-xs text-[#9a907c] mt-0.5">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#1c1b1d] border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-[#9a907c] font-bold font-display block">{k.label}</span>
            <div className={`text-2xl sm:text-3xl font-extrabold mt-1 font-display ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-2 bg-[#1c1b1d] border border-white/5 p-1.5 rounded-2xl overflow-x-auto">
        {[
          { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList, count: solicitudes.length },
          { id: 'mensajes', label: 'Mensajes de Clientes', icon: MessageSquare, count: conversations.reduce((a, c) => a + c.unreadCount, 0) },
          { id: 'planes', label: 'Planes (Plantillas)', icon: CreditCard, count: planes.filter(p => p.activo).length },
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
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${active ? 'bg-black/20 text-[#3e2e00]' : 'bg-white/10 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: Solicitudes */}
      {activeTab === 'solicitudes' && (
        <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Solicitudes Registradas</h3>
              <p className="text-xs text-[#9a907c]">Monitoreo y cambio de estado de servicios.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, correo, tipo..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setSolicitudesPage(1);
                }}
                className="pl-9 pr-4 py-2 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:border-[#ffd56d] focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
                <tr>
                  <th className="pb-3 pr-4">Código</th>
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Descripción</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSolicitudes.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No hay solicitudes registradas.</td></tr>
                ) : (
                  paginatedSolicitudes.map(r => (
                    <tr key={r.id} className="hover:bg-[#201f21]/70 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">#{r.id?.slice(0, 8)}</td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white">{r.usuario?.nombres} {r.usuario?.apellidos}</div>
                        <div className="text-[11px] text-[#9a907c]">{r.usuario?.correo}</div>
                        {(r.empresa || r.usuario?.empresa) && (
                          <div className="text-[10px] text-[#ffd56d] font-medium mt-0.5">
                            🏢 {r.empresa || r.usuario?.empresa}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="capitalize text-[#d1c5af] font-semibold">{r.tipo}</div>
                        {r.plan?.nombre && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd56d]/15 text-[#ffd56d] font-bold border border-[#ffd56d]/20 inline-block mt-0.5">
                            {r.plan.nombre}
                          </span>
                        )}
                        {r.presupuesto_min && r.presupuesto_max && (
                          <div className="text-[10px] font-mono text-[#ffd56d] font-bold mt-1">
                            ${Number(r.presupuesto_min).toLocaleString()} - ${Number(r.presupuesto_max).toLocaleString()} USD
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 max-w-xs truncate text-[#d1c5af]">{r.descripcion || '—'}</td>
                      <td className="py-3.5 pr-4 text-[#9a907c]">{new Date(r.created_at).toLocaleDateString('es-CO')}</td>
                      <td className="py-3.5 text-right">
                        <select
                          value={r.estado}
                          onChange={e => handleStatusChange(r.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#201f21] border border-white/10 text-[11px] font-semibold text-[#ffd56d] focus:outline-none cursor-pointer"
                        >
                          {ESTADOS.map(st => (
                            <option key={st} value={st}>{st.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={solicitudesPage}
            totalItems={filteredSolicitudes.length}
            itemsPerPage={SOLICITUDES_PER_PAGE}
            onPageChange={setSolicitudesPage}
            itemName="solicitudes"
          />
        </div>
      )}

      {/* TAB: Mensajes */}
      {activeTab === 'mensajes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 rounded-2xl bg-[#1c1b1d] border border-white/5 p-4 space-y-3">
            <h3 className="text-sm font-bold text-white font-display">Bandeja de Clientes</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchMsgTerm}
                onChange={e => setSearchMsgTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ffd56d]"
              />
            </div>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9a907c]">Sin mensajes.</div>
              ) : (
                filteredConversations.map(conv => (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedClientId(conv.userId)}
                    className={`p-3 rounded-xl transition cursor-pointer border ${
                      conv.userId === selectedClientId
                        ? 'bg-[#ffd56d]/15 border-[#ffd56d]/40 text-white'
                        : 'bg-[#201f21] border-transparent hover:border-white/10 text-[#d1c5af]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{conv.userName}</span>
                      <span className="text-[10px] text-[#9a907c]">{conv.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-[#9a907c] truncate mt-1">{conv.lastMessage}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-8 rounded-2xl bg-[#1c1b1d] border border-white/5 p-5 flex flex-col h-[560px]">
            {activeClient ? (
              <>
                <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeClient.userName}</h4>
                    <span className="text-[11px] text-[#9a907c]">{activeClient.userEmail}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#ffd56d]/10 text-[#ffd56d] font-semibold border border-[#ffd56d]/30">
                    {activeChatMessages.length} mensajes
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {activeChatMessages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.es_admin ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[10px] font-semibold mb-1 ${m.es_admin ? 'text-[#ffd56d]' : 'text-zinc-400'}`}>
                        {m.es_admin ? 'Equipo WUISH (Tú)' : activeClient.userName}
                      </span>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        m.es_admin
                          ? 'bg-[#ffd56d] text-[#3e2e00] font-medium rounded-tr-none'
                          : 'bg-[#201f21] text-[#e5e1e4] border border-white/5 rounded-tl-none'
                      }`}>
                        {m.contenido}
                      </div>
                      <span className="text-[9px] text-[#9a907c] mt-0.5">
                        {new Date(m.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendReply} className="pt-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    placeholder={`Responder a ${activeClient.userName}...`}
                    className="flex-1 bg-[#0e0e10] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-4 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingReply ? '...' : 'Enviar'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-[#9a907c] text-xs">
                Selecciona una conversación para responder.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CMS */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          {/* Header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1c1b1d] border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ffd56d]" />
                <h3 className="text-xl font-bold text-white font-display">Identidad & CMS Institucional</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Personaliza la narrativa de marca, el eslogan del Hero y las tarjetas de Visión y Misión mostradas públicamente en la plataforma.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-semibold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
              Sincronizado con la Landing
            </div>
          </div>

          {/* Grid Layout: 7 cols Formulario + 5 cols Vista Previa en Vivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Formulario de Edición */}
            <form onSubmit={handleSaveCms} className="lg:col-span-7 space-y-4">
              {/* Eslogan Card */}
              <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                    <Sparkles className="w-4 h-4 text-[#ffd56d]" />
                    Eslogan Principal (Hero)
                  </label>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    Portada de Inicio
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Subtítulo de alto impacto visual debajo del titular animado en el Hero de bienvenida.
                </p>
                <textarea
                  rows={2}
                  value={cms.slogan}
                  onChange={e => setCms({ ...cms, slogan: e.target.value })}
                  placeholder="Ecosistema integral que fusiona tecnología de punta y comunicación estratégica..."
                  className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs leading-relaxed transition-colors"
                />
              </div>

              {/* Visión Card */}
              <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                    <Eye className="w-4 h-4 text-[#ffd56d]" />
                    Visión Corporativa
                  </label>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    Tarjeta 01
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Proyección a futuro y aspiración de impacto que guía la dirección estratégica de Wuish.
                </p>
                <textarea
                  rows={3}
                  value={cms.vision}
                  onChange={e => setCms({ ...cms, vision: e.target.value })}
                  placeholder="Creemos en la velocidad, en el código robusto y en historias memorables..."
                  className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs leading-relaxed transition-colors"
                />
              </div>

              {/* Misión Card */}
              <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-2 hover:border-[#ffd56d]/20 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
                    <Target className="w-4 h-4 text-[#ffd56d]" />
                    Misión y Propósito
                  </label>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    Tarjeta 02
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  El compromiso fundamental de valor entregado a clientes y organizaciones aliadas.
                </p>
                <textarea
                  rows={3}
                  value={cms.mision}
                  onChange={e => setCms({ ...cms, mision: e.target.value })}
                  placeholder="Potenciar a negocios y líderes corporativos con soluciones digitales vanguardistas..."
                  className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d] text-xs leading-relaxed transition-colors"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingCms}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ffd56d]/15 hover:shadow-[#ffd56d]/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingCms ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>

            {/* Columna Derecha: Vista Previa en Vivo */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#ffd56d]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Vista Previa en Vivo
                    </span>
                  </div>
                  <span className="text-[10px] text-[#ffd56d] bg-[#ffd56d]/10 border border-[#ffd56d]/20 px-2 py-0.5 rounded-full font-semibold">
                    Así se ve en la web
                  </span>
                </div>

                {/* Previsualización 1: Hero Subtitle */}
                <div className="p-4 rounded-xl bg-[#0e0e10] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider block">
                    1. Hero (Portada)
                  </span>
                  <div className="text-sm font-extrabold text-white font-display leading-tight">
                    Convertimos tus <span className="text-[#ffd56d]">marcas</span> en crecimiento.
                  </div>
                  <p className="text-xs text-[#d1c5af] font-light italic border-l-2 border-[#ffd56d]/60 pl-2.5 py-0.5 mt-1 leading-relaxed">
                    {cms.slogan || <span className="text-zinc-600">(Sin eslogan definido)</span>}
                  </p>
                </div>

                {/* Previsualización 2: Tarjetas Institucionales */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-wider block">
                    2. Tarjetas Institucionales
                  </span>

                  {/* Tarjeta Visión */}
                  <div className="p-4 rounded-xl bg-[#121113] border border-[#ffd56d]/30 relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-[9px] font-bold uppercase tracking-wider mb-2">
                      <span className="w-1 h-1 rounded-full bg-[#ffd56d] animate-pulse" />
                      Nuestra Visión
                    </div>
                    <p className="text-white text-xs leading-relaxed font-light italic">
                      "{cms.vision || 'Sin visión especificada...'}"
                    </p>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Wuish Visión</span>
                      <span className="text-[#ffd56d] font-bold">01</span>
                    </div>
                  </div>

                  {/* Tarjeta Misión */}
                  <div className="p-4 rounded-xl bg-[#121113] border border-white/10 relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#d1c5af] text-[9px] font-bold uppercase tracking-wider mb-2">
                      <span className="w-1 h-1 rounded-full bg-[#ffd56d]" />
                      Nuestra Misión
                    </div>
                    <p className="text-[#d1c5af] text-xs leading-relaxed">
                      {cms.mision || 'Sin misión especificada...'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Wuish Propósito</span>
                      <span className="text-[#ffd56d] font-bold">02</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Resultados & Portafolio */}
      {activeTab === 'resultados' && (
        <div className="space-y-6">
          {/* SECCIÓN 1: Portafolio de Proyectos (Inicio) */}
          <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#ffd56d]" />
                  <h3 className="text-lg font-bold text-white font-display">Portafolio: "Proyectos en los que participamos"</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd56d]/15 text-[#ffd56d]">
                    {projects.length} en el inicio
                  </span>
                </div>
                <p className="text-xs text-[#9a907c] mt-1">
                  Administra los casos de éxito y proyectos que se exhiben en el carrusel de la página de inicio.
                </p>
              </div>
            </div>

            {/* Formulario Agregar Proyecto */}
            <form onSubmit={handleCreateProject} className="p-4 rounded-xl bg-[#171618] border border-white/5 space-y-3 text-xs">
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
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
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
                    onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                    placeholder="Ej: Nexo Capital"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
                  <select
                    value={newProject.category}
                    onChange={e => setNewProject({ ...newProject, category: e.target.value as any })}
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
                    onChange={e => setNewProject({ ...newProject, year: e.target.value })}
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
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Breve explicación de la solución implementada..."
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={newProject.tags}
                    onChange={e => setNewProject({ ...newProject, tags: e.target.value })}
                    placeholder="Next.js, Cloud, BI"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">URL de Portada (Opcional)</label>
                  <input
                    type="url"
                    value={newProject.imageUrl}
                    onChange={e => setNewProject({ ...newProject, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar en Portafolio del Inicio</span>
                </button>
              </div>
            </form>

            {/* Listado de Proyectos Activos en el Inicio */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProjects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex flex-col justify-between text-xs space-y-3 group hover:border-[#ffd56d]/30 transition">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#ffd56d]">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-[#9a907c]">{p.client} · {p.year}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{p.title}</h4>
                    <p className="text-[11px] text-[#d1c5af] leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {p.tags?.map((t: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#9a907c]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Visible en Inicio
                    </span>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.title)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer flex items-center gap-1"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={resultadosPage}
              totalItems={projects.length}
              itemsPerPage={RESULTADOS_PER_PAGE}
              onPageChange={setResultadosPage}
              itemName="proyectos"
            />
          </div>

          {/* SECCIÓN 2: Métricas de Impacto (Cifras del Inicio) */}
          <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#ffd56d]" />
                  <h3 className="text-lg font-bold text-white font-display">Métricas de Impacto (Cifras del Inicio)</h3>
                </div>
                <p className="text-xs text-[#9a907c] mt-1">
                  Son los contadores animados que aparecen en la barra estadística de la página de inicio (ej: 120+ Proyectos, 98% Retención).
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStat} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="number"
                required
                value={newStatItem.value}
                onChange={e => setNewStatItem({ ...newStatItem, value: e.target.value })}
                placeholder="Valor (ej: 150)"
                className="bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
              <input
                type="text"
                value={newStatItem.suffix}
                onChange={e => setNewStatItem({ ...newStatItem, suffix: e.target.value })}
                placeholder="Sufijo (ej: +, %, x, h)"
                className="bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
              />
              <input
                type="text"
                required
                value={newStatItem.label}
                onChange={e => setNewStatItem({ ...newStatItem, label: e.target.value })}
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
              {stats.map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-xl font-black text-white font-display">
                      {s.value}{s.suffix}
                    </span>
                    <span className="text-[11px] text-[#9a907c] block uppercase tracking-wider">{s.label}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteStat(s.id, s.label)}
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
      )}

      {/* TAB: Comentarios & Testimonios */}
      {activeTab === 'comentarios' && (
        <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Testimonios de Clientes</h3>
              <p className="text-xs text-[#9a907c]">Modera qué testimonios se publican en el carrusel de la página de inicio o agrega nuevas reseñas de clientes.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] text-xs font-bold">
                {allComentarios.length} Registrados
              </span>
              <button
                type="button"
                onClick={() => setShowNewTestimonialForm(!showNewTestimonialForm)}
                className="px-3.5 py-1.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewTestimonialForm ? 'Cerrar Formulario' : 'Nuevo Testimonio'}</span>
              </button>
            </div>
          </div>

          {/* Formulario Crear Testimonio */}
          {showNewTestimonialForm && (
            <form onSubmit={handleCreateTestimonial} className="p-4 rounded-xl bg-[#201f21] border border-[#ffd56d]/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase tracking-wider text-[#ffd56d]">Nuevo Testimonio Corporativo</span>
                <button type="button" onClick={() => setShowNewTestimonialForm(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Nombre del Cliente / Representante</label>
                  <input
                    type="text"
                    required
                    value={newTestimonial.name}
                    onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    placeholder="Ej: Mariana Silva"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Empresa o Cargo</label>
                  <input
                    type="text"
                    value={newTestimonial.company}
                    onChange={e => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                    placeholder="Ej: Directora de Operaciones, NovaPay"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Calificación (Estrellas)</label>
                  <select
                    value={newTestimonial.rating}
                    onChange={e => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 5 })}
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
                  onChange={e => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  placeholder="Describe la experiencia de trabajo con Wuish y los resultados obtenidos..."
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewTestimonialForm(false)}
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
            {paginatedComentarios.map(c => (
              <div key={c.id} className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex items-start justify-between gap-4 text-xs group hover:border-[#ffd56d]/20 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{c.usuario?.nombres || 'Cliente Wuish'}</span>
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
                    onClick={() => handleToggleComentario(c.id, c.mostrar_en_pagina)}
                    className={`p-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 ${
                      c.mostrar_en_pagina ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                    title={c.mostrar_en_pagina ? 'Visible en Inicio' : 'Oculto'}
                  >
                    {c.mostrar_en_pagina ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-[10px] font-semibold">{c.mostrar_en_pagina ? 'Visible' : 'Oculto'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteComentario(c.id)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                    title="Eliminar testimonio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={testimoniosPage}
            totalItems={allComentarios.length}
            itemsPerPage={TESTIMONIOS_PER_PAGE}
            onPageChange={setTestimoniosPage}
            itemName="testimonios"
          />
        </div>
      )}

      {/* TAB: Planes */}
      {activeTab === 'planes' && (
        <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Gestión de Planes</h3>
              <p className="text-xs text-[#9a907c]">
                Administra precios, descripciones y características. Los cambios aquí actualizan automáticamente tanto la vista de Planes como las soluciones del Cotizador Dinámico.
              </p>
            </div>
            <button
              onClick={openCreatePlan}
              className="px-4 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Plan</span>
            </button>
          </div>

          {planes.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#9a907c]">No hay planes registrados todavía.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedPlanes.map(plan => {
                  const features = getPlanFeatures(plan);
                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-2xl border flex flex-col gap-3 transition ${
                        plan.id === recomendadoPlanId
                          ? 'bg-[#201f21] border-[#ffd56d] shadow-lg shadow-[#ffd56d]/10'
                          : plan.activo
                          ? 'bg-[#201f21] border-white/10'
                          : 'bg-[#161617] border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-wider font-display">
                            {plan.tipo_servicio?.nombre || 'Plan'}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate">{plan.nombre}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {plan.id === recomendadoPlanId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ffd56d] text-[#3e2e00] border border-[#ffd56d] shadow-sm flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-[#3e2e00]" />
                              Recomendado
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              plan.activo
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                            }`}
                          >
                            {plan.activo ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xl font-extrabold text-white font-display">
                        {plan.precio != null ? `$${parseFloat(plan.precio).toLocaleString('es-CO')}` : 'Personalizado'}
                        {plan.precio != null && <span className="text-[10px] text-[#9a907c] font-semibold ml-1">COP</span>}
                      </div>

                      <p className="text-xs text-[#9a907c] line-clamp-2 min-h-[32px]">{plan.descripcion || 'Sin descripción'}</p>
                      <span className="text-[11px] text-[#d1c5af]">{features.length} {features.length === 1 ? 'característica' : 'características'}</span>

                      <div className="space-y-2 pt-3 mt-auto border-t border-white/5">
                        <button
                          onClick={() => handleSetRecomendado(plan)}
                          disabled={plan.id === recomendadoPlanId}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                            plan.id === recomendadoPlanId
                              ? 'bg-[#ffd56d]/15 text-[#ffd56d] border-[#ffd56d]/40 font-bold cursor-default'
                              : 'bg-[#252427] hover:bg-[#ffd56d] hover:text-[#3e2e00] text-[#d1c5af] border-white/5'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${plan.id === recomendadoPlanId ? 'fill-[#ffd56d]' : ''}`} />
                          <span>{plan.id === recomendadoPlanId ? '★ Plan Recomendado Oficial' : 'Fijar como Recomendado'}</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditPlan(plan)}
                            className="flex-1 py-2 rounded-lg bg-[#2a2a2c] hover:bg-[#353437] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleTogglePlan(plan)}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                              plan.activo
                                ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                            }`}
                          >
                            {plan.activo ? <Trash2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {plan.activo ? 'Quitar' : 'Reactivar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={planesPage}
                totalItems={planes.length}
                itemsPerPage={PLANES_PER_PAGE}
                onPageChange={setPlanesPage}
                itemName="planes"
              />
            </>
          )}
        </div>
      )}

      {/* TAB: Opciones del Cotizador */}
      {activeTab === 'cotizador_admin' && (
        <div className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ffd56d]" />
                <h3 className="text-lg font-bold text-white font-display">Módulos &amp; Opciones del Cotizador</h3>
              </div>
              <p className="text-xs text-[#9a907c] mt-1 max-w-2xl">
                Gestiona y añade los servicios y capacidades disponibles en el Cotizador Dinámico. Estas opciones sirven además como características para estructurar los Planes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateOption}
              className="px-4 py-2 rounded-xl bg-[#ffd56d] hover:bg-[#ffe082] text-[#3e2e00] text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md shadow-[#ffd56d]/10"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Módulo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {paginatedCotizador.map((opt) => {
              const isVisible = opt.activo !== false;
              return (
                <div
                  key={opt.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    isVisible
                      ? 'bg-[#201f21] border-white/5 hover:border-white/20'
                      : 'bg-[#181719] border-amber-500/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-[#ffd56d] font-mono tracking-wider">
                          {opt.category === 'comunicacion' ? 'Comunicación' : 'Tecnología'}
                        </span>
                        {!isVisible && (
                          <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Oculto
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-[#ffd56d] font-mono">
                        ${opt.basePrice} USD
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{opt.name}</h4>
                    <p className="text-xs text-[#9a907c] mt-1.5 leading-relaxed line-clamp-2">
                      {opt.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleOptionVisibility(opt.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                          isVisible
                            ? 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
                            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                        }`}
                        title={isVisible ? 'Ocultar módulo del cotizador' : 'Hacer visible el módulo en el cotizador'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{isVisible ? 'Visible' : 'Oculto'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOption(opt.id, opt.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition cursor-pointer border border-red-500/20"
                        title="Eliminar módulo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditOption(opt)}
                      className="px-3 py-1.5 rounded-lg bg-[#ffd56d]/15 hover:bg-[#ffd56d]/25 text-[#ffd56d] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-[#ffd56d]/30"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={cotizadorPage}
            totalItems={cotizadorOptions.length}
            itemsPerPage={COTIZADOR_PER_PAGE}
            onPageChange={setCotizadorPage}
            itemName="módulos"
          />
        </div>
      )}

      {/* Modal: Editar Opción del Cotizador */}
      {showOptionModal && editingOption && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">
                {isCreatingOption ? 'Añadir Nuevo Módulo al Cotizador' : 'Editar Módulo del Cotizador'}
              </h3>
              <button onClick={() => setShowOptionModal(false)} className="text-[#9a907c] hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveOption} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nombre del Servicio / Módulo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Infraestructura Cloud & DevOps"
                  value={editingOption.name}
                  onChange={e => setEditingOption({ ...editingOption, name: e.target.value })}
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Precio Base (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingOption.basePrice}
                    onChange={e => setEditingOption({ ...editingOption, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={editingOption.category}
                    onChange={e => setEditingOption({ ...editingOption, category: e.target.value as any })}
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  >
                    <option value="tecnologia">Tecnología</option>
                    <option value="comunicacion">Comunicación</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Descripción corta</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Breve descripción de las tecnologías o alcance..."
                  value={editingOption.description}
                  onChange={e => setEditingOption({ ...editingOption, description: e.target.value })}
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="opt_activo"
                  checked={editingOption.activo !== false}
                  onChange={e => setEditingOption({ ...editingOption, activo: e.target.checked })}
                  className="accent-[#ffd56d] w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="opt_activo" className="text-zinc-300 font-semibold cursor-pointer select-none text-xs">
                  Visible en el Cotizador (desmarcar para ocultar a los clientes)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOptionModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingOption}
                  className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingOption ? 'Guardando...' : isCreatingOption ? 'Añadir Módulo' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">{editingPlanId ? 'Editar Plan (Plantilla)' : 'Nuevo Plan Corporativo'}</h3>
                <p className="text-[11px] text-[#9a907c] mt-0.5">Define los módulos del cotizador que componen este paquete.</p>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="text-[#9a907c] hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newPlan.nombre}
                  onChange={e => setNewPlan({ ...newPlan, nombre: e.target.value })}
                  placeholder="Ej: Plan Enterprise Growth"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Precio (USD/COP)</label>
                  <input
                    type="number"
                    required
                    value={newPlan.precio}
                    onChange={e => setNewPlan({ ...newPlan, precio: e.target.value })}
                    placeholder="1200"
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Tipo de Servicio</label>
                  <select
                    value={newPlan.tipo_id}
                    onChange={e => setNewPlan({ ...newPlan, tipo_id: e.target.value })}
                    className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                  >
                    {tiposServicio.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newPlan.desc}
                  onChange={e => setNewPlan({ ...newPlan, desc: e.target.value })}
                  placeholder="Alcance del plan..."
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              {/* Características del Plan (Módulos del Cotizador) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-zinc-300 font-semibold">
                    Características del Plan (Módulos del Cotizador):
                  </label>
                  <span className="text-[11px] text-[#ffd56d] font-mono font-semibold">
                    {newPlan.features.split('\n').filter(Boolean).length} seleccionados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-[#0e0e10] border border-white/10 max-h-60 overflow-y-auto">
                  {cotizadorOptions.map((opt) => {
                    const isChecked = newPlan.features
                      .split('\n')
                      .map((l) => l.trim().toLowerCase())
                      .filter(Boolean)
                      .some((l) => l === opt.name.toLowerCase() || l.includes(opt.name.toLowerCase()));
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs cursor-pointer border transition select-none ${
                          isChecked
                            ? 'bg-[#ffd56d]/15 border-[#ffd56d]/50 text-white'
                            : 'bg-[#181719] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFeatureModule(opt.name)}
                          className="accent-[#ffd56d] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="truncate flex-1 font-medium">{opt.name}</span>
                        {opt.activo === false && (
                          <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                            Oculto
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-[#ffd56d]">${opt.basePrice}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold cursor-pointer">{editingPlanId ? 'Guardar Cambios' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
