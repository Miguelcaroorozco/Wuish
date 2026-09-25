import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { solicitudesApi, mensajesApi, usuariosApi } from '../lib/api';
import {
  Wallet,
  MessageSquareText,
  ShieldCheck,
  Send,
  PlusCircle,
  FolderKanban,
  CreditCard,
  Calculator,
  User,
  Tag
} from 'lucide-react';

export type DashboardTab = 'resumen' | 'solicitudes' | 'mensajes' | 'cotizacion' | 'ajustes';

interface ClientDashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  onNavigateToCotizador?: () => void;
  onOpenReport?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
  onNavigateToCotizador,
  onOpenReport
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [internalTab, setInternalTab] = useState<DashboardTab>('resumen');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const setActiveTab = (tab: DashboardTab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const mainChatBottomRef = useRef<HTMLDivElement>(null);

  // Modal nueva solicitud
  const [showNewReqModal, setShowNewReqModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqType, setNewReqType] = useState('cotizacion');
  const [newReqDesc, setNewReqDesc] = useState('');

  // Ajustes de cuenta
  const [ajustesNombres, setAjustesNombres] = useState(user?.nombres || '');
  const [ajustesApellidos, setAjustesApellidos] = useState(user?.apellidos || '');
  const [ajustesTelefono, setAjustesTelefono] = useState(user?.telefono || '');
  const [ajustesSaving, setAjustesSaving] = useState(false);

  // Cotización subview
  const [cotizadorSubview, setCotizadorSubview] = useState<'planes' | 'cotizador'>('planes');

  useEffect(() => {
    loadData();

    const pollInterval = setInterval(async () => {
      try {
        const msgs = await mensajesApi.getMine();
        if (Array.isArray(msgs)) setMessages(msgs);
      } catch {}
    }, 4000);

    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as DashboardTab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('wuish:openDashboardTab', handler);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('wuish:openDashboardTab', handler);
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    mainChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [solData, msgData] = await Promise.allSettled([
        solicitudesApi.getMine(),
        mensajesApi.getMine(),
      ]);
      if (solData.status === 'fulfilled') setSolicitudes(solData.value);
      if (msgData.status === 'fulfilled' && Array.isArray(msgData.value)) {
        setMessages(msgData.value);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const filteredSolicitudes = solicitudes.filter((item) => {
    if (filterStatus === 'Todas') return true;
    return item.estado === filterStatus;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setChatInput('');
    try {
      const newMsg = await mensajesApi.send({
        contenido: trimmed,
        asunto: 'Mensaje desde dashboard',
      });
      setMessages((prev) => [...prev, newMsg]);
      showToast('Mensaje Enviado', 'Su mensaje ha sido enviado al equipo.', 'info');
    } catch (err: any) {
      setChatInput(trimmed);
      showToast('Error', err.message || 'No se pudo enviar el mensaje', 'error');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;

    try {
      const newSol = await solicitudesApi.create({
        tipo: newReqType,
        descripcion: `${newReqTitle}${newReqDesc ? ' — ' + newReqDesc : ''}`,
      });
      setSolicitudes((prev) => [newSol, ...prev]);
      setShowNewReqModal(false);
      setNewReqTitle('');
      setNewReqDesc('');
      showToast('Solicitud Creada', 'Tu solicitud ha sido registrada exitosamente.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear la solicitud', 'error');
    }
  };

  const handleSaveAjustes = async (e: React.FormEvent) => {
    e.preventDefault();
    setAjustesSaving(true);
    try {
      await usuariosApi.updateMe({
        nombres: ajustesNombres,
        apellidos: ajustesApellidos,
        telefono: ajustesTelefono,
      });
      showToast('Ajustes guardados', 'Tu información de perfil fue actualizada.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setAjustesSaving(false);
    }
  };

  const kpis = [
    {
      title: 'Operaciones Activas',
      value: solicitudes.length.toString().padStart(2, '0'),
      unit: 'registradas',
      detail: `${solicitudes.filter((s) => s.estado !== 'finalizada').length} en curso`,
      icon: FolderKanban,
      color: 'text-[#ffd56d]',
    },
    {
      title: 'Presupuesto en Solicitudes',
      value: solicitudes.length > 0
        ? `$${solicitudes.reduce((acc, s) => acc + (s.plan?.precio ? parseFloat(s.plan.precio) : 0), 0).toLocaleString()}`
        : '$0',
      unit: 'USD',
      detail: '100% auditado',
      icon: Wallet,
      color: 'text-[#ffd56d]',
    },
    {
      title: 'Comunicaciones',
      value: messages.length.toString().padStart(2, '0'),
      unit: 'mensajes',
      detail: 'Canal Activo',
      icon: MessageSquareText,
      color: 'text-[#ffd56d]',
    },
    {
      title: 'Estado Global SLA',
      value: '100%',
      unit: 'Activo',
      detail: 'En tiempo y forma',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-300">

      {/* ===== TAB: RESUMEN ===== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Greeting Banner */}
          <div className="relative rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#ffd56d]/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#353437]/80 border border-[#ffd56d]/30 text-xs font-semibold text-[#ffd56d]">
                    <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
                    Cuenta Corporativa
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e5e1e4] font-display tracking-tight">
                    Hola, {user?.nombres || 'Usuario'}
                  </h1>
                  <p className="text-sm text-[#d1c5af] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-white font-medium capitalize">{user?.rol || 'Cliente'}</span>
                    <span className="text-[#9a907c]">—</span>
                    <span className="text-[#ffd56d] font-medium">{user?.correo}</span>
                    <span className="text-[#9a907c]">•</span>
                    <span className="text-zinc-300">SLA Garantizado (100%)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewReqModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition shadow-lg shadow-[#ffd56d]/15 flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 text-[#3e2e00]" />
                  <span>Nueva Solicitud Estratégica</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:border-[#ffd56d]/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-[#9a907c] font-medium block">{kpi.title}</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-3xl font-extrabold font-display ${kpi.color}`}>
                          {kpi.value}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">{kpi.unit}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-[#ffd56d]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#d1c5af]">
                    <span>{kpi.detail}</span>
                    <span className="text-[#9a907c]">Portal Wuish</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Two Columns: Requests vs Live Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Solicitudes e Historial */}
            <div className="lg:col-span-8 rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    Mis Solicitudes e Historial
                  </h3>
                  <p className="text-xs text-[#d1c5af] mt-0.5">
                    Trazabilidad en tiempo real de requerimientos ejecutivos
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#131315] rounded-xl border border-white/5 text-xs">
                  {['Todas', 'En Proceso', 'En Revisión', 'Aprobada'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        filterStatus === st
                          ? 'bg-[#ffd56d] text-[#3e2e00] font-bold shadow-sm'
                          : 'text-[#d1c5af] hover:text-white'
                      }`}
                    >
                      {st === 'Todas' ? `Todas (${solicitudes.length})` : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="pb-3 pr-4">Código</th>
                      <th className="pb-3 pr-4">Servicio Solicitado</th>
                      <th className="pb-3 pr-4">Fecha</th>
                      <th className="pb-3 pr-4">Plan</th>
                      <th className="pb-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSolicitudes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          <p className="text-sm font-semibold text-white">No hay requerimientos activos</p>
                          <p className="text-xs text-[#9a907c] mt-1">Haz clic en &quot;Nueva Solicitud Estratégica&quot; para registrar un proyecto.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSolicitudes.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#201f21]/70 transition-colors group cursor-pointer"
                          onClick={() => showToast('Solicitud', `${item.tipo} — ${item.descripcion || 'Sin descripción'}`)}
                        >
                          <td className="py-4 pr-4 font-mono font-bold text-[#ffd56d]">
                            #{item.id?.slice(0, 8)}
                          </td>
                          <td className="py-4 pr-4">
                            <div className="font-semibold text-white text-sm group-hover:text-[#ffd56d] transition-colors">
                              {item.tipo}
                            </div>
                            <div className="text-[11px] text-[#9a907c] mt-0.5">
                              {item.descripcion || 'Sin descripción'}
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-[#d1c5af] whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-4 pr-4">
                            <span className="px-2.5 py-1 rounded bg-[#201f21] border border-white/5 text-zinc-300 font-medium">
                              {item.plan?.nombre || '—'}
                            </span>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                                item.estado === 'en_proceso'
                                  ? 'bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30'
                                  : item.estado === 'en_revision' || item.estado === 'pendiente'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {item.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Live Chat Console */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl flex flex-col h-[580px]">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-[#ffd56d]" />
                    <h4 className="text-sm font-bold text-white font-display">
                      Buzón Rápido &amp; Conversación
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30">
                    {messages.length} {messages.length === 1 ? 'Mensaje' : 'Mensajes'}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                      <MessageSquareText className="w-8 h-8 text-[#ffd56d]/60 mb-2" />
                      <p className="text-sm font-semibold text-white">Canal de Asesoría Directa</p>
                      <p className="text-xs text-[#9a907c] mt-1 max-w-xs">
                        Envía un mensaje para comunicarte directamente con el equipo técnico y estratégico asignado.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isFromMe = !msg.es_admin;
                      const senderName = msg.es_admin ? 'Equipo WUISH' : (user?.nombres || 'Tú');
                      const messageTime = msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const content = msg.contenido || msg.text || '';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-[11px] ${isFromMe ? 'text-[#ffd56d]' : 'text-amber-400'}`}>
                              {senderName}
                            </span>
                            {messageTime && <span className="text-[10px] text-[#9a907c]">{messageTime}</span>}
                          </div>
                          <div
                            className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                              isFromMe
                                ? 'bg-[#ffd56d] text-[#3e2e00] font-medium rounded-tr-none shadow-sm'
                                : 'bg-[#201f21] text-[#e5e1e4] border border-[#ffd56d]/20 rounded-tl-none'
                            }`}
                          >
                            {content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe un mensaje para tu equipo asignado..."
                    className="flex-1 bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== TAB: SOLICITUDES ===== */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Solicitudes &amp; Requerimientos</h2>
              <p className="text-xs text-[#9a907c] mt-0.5">Gestiona tus cotizaciones y solicitudes de servicio.</p>
            </div>
            <button
              onClick={() => setShowNewReqModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-[#ffdf97] transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Solicitud</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase font-semibold text-[#9a907c] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="pb-3 pr-4">Código</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Descripción</th>
                    <th className="pb-3 pr-4">Fecha</th>
                    <th className="pb-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#9a907c]">No tienes solicitudes registradas.</td>
                    </tr>
                  ) : (
                    solicitudes.map((s) => (
                      <tr key={s.id} className="hover:bg-[#201f21]/70">
                        <td className="py-3 pr-4 font-mono font-bold text-[#ffd56d]">#{s.id?.slice(0, 8)}</td>
                        <td className="py-3 pr-4 font-semibold text-white capitalize">{s.tipo}</td>
                        <td className="py-3 pr-4 text-[#d1c5af]">{s.descripcion || '—'}</td>
                        <td className="py-3 pr-4 text-[#9a907c]">{new Date(s.created_at).toLocaleDateString('es-CO')}</td>
                        <td className="py-3 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30 capitalize">
                            {s.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: MENSAJES ===== */}
      {activeTab === 'mensajes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Buzón de Mensajes</h2>
            <p className="text-xs text-[#9a907c] mt-0.5">Comunicación directa con el equipo WUISH.</p>
          </div>

          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#9a907c]">
                  <MessageSquareText className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">No hay mensajes aún. Inicia la conversación.</p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isFromMe = !msg.es_admin;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isFromMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isFromMe ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm' : 'bg-[#2a2a2c] text-[#ffd56d] border border-[#ffd56d]/30'
                      }`}>
                        {isFromMe ? (user?.nombres?.charAt(0) || 'U') : 'W'}
                      </div>
                      <div className="max-w-[75%]">
                        <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isFromMe
                            ? 'bg-[#ffd56d] text-[#3e2e00] font-medium rounded-tr-sm shadow-sm'
                            : 'bg-[#201f21] text-[#e5e1e4] border border-white/10 rounded-tl-sm'
                        }`}>
                          {msg.contenido || msg.text}
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isFromMe ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-[#ffd56d] font-semibold">{isFromMe ? 'Tú' : 'Equipo WUISH'}</span>
                          <span className="text-[10px] text-[#9a907c]">• {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={mainChatBottomRef} />
            </div>
            <div className="border-t border-white/5 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe tu mensaje al equipo WUISH..."
                  className="flex-1 bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-[#ffdf97] transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: PLANES & COTIZACIÓN ===== */}
      {activeTab === 'cotizacion' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCotizadorSubview('planes')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${cotizadorSubview === 'planes' ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#1c1b1d] text-[#9a907c] border border-white/10 hover:text-white'}`}
            >
              Ver Planes
            </button>
            <button
              onClick={() => setCotizadorSubview('cotizador')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${cotizadorSubview === 'cotizador' ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#1c1b1d] text-[#9a907c] border border-white/10 hover:text-white'}`}
            >
              Cotizador
            </button>
          </div>
          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-8 text-center">
            {cotizadorSubview === 'planes' ? (
              <div>
                <CreditCard className="w-10 h-10 text-[#ffd56d] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Planes Disponibles</h3>
                <p className="text-xs text-[#9a907c] mb-4">Explora los planes y soluciones de inversión corporativa.</p>
                <button
                  onClick={() => onNavigateToCotizador && onNavigateToCotizador()}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97] transition"
                >
                  Abrir Catálogo de Planes
                </button>
              </div>
            ) : (
              <div>
                <Calculator className="w-10 h-10 text-[#ffd56d] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Cotizador Inteligente</h3>
                <p className="text-xs text-[#9a907c] mb-4">Calcula presupuestos y alcances según requerimientos de software y pauta.</p>
                <button
                  onClick={() => onNavigateToCotizador && onNavigateToCotizador()}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97] transition"
                >
                  Abrir Cotizador en Vivo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: AJUSTES DE CUENTA ===== */}
      {activeTab === 'ajustes' && (
        <div className="space-y-4 animate-in fade-in duration-200 max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Ajustes de Cuenta</h2>
            <p className="text-xs text-[#9a907c] mt-0.5">Modifica tu información de registro y datos de contacto.</p>
          </div>

          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider">Correo</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-white/5 text-xs text-[#9a907c]">
                  <User className="w-4 h-4" />
                  <span>{user?.correo}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider">Documento</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-white/5 text-xs text-[#9a907c]">
                  <Tag className="w-4 h-4" />
                  <span>{user?.tipo_documento} — {user?.numero_cedula}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <form onSubmit={handleSaveAjustes} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Nombres</label>
                  <input
                    type="text"
                    value={ajustesNombres}
                    onChange={(e) => setAjustesNombres(e.target.value)}
                    placeholder="Tus nombres"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Apellidos</label>
                  <input
                    type="text"
                    value={ajustesApellidos}
                    onChange={(e) => setAjustesApellidos(e.target.value)}
                    placeholder="Tus apellidos"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#e5e1e4]">Teléfono</label>
                <input
                  type="text"
                  value={ajustesTelefono}
                  onChange={(e) => setAjustesTelefono(e.target.value)}
                  placeholder="Número de contacto"
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={ajustesSaving}
                className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {ajustesSaving ? 'Guardando...' : 'Guardar Ajustes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Solicitud Estratégica */}
      {showNewReqModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white font-display">
                Nueva Solicitud Estratégica
              </h3>
              <button
                onClick={() => setShowNewReqModal(false)}
                className="text-[#9a907c] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
                  Título del Requerimiento *
                </label>
                <input
                  type="text"
                  required
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  placeholder="Título o nombre del requerimiento..."
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
                  Tipo de Solicitud *
                </label>
                <select
                  value={newReqType}
                  onChange={(e) => setNewReqType(e.target.value)}
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                >
                  <option value="cotizacion">Cotización</option>
                  <option value="soporte">Soporte Técnico</option>
                  <option value="desarrollo">Desarrollo</option>
                  <option value="consultoria">Consultoría</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
                  Alcance y Especificaciones Técnicas
                </label>
                <textarea
                  rows={3}
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  placeholder="Describe la necesidad técnica o metas del negocio..."
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReqModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs shadow-md"
                >
                  Registrar Requerimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
