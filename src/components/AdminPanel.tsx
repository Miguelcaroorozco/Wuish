import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { useContent } from '../context/ContentContext';
import {
  planesApi,
  tiposServicioApi,
  solicitudesApi,
  infoGeneralApi,
  comentariosApi,
  resultadosApi,
  mensajesApi,
} from '../lib/api';
import {
  Search,
  Trash2,
  Save,
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
  Tag,
  FolderOpen,
} from 'lucide-react';

const ESTADOS = ['pendiente', 'en_revision', 'en_proceso', 'aprobada', 'finalizada'] as const;

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

  const [activeTab, setActiveTab] = useState<'solicitudes' | 'mensajes' | 'cms' | 'resultados' | 'comentarios'>('solicitudes');

  // Data states
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchMsgTerm, setSearchMsgTerm] = useState('');

  // CMS state
  const [cms, setCms] = useState({ slogan: '', manifesto: '', mision: '' });
  const [savingCms, setSavingCms] = useState(false);

  // Planes state
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ nombre: '', precio: '', tipo_id: '', desc: '', features: '' });

  // Testimonios & Resultados state
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [newRes, setNewRes] = useState({ titulo: '', descripcion: '' });
  const [savingRes, setSavingRes] = useState(false);

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
      const [sol, info, tipos, com, res, msg] = await Promise.allSettled([
        solicitudesApi.getAll(),
        infoGeneralApi.getAll(),
        tiposServicioApi.getAll(),
        comentariosApi.getAll(),
        resultadosApi.getAll(true),
        mensajesApi.getAll(),
      ]);

      if (sol.status === 'fulfilled') setSolicitudes(sol.value);
      if (tipos.status === 'fulfilled') {
        setTiposServicio(tipos.value);
        if (tipos.value.length > 0) setNewPlan(p => ({ ...p, tipo_id: tipos.value[0].id }));
      }
      if (com.status === 'fulfilled') setComentarios(com.value);
      if (res.status === 'fulfilled') setResultados(res.value);
      if (msg.status === 'fulfilled') {
        setAllMessages(msg.value);
        if (msg.value.length > 0 && !selectedClientId) {
          setSelectedClientId(msg.value[0].usuario_id || null);
        }
      }
      if (info.status === 'fulfilled') {
        const list = info.value as any[];
        const getSec = (k: string) => list.find((i: any) => i.seccion === k)?.contenido || '';
        setCms({ slogan: getSec('slogan'), manifesto: getSec('manifesto'), mision: getSec('mision') });
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
        infoGeneralApi.upsert('manifesto', cms.manifesto),
        infoGeneralApi.upsert('mision', cms.mision),
      ]);
      showToast('CMS Guardado', 'Información corporativa actualizada.', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setSavingCms(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.nombre || !newPlan.precio || !newPlan.tipo_id) {
      showToast('Campos requeridos', 'Completa nombre, precio y tipo.', 'error');
      return;
    }
    try {
      await planesApi.create({
        nombre: newPlan.nombre,
        precio: parseFloat(newPlan.precio),
        tipo_servicio_id: newPlan.tipo_id,
        descripcion: newPlan.desc,
        caracteristicas: newPlan.features.split('\n').filter(Boolean),
      });
      showToast('Plan Creado', 'El plan ha sido registrado.', 'success');
      setShowPlanModal(false);
      setNewPlan({ nombre: '', precio: '', tipo_id: tiposServicio[0]?.id || '', desc: '', features: '' });
    } catch (err: any) {
      showToast('Error', err.message, 'error');
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

  const handleCreateResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.titulo) return;
    setSavingRes(true);
    try {
      const created = await resultadosApi.create({ ...newRes });
      setResultados(prev => [created, ...prev]);
      setNewRes({ titulo: '', descripcion: '' });
      showToast('Métrica Agregada', 'Publicada en la landing.', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setSavingRes(false);
    }
  };

  const handleDeleteResultado = async (id: string) => {
    try {
      await resultadosApi.delete(id);
      setResultados(prev => prev.filter(r => r.id !== id));
      showToast('Métrica Eliminada', 'Removida exitosamente.', 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Cliente', 'Email', 'Tipo', 'Estado', 'Descripción'],
      ...solicitudes.map(r => [
        r.id?.slice(0, 8),
        `${r.usuario?.nombres || ''} ${r.usuario?.apellidos || ''}`,
        r.usuario?.correo || '',
        r.tipo,
        r.estado,
        `"${(r.descripcion || '').replace(/"/g, '""')}"`,
      ]),
    ];
    const blob = new Blob([rows.map(e => e.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `solicitudes_wuish_${Date.now()}.csv`;
    link.click();
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
            onClick={() => setShowPlanModal(true)}
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
                onChange={e => setSearchTerm(e.target.value)}
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
                  filteredSolicitudes.map(r => (
                    <tr key={r.id} className="hover:bg-[#201f21]/70 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">#{r.id?.slice(0, 8)}</td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white">{r.usuario?.nombres} {r.usuario?.apellidos}</div>
                        <div className="text-[11px] text-[#9a907c]">{r.usuario?.correo}</div>
                      </td>
                      <td className="py-3.5 pr-4 capitalize text-[#d1c5af]">{r.tipo}</td>
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
        <form onSubmit={handleSaveCms} className="p-6 rounded-2xl bg-[#1c1b1d] border border-white/5 space-y-4 max-w-2xl text-xs">
          <h3 className="text-lg font-bold text-white font-display">CMS Institucional</h3>
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Eslogan Principal</label>
            <input
              type="text"
              value={cms.slogan}
              onChange={e => setCms({ ...cms, slogan: e.target.value })}
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Manifiesto</label>
            <textarea
              rows={3}
              value={cms.manifesto}
              onChange={e => setCms({ ...cms, manifesto: e.target.value })}
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Misión</label>
            <textarea
              rows={2}
              value={cms.mision}
              onChange={e => setCms({ ...cms, mision: e.target.value })}
              className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
            />
          </div>
          <button
            type="submit"
            disabled={savingCms}
            className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingCms ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
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
              {projects.map((p) => (
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
            {allComentarios.map(c => (
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
        </div>
      )}

      {/* Modal: Crear Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">Nuevo Plan Corporativo</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-[#9a907c] hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3">
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
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Características (una por línea)</label>
                <textarea
                  rows={3}
                  value={newPlan.features}
                  onChange={e => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Característica 1&#10;Característica 2"
                  className="w-full bg-[#0e0e10] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffd56d]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold cursor-pointer">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
