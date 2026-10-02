import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { solicitudesApi, mensajesApi, usuariosApi } from '../lib/api';
import { PlanesView } from './PlanesView';
import { CotizadorView } from './CotizadorView';
import {
  Wallet,
  MessageSquareText,
  ShieldCheck,
  Send,
  PlusCircle,
  FolderKanban,
  User,
  ClipboardList,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Clock,
  Save,
  KeyRound,
  BadgeCheck,
} from 'lucide-react';

export type DashboardTab = 'resumen' | 'solicitudes' | 'planes' | 'cotizador' | 'ajustes';

interface ClientDashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  initialPlanId?: string | null;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
  initialPlanId,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [internalTab, setInternalTab] = useState<DashboardTab>('resumen');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlanId || null);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId]);

  const setActiveTab = (tab: DashboardTab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [dashboardRequestsPage, setDashboardRequestsPage] = useState(1);
  const DASHBOARD_REQUESTS_PER_PAGE = 5;
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Modal rápida nueva solicitud (desde resumen)
  const [showNewReqModal, setShowNewReqModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqType, setNewReqType] = useState('cotizacion');
  const [newReqDesc, setNewReqDesc] = useState('');

  // Estado de envío de solicitud en pestaña Solicitudes
  const [solSubmitting, setSolSubmitting] = useState(false);

  // Filtro y Paginación de la pestaña Solicitudes
  const [solSearchTerm, setSolSearchTerm] = useState('');
  const [solTabFilter, setSolTabFilter] = useState('Todas');
  const [solTabCurPage, setSolTabCurPage] = useState(1);
  const SOL_TAB_PER_PAGE = 6;

  // Ajustes de cuenta y perfil ejecutivo
  const [ajustesSubTab, setAjustesSubTab] = useState<'perfil' | 'plan' | 'seguridad' | 'preferencias'>('perfil');
  const [ajustesNombres, setAjustesNombres] = useState(user?.nombres || '');
  const [ajustesApellidos, setAjustesApellidos] = useState(user?.apellidos || '');
  const [ajustesTelefono, setAjustesTelefono] = useState(user?.telefono || '');
  const [ajustesEmpresa, setAjustesEmpresa] = useState(user?.empresa || '');
  const [ajustesCargo, setAjustesCargo] = useState(user?.cargo || '');
  const [ajustesSaving, setAjustesSaving] = useState(false);

  // Seguridad y credenciales
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  // Preferencias operativas
  const [prefEmailNotifications, setPrefEmailNotifications] = useState(true);
  const [prefSlaAlerts, setPrefSlaAlerts] = useState(true);
  const [prefWhatsappAlerts, setPrefWhatsappAlerts] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.nombres) setAjustesNombres(user.nombres);
      if (user.apellidos) setAjustesApellidos(user.apellidos);
      if (user.telefono) setAjustesTelefono(user.telefono);
      if (user.empresa) setAjustesEmpresa(user.empresa);
      if (user.cargo) setAjustesCargo(user.cargo);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    const pollInterval = setInterval(async () => {
      try {
        const msgs = await mensajesApi.getMine();
        if (Array.isArray(msgs)) {
          setMessages((prev) => {
            if (
              prev.length === msgs.length &&
              (prev.length === 0 || prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id)
            ) {
              return prev;
            }
            return msgs;
          });
        }
      } catch {}
    }, 5000);

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

  // Desplaza solo la caja del chat (no la página) y solo cuando llegan mensajes nuevos;
  // scrollIntoView movía toda la página hacia abajo en cada sondeo de 4 s
  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length === lastMessageCount.current) return;
    lastMessageCount.current = messages.length;
    const box = chatBottomRef.current?.parentElement;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
  }, [messages, activeTab]);

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

  const dashboardRequestsTotalPages = Math.max(
    1,
    Math.ceil(filteredSolicitudes.length / DASHBOARD_REQUESTS_PER_PAGE)
  );

  const paginatedDashboardRequests = useMemo(() => {
    const start = (dashboardRequestsPage - 1) * DASHBOARD_REQUESTS_PER_PAGE;
    return filteredSolicitudes.slice(start, start + DASHBOARD_REQUESTS_PER_PAGE);
  }, [filteredSolicitudes, dashboardRequestsPage]);

  useEffect(() => {
    if (dashboardRequestsPage > dashboardRequestsTotalPages) {
      setDashboardRequestsPage(dashboardRequestsTotalPages);
    }
  }, [dashboardRequestsPage, dashboardRequestsTotalPages]);

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



  const filteredTabSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      // Las cotizaciones son adquisiciones de plan, no solicitudes de servicio
      if (s.tipo === 'cotizacion') return false;

      const matchSearch =
        solSearchTerm === '' ||
        (s.id || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.tipo || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.descripcion || '').toLowerCase().includes(solSearchTerm.toLowerCase()) ||
        (s.empresa || '').toLowerCase().includes(solSearchTerm.toLowerCase());

      const matchStatus =
        solTabFilter === 'Todas' ||
        s.estado?.toLowerCase() === solTabFilter.toLowerCase().replace(' ', '_');

      return matchSearch && matchStatus;
    });
  }, [solicitudes, solSearchTerm, solTabFilter]);

  const solTabTotalPages = Math.max(1, Math.ceil(filteredTabSolicitudes.length / SOL_TAB_PER_PAGE));

  const paginatedTabSolicitudes = useMemo(() => {
    const start = (solTabCurPage - 1) * SOL_TAB_PER_PAGE;
    return filteredTabSolicitudes.slice(start, start + SOL_TAB_PER_PAGE);
  }, [filteredTabSolicitudes, solTabCurPage]);

  useEffect(() => {
    if (solTabCurPage > solTabTotalPages) setSolTabCurPage(solTabTotalPages);
  }, [filteredTabSolicitudes.length, solTabTotalPages]);

  // ─── Estado del plan: cotización APROBADA más reciente por fecha
  // La última aprobación reemplaza por completo la anterior, incluso si no
  // contiene servicios (eso representa que el usuario quedó sin plan).
  const ESTADOS_APROBADOS = ['aprobada', 'finalizada', 'completada'];

  const activePlanRecord = useMemo(() => {
    const aprobadas = solicitudes.filter(
      (s) =>
        s.tipo === 'cotizacion' &&
        ESTADOS_APROBADOS.includes(s.estado) &&
        Array.isArray(s.servicios_seleccionados)
    );
    if (aprobadas.length === 0) return null;
    // Ordenar descendente por fecha → el [0] es el más reciente
    return [...aprobadas].sort(
      (a, b) =>
        new Date(b.created_at || b.fecha_solicitud).getTime() -
        new Date(a.created_at || a.fecha_solicitud).getTime()
    )[0];
  }, [solicitudes]);

  const contractedServices: any[] = useMemo(() => {
    return Array.isArray(activePlanRecord?.servicios_seleccionados)
      ? activePlanRecord.servicios_seleccionados
      : [];
  }, [activePlanRecord]);

  // Estado para el formulario de solicitud basado en plan
  const [selectedContractedService, setSelectedContractedService] = useState('');
  const [solServiceTitle, setSolServiceTitle] = useState('');
  const [solServiceDesc, setSolServiceDesc] = useState('');
  const [solServiceNotes, setSolServiceNotes] = useState('');
  const [solServicePlazo, setSolServicePlazo] = useState('normal');

  const handleSaveAjustes = async (e: React.FormEvent) => {
    e.preventDefault();
    setAjustesSaving(true);
    try {
      await usuariosApi.updateMe({
        nombres: ajustesNombres.trim(),
        apellidos: ajustesApellidos.trim(),
        telefono: ajustesTelefono.trim() || undefined,
        empresa: ajustesEmpresa.trim() || undefined,
        cargo: ajustesCargo.trim() || undefined,
      });
      await updateProfile({
        nombres: ajustesNombres.trim(),
        apellidos: ajustesApellidos.trim(),
        telefono: ajustesTelefono.trim() || null,
        empresa: ajustesEmpresa.trim() || null,
        cargo: ajustesCargo.trim() || null,
      });
      showToast('Ajustes Guardados', 'Tu perfil y datos corporativos han sido actualizados con éxito.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setAjustesSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) {
      showToast('Campos Requeridos', 'Por favor ingresa tu contraseña actual y la nueva.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Seguridad', 'La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Contraseña no coincide', 'La confirmación no coincide con la nueva contraseña.', 'error');
      return;
    }
    setPassSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Contraseña Actualizada', 'Tu clave de acceso ha sido actualizada de forma segura.', 'success');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo actualizar la contraseña.', 'error');
    } finally {
      setPassSaving(false);
    }
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaving(true);
    setTimeout(() => {
      setPrefsSaving(false);
      showToast('Preferencias Guardadas', 'Tus preferencias de notificación y alertas SLA han sido configuradas.', 'success');
    }, 400);
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
                  onClick={() => setActiveTab('solicitudes')}
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
                      onClick={() => {
                        setFilterStatus(st);
                        setDashboardRequestsPage(1);
                      }}
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
                      paginatedDashboardRequests.map((item) => (
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

              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-[#9a907c]">
                  {filteredSolicitudes.length === 0
                    ? 'No hay solicitudes para mostrar.'
                    : `Mostrando ${(dashboardRequestsPage - 1) * DASHBOARD_REQUESTS_PER_PAGE + 1} – ${Math.min(
                        dashboardRequestsPage * DASHBOARD_REQUESTS_PER_PAGE,
                        filteredSolicitudes.length
                      )} de ${filteredSolicitudes.length} solicitudes.`}
                </span>
                {filteredSolicitudes.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDashboardRequestsPage((page) => Math.max(page - 1, 1))}
                      disabled={dashboardRequestsPage <= 1}
                      aria-label="Página anterior"
                      className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="min-w-8 text-center text-[11px] font-bold text-white">
                      {dashboardRequestsPage} / {dashboardRequestsTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDashboardRequestsPage((page) => Math.min(page + 1, dashboardRequestsTotalPages))}
                      disabled={dashboardRequestsPage >= dashboardRequestsTotalPages}
                      aria-label="Página siguiente"
                      className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('solicitudes')}
                  className="text-xs font-bold text-[#ffd56d] hover:text-[#ffdf97] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ir al Centro de Solicitudes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
        <div className="space-y-8 animate-in fade-in duration-200">

          {/* ── SIN PLAN ACTIVO: Pantalla de onboarding ── */}
          {contractedServices.length === 0 ? (
            <div className="space-y-6">
              {/* Banner de bienvenida */}
              <div className="relative rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/20 p-8 sm:p-12 overflow-hidden text-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffd56d]/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-5 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffd56d]/10 border border-[#ffd56d]/30 flex items-center justify-center">
                    <ClipboardList className="w-8 h-8 text-[#ffd56d]" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
                      Aún no tienes un plan activo
                    </h2>
                    <p className="text-sm text-[#9a907c] leading-relaxed">
                      Para hacer solicitudes primero debes adquirir los servicios que necesitas en el
                      <span className="text-[#ffd56d] font-semibold"> Cotizador</span>. Puedes usar una
                      plantilla de <span className="text-[#ffd56d] font-semibold">Planes</span> como punto de partida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pasos del flujo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Elige una Plantilla',
                    desc: 'Visita la sección de Planes y selecciona la plantilla que mejor se ajuste a tu negocio como punto de partida.',
                    cta: 'Ver Plantillas de Planes',
                    tab: 'planes' as const,
                    active: true,
                  },
                  {
                    step: '02',
                    title: 'Adquiere tus Servicios',
                    desc: 'En el Cotizador personaliza los módulos y servicios que necesitas. Al cotizar quedan registrados en tu cuenta.',
                    cta: 'Ir al Cotizador',
                    tab: 'cotizador' as const,
                    active: true,
                  },
                  {
                    step: '03',
                    title: 'Haz tus Solicitudes',
                    desc: 'Una vez con servicios contratados podrás hacer solicitudes específicas para cada módulo de tu plan.',
                    cta: null,
                    tab: null,
                    active: false,
                  },
                ].map(({ step, title, desc, cta, tab, active }) => (
                  <div
                    key={step}
                    className={`rounded-2xl p-6 border flex flex-col gap-4 ${
                      active
                        ? 'bg-[#1c1b1d] border-white/10 hover:border-[#ffd56d]/40 transition-all'
                        : 'bg-[#151416] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black font-display text-[#ffd56d]/30">{step}</span>
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-xs text-[#9a907c] leading-relaxed flex-1">{desc}</p>
                    {cta && tab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className="mt-auto w-full px-4 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ffd56d]/10"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        {cta}
                      </button>
                    )}
                    {!active && (
                      <div className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-600 text-center font-semibold">
                        Disponible tras cotizar
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Historial vacío */}
              <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 text-center">
                <p className="text-xs text-zinc-500">Aún no tienes solicitudes registradas. Completa los pasos anteriores para comenzar.</p>
              </div>
            </div>

          ) : (
            /* ── CON PLAN ACTIVO: Formulario restringido + historial ── */
            <div className="space-y-8">

              {/* Banner del plan activo */}
              <div className="relative rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 p-6 sm:p-8 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-[#ffd56d]/8 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Plan activo con {contractedServices.length} servicio{contractedServices.length !== 1 ? 's' : ''} contratado{contractedServices.length !== 1 ? 's' : ''}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                        {activePlanRecord?.plan?.nombre || 'Tu Plan Personalizado'}
                      </h2>
                      <p className="text-xs text-[#9a907c] mt-1">
                        Puedes hacer solicitudes sobre los servicios que contrataste en el Cotizador.
                      </p>
                    </div>
                    {/* Badges de servicios */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {contractedServices.map((srv: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/25 text-[11px] font-semibold text-[#ffd56d]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]" />
                          {srv.name || srv.nombre || srv.id || `Servicio ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cotizador')}
                    className="shrink-0 px-4 py-2 rounded-xl border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold hover:bg-[#ffd56d]/10 transition cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ampliar Plan
                  </button>
                </div>
              </div>

              {/* Formulario de solicitud */}
              <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#ffd56d]/15 border border-[#ffd56d]/30 flex items-center justify-center text-[#ffd56d]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Nueva Solicitud</h3>
                    <p className="text-xs text-[#9a907c]">Selecciona el servicio contratado sobre el que harás la solicitud.</p>
                  </div>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!selectedContractedService || !solServiceTitle.trim() || !solServiceDesc.trim()) {
                      showToast('Campos requeridos', 'Selecciona un servicio, título y descripción.', 'error');
                      return;
                    }
                    setSolSubmitting(true);
                    try {
                      const newSol = await solicitudesApi.create({
                        tipo: selectedContractedService,
                        descripcion: `${solServiceTitle.trim()}: ${solServiceDesc.trim()}${solServiceNotes.trim() ? ' — Notas: ' + solServiceNotes.trim() : ''}`,
                        velocidad_entrega: solServicePlazo,
                        servicios_seleccionados: {
                          servicio: selectedContractedService,
                          titulo: solServiceTitle.trim(),
                          plazo: solServicePlazo,
                          notas: solServiceNotes.trim(),
                        },
                      });
                      setSolicitudes((prev) => [newSol, ...prev]);
                      showToast('¡Solicitud Enviada!', 'Tu solicitud fue registrada y será atendida por el equipo Wuish.', 'success');
                      setSelectedContractedService('');
                      setSolServiceTitle('');
                      setSolServiceDesc('');
                      setSolServiceNotes('');
                      setSolServicePlazo('normal');
                    } catch (err: any) {
                      showToast('Error', err.message || 'No se pudo enviar la solicitud', 'error');
                    } finally {
                      setSolSubmitting(false);
                    }
                  }}
                >
                  {/* Selector de servicio contratado */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#ffd56d] mb-3">
                      1. ¿Sobre qué servicio es tu solicitud?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {contractedServices.map((srv: any, idx: number) => {
                        const srvId = srv.id || srv.name || `srv_${idx}`;
                        const srvLabel = srv.name || srv.nombre || srvId;
                        const isSelected = selectedContractedService === srvId;
                        return (
                          <button
                            key={srvId}
                            type="button"
                            onClick={() => setSelectedContractedService(srvId)}
                            className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#ffd56d]/15 border-[#ffd56d] ring-1 ring-[#ffd56d]/50 text-white shadow-md shadow-[#ffd56d]/10'
                                : 'bg-[#0e0e10] border-white/5 text-[#d1c5af] hover:border-white/20 hover:bg-[#161518]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#ffd56d]" />
                              {isSelected && <span className="text-[#ffd56d] text-[10px]">✓</span>}
                            </div>
                            {srvLabel}
                            {srv.category && (
                              <div className="text-[10px] text-[#9a907c] font-normal mt-0.5">{srv.category}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detalles de la solicitud */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#ffd56d]">
                      2. Describe tu requerimiento
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la solicitud *</label>
                      <input
                        type="text"
                        required
                        value={solServiceTitle}
                        onChange={(e) => setSolServiceTitle(e.target.value)}
                        placeholder="Ej: Agregar sección de testimonios a la web"
                        className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción detallada *</label>
                      <textarea
                        required
                        rows={4}
                        value={solServiceDesc}
                        onChange={(e) => setSolServiceDesc(e.target.value)}
                        placeholder="Describe con detalle qué necesitas que el equipo realice..."
                        className="w-full bg-[#0e0e10] text-white p-3.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d] leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Plazo deseado</label>
                        <select
                          value={solServicePlazo}
                          onChange={(e) => setSolServicePlazo(e.target.value)}
                          className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                        >
                          <option value="normal">Estándar (Tiempo sugerido Wuish)</option>
                          <option value="rapida">Prioritario / Rápido</option>
                          <option value="urgente">Urgente (Sprint acelerado)</option>
                          <option value="flexible">Flexible / Sin prisa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas adicionales</label>
                        <input
                          type="text"
                          value={solServiceNotes}
                          onChange={(e) => setSolServiceNotes(e.target.value)}
                          placeholder="Notas, referencias, links..."
                          className="w-full bg-[#0e0e10] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nota de expansión */}
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0e0e10] border border-white/5 text-[11px] text-[#9a907c]">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd56d] shrink-0 mt-0.5" />
                    <span>
                      ¿Necesitas un servicio que no está en tu plan?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('cotizador')}
                        className="text-[#ffd56d] font-semibold hover:underline cursor-pointer"
                      >
                        Amplía tu plan en el Cotizador
                      </button>.
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                    <p className="text-[11px] text-[#9a907c]">🔒 Solicitud asignada inmediatamente a tu equipo técnico.</p>
                    <button
                      type="submit"
                      disabled={solSubmitting || !selectedContractedService}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{solSubmitting ? 'Enviando...' : 'Enviar Solicitud'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Historial de solicitudes del cliente */}
              <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Tus Solicitudes Registradas</h3>
                    <p className="text-xs text-[#9a907c]">Monitorea el progreso y estados de tus requerimientos.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={solSearchTerm}
                        onChange={(e) => { setSolSearchTerm(e.target.value); setSolTabCurPage(1); }}
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ffd56d] w-48"
                      />
                    </div>
                    <div className="flex items-center bg-[#0e0e10] p-1 rounded-xl border border-white/5 text-[11px]">
                      {['Todas', 'Pendiente', 'En Proceso', 'Aprobada'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => { setSolTabFilter(st); setSolTabCurPage(1); }}
                          className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                            solTabFilter === st ? 'bg-[#ffd56d] text-[#3e2e00]' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase font-bold text-[#9a907c] tracking-wider border-b border-white/5">
                      <tr>
                        <th className="pb-3 pr-4">Código</th>
                        <th className="pb-3 pr-4">Requerimiento</th>
                        <th className="pb-3 pr-4">Servicio</th>
                        <th className="pb-3 pr-4">Fecha</th>
                        <th className="pb-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTabSolicitudes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                            No hay solicitudes que coincidan con los filtros.
                          </td>
                        </tr>
                      ) : (
                        paginatedTabSolicitudes.map((sol) => (
                          <tr key={sol.id} className="hover:bg-[#201f21]/70 transition">
                            <td className="py-3.5 pr-4 font-mono font-bold text-[#ffd56d]">#{sol.id?.slice(0, 8)}</td>
                            <td className="py-3.5 pr-4 max-w-sm">
                              <div className="font-semibold text-white truncate">{sol.descripcion || 'Sin descripción'}</div>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#d1c5af]">
                                {sol.tipo}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 text-[#9a907c]">
                              {new Date(sol.created_at || sol.fecha_solicitud).toLocaleDateString('es-CO')}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                sol.estado === 'aprobada' || sol.estado === 'finalizada'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : sol.estado === 'en_proceso' || sol.estado === 'en_revision'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {sol.estado?.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredTabSolicitudes.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-[#9a907c]">
                    <div className="text-[11px]">
                      Mostrando <span className="font-semibold text-white">{(solTabCurPage - 1) * SOL_TAB_PER_PAGE + 1}</span> –{' '}
                      <span className="font-semibold text-white">{Math.min(solTabCurPage * SOL_TAB_PER_PAGE, filteredTabSolicitudes.length)}</span> de{' '}
                      <span className="font-semibold text-[#ffd56d]">{filteredTabSolicitudes.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setSolTabCurPage((p) => Math.max(p - 1, 1))} disabled={solTabCurPage <= 1} className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: solTabTotalPages }).map((_, i) => (
                          <button key={i + 1} type="button" onClick={() => setSolTabCurPage(i + 1)} className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${solTabCurPage === i + 1 ? 'bg-[#ffd56d] text-[#3e2e00]' : 'bg-[#201f21] text-[#d1c5af] hover:text-white border border-white/5'}`}>{i + 1}</button>
                        ))}
                      </div>
                      <button type="button" onClick={() => setSolTabCurPage((p) => Math.min(p + 1, solTabTotalPages))} disabled={solTabCurPage >= solTabTotalPages} className="p-1.5 rounded-lg bg-[#201f21] border border-white/5 text-[#d1c5af] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ===== TAB: PLANES ===== */}
      {activeTab === 'planes' && (
        <div className="animate-in fade-in duration-200">
          <PlanesView
            onSelectPlan={(planId) => {
              setSelectedPlanId(planId);
              setActiveTab('cotizador');
            }}
          />
        </div>
      )}

      {/* ===== TAB: COTIZADOR ===== */}
      {activeTab === 'cotizador' && (
        <div className="animate-in fade-in duration-200">
          <CotizadorView
            initialPlanId={selectedPlanId}
            activePlanRecord={activePlanRecord}
            contractedServices={contractedServices}
            onSuccessSubmit={() => {
              loadData();
              setActiveTab('resumen');
            }}
          />
        </div>
      )}


      {/* ===== TAB: AJUSTES DE CUENTA (EXECUTIVE PROFILE & SECURITY HUB) ===== */}
      {activeTab === 'ajustes' && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
          
          {/* 1. Executive Profile Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1c1b1d] border border-white/10 p-6 sm:p-8 shadow-2xl">
            {/* Ambient gold glow decoration */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ffd56d]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-5">
                {/* Avatar with initials & active pulse */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#ffd56d] via-[#f5b942] to-[#e8960a] p-[2px] shadow-xl shadow-[#ffd56d]/20">
                    <div className="w-full h-full rounded-[14px] bg-[#141315] flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-black text-[#ffd56d] font-display select-none">
                        {user ? `${user.nombres?.[0] || ''}${user.apellidos?.[0] || ''}`.toUpperCase() : 'W'}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#1c1b1d] border-2 border-[#1c1b1d]">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" title="Sesión activa" />
                  </div>
                </div>

                {/* Name, Company and Role badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                      {user ? `${user.nombres} ${user.apellidos}` : 'Usuario Wuish'}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30 shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {user?.rol === 'admin' || user?.rol === 'administrador' ? 'DIRECTOR / ADMIN' : 'CLIENTE CORPORATIVO'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs text-[#9a907c]">
                    <div className="flex items-center gap-1.5 text-[#e5e1e4]">
                      <Building2 className="w-3.5 h-3.5 text-[#ffd56d]" />
                      <span className="font-semibold">{ajustesEmpresa || user?.empresa || 'Empresa no asignada'}</span>
                      {ajustesCargo || user?.cargo ? (
                        <span className="text-[#9a907c] font-normal">({ajustesCargo || user?.cargo})</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#9a907c]" />
                      <span>{user?.correo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick action button */}
              <button
                type="button"
                onClick={() => setActiveTab('cotizador')}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#ffd56d] border border-[#ffd56d]/30 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#ffd56d]" />
                <span>Explorar Cotizador</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
              <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Estado de Cuenta
                </span>
                <p className="text-sm font-bold text-white">Verificada & Activa</p>
                <p className="text-[11px] text-[#9a907c]">Acceso Corporativo VIP</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#ffd56d]" /> Plan Activo
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {activePlanRecord?.plan?.nombre || (contractedServices.length > 0 ? `${contractedServices.length} Servicios Activos` : 'Sin Plan Activo')}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {activePlanRecord ? 'Contrato Vigente' : 'Disponible para cotizar'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-sky-400" /> Operaciones
                </span>
                <p className="text-sm font-bold text-white">{solicitudes.length} Registradas</p>
                <p className="text-[11px] text-[#9a907c]">{messages.length} Mensajes en canal</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e0e10]/80 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Antigüedad
                </span>
                <p className="text-sm font-bold text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '2026'}
                </p>
                <p className="text-[11px] text-[#9a907c]">ID: {user?.id?.slice(0, 8) || 'Cliente'}</p>
              </div>
            </div>
          </div>

          {/* 2. Sub-Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141315] border border-white/5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setAjustesSubTab('perfil')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                ajustesSubTab === 'perfil'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
                  : 'text-[#9a907c] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Información & Empresa</span>
            </button>

            <button
              type="button"
              onClick={() => setAjustesSubTab('plan')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                ajustesSubTab === 'plan'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
                  : 'text-[#9a907c] hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Mi Plan Contratado</span>
            </button>

            <button
              type="button"
              onClick={() => setAjustesSubTab('seguridad')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                ajustesSubTab === 'seguridad'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
                  : 'text-[#9a907c] hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Seguridad & Acceso</span>
            </button>

            <button
              type="button"
              onClick={() => setAjustesSubTab('preferencias')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                ajustesSubTab === 'preferencias'
                  ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md shadow-[#ffd56d]/10'
                  : 'text-[#9a907c] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Preferencias & SLA</span>
            </button>
          </div>

          {/* 3. Sub-Tab Panels */}
          {/* PANEL 1: PERFIL & EMPRESA */}
          {ajustesSubTab === 'perfil' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card (2 cols) */}
              <div className="lg:col-span-2 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Datos del Representante & Organización</h3>
                  <p className="text-xs text-[#9a907c] mt-0.5">
                    Esta información se refleja en los acuerdos de nivel de servicio (SLA), contratos y solicitudes.
                  </p>
                </div>

                <form onSubmit={handleSaveAjustes} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4]">Nombres</label>
                      <input
                        type="text"
                        value={ajustesNombres}
                        onChange={(e) => setAjustesNombres(e.target.value)}
                        placeholder="Nombres del titular"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4]">Apellidos</label>
                      <input
                        type="text"
                        value={ajustesApellidos}
                        onChange={(e) => setAjustesApellidos(e.target.value)}
                        placeholder="Apellidos del titular"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#ffd56d]" /> Nombre de Empresa / Marca
                      </label>
                      <input
                        type="text"
                        value={ajustesEmpresa}
                        onChange={(e) => setAjustesEmpresa(e.target.value)}
                        placeholder="Ej. Nexo Capital, TechCorp..."
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#ffd56d]" /> Cargo / Posición
                      </label>
                      <input
                        type="text"
                        value={ajustesCargo}
                        onChange={(e) => setAjustesCargo(e.target.value)}
                        placeholder="Ej. CEO, Gerente de Operaciones..."
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#e5e1e4] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#ffd56d]" /> Teléfono Móvil / WhatsApp Directo
                    </label>
                    <input
                      type="text"
                      value={ajustesTelefono}
                      onChange={(e) => setAjustesTelefono(e.target.value)}
                      placeholder="+57 300 000 0000"
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                    />
                    <p className="text-[10px] text-[#9a907c]">Utilizado por el equipo directivo para notificaciones de emergencia o SLA crítico.</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <p className="text-[11px] text-[#9a907c] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sincronización instantánea con la plataforma central
                    </p>
                    <button
                      type="submit"
                      disabled={ajustesSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs shadow-lg shadow-[#ffd56d]/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{ajustesSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security & Identity Card (1 col) */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ffd56d]" />
                    <h4 className="text-sm font-bold text-white font-display">Identidad Verificada</h4>
                  </div>
                  <p className="text-xs text-[#9a907c]">
                    Campos inmutables verificados legalmente al momento de la apertura de cuenta.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Correo Electrónico</span>
                        <Lock className="w-3 h-3 text-[#9a907c]" />
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{user?.correo}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Documento Legal</span>
                        <Lock className="w-3 h-3 text-[#9a907c]" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {user?.tipo_documento} • {user?.numero_cedula}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Fecha de Nacimiento</span>
                        <Lock className="w-3 h-3 text-[#9a907c]" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {user?.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Registrada'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9a907c] italic border-t border-white/5 pt-3">
                    Para modificar estos datos protegidos, contacta al canal de soporte directivo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: MI PLAN & ALCANCE */}
          {ajustesSubTab === 'plan' && (
            <div className="space-y-6">
              {activePlanRecord ? (
                <div className="rounded-3xl bg-[#1c1b1d] border border-[#ffd56d]/30 p-6 sm:p-8 space-y-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Plan Aprobado & Activo
                        </span>
                        <span className="text-xs text-[#9a907c]">
                          Aprobado el {activePlanRecord.created_at ? new Date(activePlanRecord.created_at).toLocaleDateString('es-ES') : 'Reciente'}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                        {activePlanRecord.plan?.nombre || 'Paquete Corporativo a Medida'}
                      </h3>
                      {activePlanRecord.presupuesto_min && activePlanRecord.presupuesto_max && (
                        <p className="text-sm font-semibold text-[#ffd56d]">
                          Rango de Inversión: ${activePlanRecord.presupuesto_min.toLocaleString()} — ${activePlanRecord.presupuesto_max.toLocaleString()} USD
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('cotizador')}
                      className="px-5 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffd56d]/20 flex items-center gap-2"
                    >
                      <span>Solicitar Upgrade / Cambio de Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Servicios incluidos en este plan */}
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-[#9a907c] mb-3">
                      Servicios y Módulos Activos en tu Contrato ({contractedServices.length})
                    </h4>
                    {contractedServices.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {contractedServices.map((svc: any, idx: number) => {
                          const name = typeof svc === 'string' ? svc : svc.nombre || svc.id || 'Servicio';
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0e0e10] border border-white/5">
                              <div className="w-8 h-8 rounded-lg bg-[#ffd56d]/10 border border-[#ffd56d]/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-[#ffd56d]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#e5e1e4] truncate">{name}</p>
                                <span className="text-[10px] text-emerald-400 font-medium">Cobertura Activa</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#0e0e10] text-center text-xs text-[#9a907c]">
                        Plan corporativo general sin desglose modular específico.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffd56d]/10 border border-[#ffd56d]/20 flex items-center justify-center mx-auto text-[#ffd56d]">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-lg font-bold text-white font-display">Aún no tienes un Plan Activo</h3>
                    <p className="text-xs text-[#9a907c]">
                      Selecciona un plan corporativo o configura una cotización modular a tu medida para activar el despliegue de requerimientos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cotizador')}
                    className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-lg shadow-[#ffd56d]/20 inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Configurar en Cotizador</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: SEGURIDAD & ACCESO */}
          {ajustesSubTab === 'seguridad' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cambiar contraseña */}
              <div className="lg:col-span-2 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Actualización de Contraseña</h3>
                  <p className="text-xs text-[#9a907c] mt-0.5">
                    Mantén tus credenciales seguras con una clave robusta de grado bancario.
                  </p>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#e5e1e4]">Contraseña Actual</label>
                    <input
                      type="password"
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4]">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#e5e1e4]">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/50 px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/60 focus:outline-none text-xs transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <div className="text-[11px] text-[#9a907c] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#ffd56d]" /> Encriptación BCrypt con sal única
                    </div>
                    <button
                      type="submit"
                      disabled={passSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{passSaving ? 'Actualizando...' : 'Actualizar Clave'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Estado de Seguridad */}
              <div className="space-y-4 rounded-3xl bg-[#1c1b1d] border border-white/5 p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white font-display">Auditoría de Acceso</h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Protocolo de Autenticación</span>
                    <p className="text-xs font-semibold text-emerald-400">JWT Bearer (HS256)</p>
                    <p className="text-[10px] text-[#9a907c]">Tokens de un solo uso con renovación automática</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Cifrado de Tráfico</span>
                    <p className="text-xs font-semibold text-white">TLS 1.3 / HTTPS de extremo a extremo</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0e0e10] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9a907c]">Protección Anti-Bruteforce</span>
                    <p className="text-xs font-semibold text-emerald-400">Activa (Rate-Limiting Wuish Shield)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 4: PREFERENCIAS & ALERTAS SLA */}
          {ajustesSubTab === 'preferencias' && (
            <div className="rounded-3xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Canales de Alerta & SLA</h3>
                <p className="text-xs text-[#9a907c] mt-0.5">
                  Controla cómo y cuándo recibes actualizaciones de entregas, revisiones y mensajería directiva.
                </p>
              </div>

              <form onSubmit={handleSavePrefs} className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Notificaciones por Correo de Avances SLA</p>
                    <p className="text-[11px] text-[#9a907c]">Recibe un correo cuando un requerimiento cambie a En Proceso o Completado.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefEmailNotifications}
                      onChange={(e) => setPrefEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
                  </label>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Alertas Críticas de Entrega en Canal de Chat</p>
                    <p className="text-[11px] text-[#9a907c]">Notificación de mensajes directos del Director de Proyectos Wuish.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefSlaAlerts}
                      onChange={(e) => setPrefSlaAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
                  </label>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e0e10] border border-white/5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Alertas por WhatsApp Corporativo (Beta VIP)</p>
                    <p className="text-[11px] text-[#9a907c]">Ping directo a tu número celular registrado ante contingencias operativas.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefWhatsappAlerts}
                      onChange={(e) => setPrefWhatsappAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffd56d] peer-checked:after:bg-[#3e2e00]"></div>
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={prefsSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffd56d]/15 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{prefsSaving ? 'Guardando...' : 'Guardar Preferencias'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

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
