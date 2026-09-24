import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { solicitudesApi, mensajesApi, usuariosApi } from '../lib/api';
import { ChatMessage } from '../types';
import {
  FolderKanban,
  Wallet,
  MessageSquareText,
  ShieldCheck,
  Calendar,
  Maximize2,
  CheckCircle2,
  Clock,
  Send,
  PhoneCall,
  CalendarPlus,
  FileSpreadsheet,
  PlusCircle,
  Video,
  FileCode,
  Calculator,
  Headphones,
  Check,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Settings,
  User,
  Phone,
  Save,
  RefreshCw,
  Tag
} from 'lucide-react';

type DashboardTab = 'resumen' | 'solicitudes' | 'mensajes' | 'cotizacion' | 'ajustes';

interface ClientDashboardProps {
  onNavigateToCotizador?: () => void;
  onOpenReport?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onNavigateToCotizador,
  onOpenReport
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DashboardTab>('resumen');
  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  
  // Roadmap Sprint Status
  const [sprintApproved, setSprintApproved] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(2);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Modals state
  const [showNewReqModal, setShowNewReqModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqType, setNewReqType] = useState('cotizacion');
  const [newReqDesc, setNewReqDesc] = useState('');

  // Ajustes state
  const [ajustesNombres, setAjustesNombres] = useState(user?.nombres || '');
  const [ajustesApellidos, setAjustesApellidos] = useState(user?.apellidos || '');
  const [ajustesTelefono, setAjustesTelefono] = useState(user?.telefono || '');
  const [ajustesSaving, setAjustesSaving] = useState(false);

  // Cotización embedded tab state
  const [cotizadorSubview, setCotizadorSubview] = useState<'planes' | 'cotizador'>('planes');


  // Load data from API and listen for custom events
  useEffect(() => {
    loadData();
    // Listen for HeaderNav's "Ajustes de Cuenta" click
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as DashboardTab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('wuish:openDashboardTab', handler);
    return () => window.removeEventListener('wuish:openDashboardTab', handler);
  }, []);



  const loadData = async () => {
    try {
      const [solData, msgData] = await Promise.allSettled([
        solicitudesApi.getMine(),
        mensajesApi.getMine(),
      ]);
      if (solData.status === 'fulfilled') setSolicitudes(solData.value);
      if (msgData.status === 'fulfilled') setMessages(msgData.value);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Filter requests
  const filteredSolicitudes = solicitudes.filter((item) => {
    if (filterStatus === 'Todas') return true;
    return item.estado === filterStatus;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const newMsg = await mensajesApi.send({
        contenido: chatInput,
        asunto: 'Mensaje desde dashboard',
      });
      setMessages((prev) => [newMsg, ...prev]);
      setChatInput('');
      showToast('Mensaje Enviado', 'Su mensaje ha sido enviado al equipo.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar el mensaje', 'error');
    }
  };

  const handleApproveSprint = () => {
    setSprintApproved(true);
    showToast('Sprint Aprobado', 'Se ha emitido el certificado de conformidad técnica.', 'success');
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

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-300">

      {/* ===== TAB NAVIGATION BAR ===== */}
      <div className="flex items-center gap-1 bg-[#1c1b1d] border border-white/5 rounded-xl p-1 overflow-x-auto">
        {([
          { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
          { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
          { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
          { id: 'cotizacion', label: 'Planes & Cotización', icon: CreditCard },
          { id: 'ajustes', label: 'Ajustes de Cuenta', icon: Settings },
        ] as { id: DashboardTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-[#ffd56d] text-[#3e2e00] shadow-sm'
                : 'text-[#d1c5af] hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ===== TAB: RESUMEN ===== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
      
      {/* 1. TOP GREETING BANNER (Exact match to Image 3) */}
      <div className="relative rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Subtle Ambient Gold Light */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#ffd56d]/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#353437]/80 border border-[#ffd56d]/30 text-xs font-semibold text-[#ffd56d]">
                <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
                {user?.tier || 'Cuenta Corporativa'}
              </span>
              <span className="text-xs font-mono text-[#9a907c] bg-[#131315] px-2.5 py-1 rounded border border-white/5">
                {user?.accountId || 'ACC-0000'}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e5e1e4] font-display tracking-tight">
                Hola, {user?.nombres || 'Usuario'}
              </h1>
              <p className="text-sm text-[#d1c5af] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {user?.rol && <span className="text-white font-medium">{user.rol}</span>}
                {user?.rol && user?.correo && <span className="text-[#9a907c]">—</span>}
                {user?.correo && <span className="text-[#ffd56d] font-medium">{user.correo}</span>}
                <span className="text-[#9a907c]">•</span>
                <span className="text-zinc-300">SLA Garantizado (100%)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (onOpenReport) onOpenReport();
                else showToast('Informe Mensual Generado', 'Descargando sumario ejecutivo de rendimiento y SLA.', 'info');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#2a2a2c] hover:bg-[#353437] text-white border border-white/10 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#ffd56d]" />
              <span>Informe Mensual</span>
            </button>

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

      {/* 2. FOUR EXECUTIVE KPI METRIC CARDS (Dynamic from real solicitudes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Operaciones Activas */}
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:border-[#ffd56d]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#9a907c] font-medium block">Operaciones Activas</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-display">
                  {solicitudes.length.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-[#ffd56d]">registradas</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-[#ffd56d] group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#d1c5af]">
            <span className="flex items-center gap-1 text-[#ffd56d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]" />
              {solicitudes.filter((s) => s.estado !== 'finalizada').length} en curso
            </span>
            <span className="text-[#9a907c]">Portal Wuish</span>
          </div>
        </div>

        {/* Card 2: Presupuesto Invertido */}
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:border-[#ffd56d]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#9a907c] font-medium block">Presupuesto en Solicitudes</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#ffd56d] font-display">
                  {solicitudes.length > 0
                    ? `$${solicitudes.reduce((acc, s) => {
                        const num = s.plan?.precio ? parseFloat(s.plan.precio) : 0;
                        return acc + num;
                      }, 0).toLocaleString()}`
                    : '$0'}
                </span>
                <span className="text-xs text-zinc-400 font-mono">USD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-[#ffd56d] group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#d1c5af]">
            <span className="text-[#9a907c]">{solicitudes.length} proyectos</span>
            <span className="text-[#ffd56d] font-semibold">100% auditado</span>
          </div>
        </div>

        {/* Card 3: Comunicaciones */}
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:border-[#ffd56d]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#9a907c] font-medium block">Comunicaciones</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-display">
                  {messages.length.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-[#ffd56d]">mensajes</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-[#ffd56d] group-hover:scale-105 transition-transform">
              <MessageSquareText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#d1c5af]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Canal Activo
            </span>
            <span className="text-[#9a907c]">Soporte Dedicado</span>
          </div>
        </div>

        {/* Card 4: Estado Global SLA */}
        <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:border-[#ffd56d]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#9a907c] font-medium block">Estado Global SLA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-400 font-display">
                  100%
                </span>
                <span className="text-xs text-emerald-400/80">Activo</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#d1c5af]">
            <span className="text-emerald-400">En tiempo y forma</span>
            <span className="text-[#9a907c]">Conformidad Total</span>
          </div>
        </div>
      </div>

      {/* 3. HORIZON IMPACT METHODOLOGY ROADMAP (Exact match to Image 3) */}
      <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <div className="text-[11px] font-semibold text-[#ffd56d] tracking-widest uppercase font-display mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]" />
              Metodología de Impacto Horizon • Sprint #08 / Release V2
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Ecosistema Digital Transaccional • Core Bancario &amp; Móvil
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#201f21] border border-white/5 text-xs text-[#d1c5af]">
              <Calendar className="w-4 h-4 text-[#ffd56d]" />
              <span>Hito Estimado: <strong className="text-white">28 May, 2025</strong></span>
            </div>
            <button
              onClick={() => showToast('Detalle Ampliado', 'Visualizando grafo de dependencias de la arquitectura Horizon.', 'info')}
              className="p-2 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#9a907c] hover:text-white transition"
              title="Expandir Roadmap"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Stage Pipeline Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Stage 01 */}
          <div
            onClick={() => setActiveStageIndex(0)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStageIndex === 0
                ? 'bg-[#2a2a2c] border-[#ffd56d]'
                : 'bg-[#201f21]/60 border-white/5 hover:bg-[#201f21]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#ffd56d]">01</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white font-display">Analizar</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Completado</div>
            <div className="text-[11px] text-[#9a907c] mt-2 line-clamp-2 leading-relaxed">
              Auditoría UX y Arquitectura de Datos
            </div>
          </div>

          {/* Stage 02 */}
          <div
            onClick={() => setActiveStageIndex(1)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStageIndex === 1
                ? 'bg-[#2a2a2c] border-[#ffd56d]'
                : 'bg-[#201f21]/60 border-white/5 hover:bg-[#201f21]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#ffd56d]">02</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white font-display">Estrategizar</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Completado</div>
            <div className="text-[11px] text-[#9a907c] mt-2 line-clamp-2 leading-relaxed">
              Blueprint Omnicanal &amp; Compliance
            </div>
          </div>

          {/* Stage 03 - Active */}
          <div
            onClick={() => setActiveStageIndex(2)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative shadow-lg ${
              activeStageIndex === 2
                ? 'bg-[#2a2a2c] border-[#ffd56d] shadow-[#ffd56d]/10'
                : 'bg-[#201f21] border-[#ffd56d]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#ffd56d]">03</span>
              <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-ping" />
            </div>
            <div className="text-sm font-bold text-white font-display">Crear •</div>
            <div className="text-[11px] text-[#ffd56d] font-semibold mt-0.5">En Progreso (70%)</div>
            <div className="text-[11px] text-[#d1c5af] mt-2 line-clamp-2 leading-relaxed">
              Desarrollo Frontend &amp; Microservicios
            </div>
          </div>

          {/* Stage 04 */}
          <div
            onClick={() => setActiveStageIndex(3)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStageIndex === 3
                ? 'bg-[#2a2a2c] border-[#ffd56d]'
                : 'bg-[#201f21]/40 border-white/5 hover:bg-[#201f21]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#9a907c]">04</span>
              <Clock className="w-4 h-4 text-[#9a907c]" />
            </div>
            <div className="text-sm font-bold text-zinc-300 font-display">Implementar</div>
            <div className="text-[11px] text-[#9a907c] font-medium mt-0.5">Pendiente</div>
            <div className="text-[11px] text-[#9a907c] mt-2 line-clamp-2 leading-relaxed">
              Despliegue Cloud &amp; Staging QA
            </div>
          </div>

          {/* Stage 05 */}
          <div
            onClick={() => setActiveStageIndex(4)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStageIndex === 4
                ? 'bg-[#2a2a2c] border-[#ffd56d]'
                : 'bg-[#201f21]/40 border-white/5 hover:bg-[#201f21]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#9a907c]">05</span>
              <Clock className="w-4 h-4 text-[#9a907c]" />
            </div>
            <div className="text-sm font-bold text-zinc-300 font-display">Medir</div>
            <div className="text-[11px] text-[#9a907c] font-medium mt-0.5">Pendiente</div>
            <div className="text-[11px] text-[#9a907c] mt-2 line-clamp-2 leading-relaxed">
              KPIs de Conversión &amp; Latencia
            </div>
          </div>

          {/* Stage 06 */}
          <div
            onClick={() => setActiveStageIndex(5)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStageIndex === 5
                ? 'bg-[#2a2a2c] border-[#ffd56d]'
                : 'bg-[#201f21]/40 border-white/5 hover:bg-[#201f21]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#9a907c]">06</span>
              <Clock className="w-4 h-4 text-[#9a907c]" />
            </div>
            <div className="text-sm font-bold text-zinc-300 font-display">Optimizar</div>
            <div className="text-[11px] text-[#9a907c] font-medium mt-0.5">Pendiente</div>
            <div className="text-[11px] text-[#9a907c] mt-2 line-clamp-2 leading-relaxed">
              Iteración Continua &amp; Escalabilidad
            </div>
          </div>
        </div>

        {/* Deliverable & Sprint Action Strip (Exact to Image 3) */}
        <div className="p-4 rounded-xl bg-[#201f21] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2a2a2c] flex items-center justify-center text-[#ffd56d]">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#9a907c] tracking-wider block">
                  Entregable Actual en Validación
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  V2.4 Arquitectura de Pagos Seguros
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2a2a2c] flex items-center justify-center text-rose-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#9a907c] tracking-wider block">
                  Próxima Sesión de Directorio
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Viernes, 16:00hs (Google Meet)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowChangelogModal(true)}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-[#2a2a2c] hover:bg-[#353437] text-white border border-white/10 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#ffd56d]" />
              <span>Ver Changelog Técnico</span>
            </button>

            <button
              onClick={handleApproveSprint}
              disabled={sprintApproved}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                sprintApproved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] shadow'
              }`}
            >
              {sprintApproved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sprint 08 Aprobado</span>
                </>
              ) : (
                <span>Aprobar Sprint 08</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN SECTION: Historial vs Assigned Strategist & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Col 8): Solicitudes e Historial */}
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

            {/* Filter Pills */}
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

          {/* Requests Table (Exact to Image 3) */}
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
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderKanban className="w-8 h-8 text-[#ffd56d]/60" />
                        <p className="text-sm font-semibold text-white">No hay requerimientos activos</p>
                        <p className="text-xs text-[#9a907c] max-w-sm">
                          Haz clic en &quot;Nueva Solicitud Estratégica&quot; o utiliza el Cotizador para configurar y activar tu primer proyecto.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSolicitudes.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#201f21]/70 transition-colors group cursor-pointer"
                      onClick={() => showToast(`Solicitud`, `${item.tipo} — ${item.descripcion || 'Sin descripción'}`)}
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

          {/* Table Pagination bar */}
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9a907c]">
            <span>Mostrando {filteredSolicitudes.length} de {solicitudes.length} operaciones históricas</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => showToast('Paginación', 'Página anterior')}
                className="px-3 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white transition"
              >
                Anterior
              </button>
              <button className="px-3 py-1 rounded-lg bg-[#ffd56d] text-[#3e2e00] font-bold shadow-sm">
                1
              </button>
              <button
                onClick={() => showToast('Paginación', 'Página 2 cargada')}
                className="px-3 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white transition"
              >
                2
              </button>
              <button
                onClick={() => showToast('Paginación', 'Página siguiente')}
                className="px-3 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#d1c5af] hover:text-white transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Col 4): Assigned Advisor & Live Chat Stream (Exact to Image 3) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Assigned Partner Profile Card */}
          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#ffd56d]/15 border border-[#ffd56d]/30 flex items-center justify-center text-[#ffd56d] font-black font-display text-lg shrink-0">
                W
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#ffd56d] tracking-widest block font-display">
                  Socio Estratégico Asignado
                </span>
                <h4 className="text-base font-bold text-white truncate font-display">
                  Mesa Estratégica WUISH
                </h4>
                <span className="text-xs text-[#9a907c] block">
                  Dirección de Estrategia &amp; Tecnología
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#201f21] border border-white/5">
                <span className="text-[10px] text-[#9a907c] block">Tiempo de Rta.</span>
                <span className="font-bold text-[#ffd56d] mt-0.5 block">&lt; 15 min</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#201f21] border border-white/5">
                <span className="text-[10px] text-[#9a907c] block">Canal Seguro</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">Encriptado E2E</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast('Llamada Segura', 'Conectando con la línea prioritaria de atención directa...', 'info')}
                className="py-2.5 px-3 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white border border-white/10 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#ffd56d]" />
                <span>Llamada Directa</span>
              </button>
              <button
                onClick={() => showToast('Agendar Sesión', 'Abriendo calendario ejecutivo para sesión de coordinación directiva...', 'info')}
                className="py-2.5 px-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Agendar Sesión</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Chat Console */}
          <div className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl flex flex-col h-[460px]">
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

            {/* Chat Messages Stream */}
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
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-[11px] ${msg.isMe ? 'text-[#ffd56d]' : 'text-zinc-300'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-[#9a907c]">{msg.time}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                        msg.isMe
                          ? 'bg-[#ffd56d] text-[#3e2e00] font-medium rounded-tr-none'
                          : 'bg-[#201f21] text-[#e5e1e4] border border-white/5 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
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

      {/* 5. THREE BOTTOM SHORTCUT CARDS (Exact match to Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Shortcut 1 */}
        <div
          onClick={onNavigateToCotizador}
          className="p-4 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] border border-white/5 hover:border-[#ffd56d]/30 transition-all flex items-center gap-4 cursor-pointer group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-[#201f21] group-hover:bg-[#ffd56d]/10 flex items-center justify-center text-[#ffd56d] transition-colors shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white group-hover:text-[#ffd56d] transition-colors flex items-center gap-1">
              Cotizador de Expansión
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#9a907c] truncate mt-0.5">
              Simula nuevos requerimientos tecnológicos y de pauta...
            </p>
          </div>
        </div>

        {/* Shortcut 2 */}
        <div
          onClick={() => showToast('Garantía Horizon', 'Certificación ISO 27001, SOC2 Tipo II y Acuerdos de Nivel de Servicio verificados.', 'info')}
          className="p-4 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] border border-white/5 hover:border-[#ffd56d]/30 transition-all flex items-center gap-4 cursor-pointer group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-[#201f21] group-hover:bg-[#ffd56d]/10 flex items-center justify-center text-[#ffd56d] transition-colors shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white group-hover:text-[#ffd56d] transition-colors flex items-center gap-1">
              Garantía Horizon &amp; Compliance
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#9a907c] truncate mt-0.5">
              Certificados ISO 27001 &amp; Acuerdos de Nivel de Servicio...
            </p>
          </div>
        </div>

        {/* Shortcut 3 */}
        <div
          onClick={() => showToast('Soporte Concierge 24/7', 'Mesa de operaciones disponible. Ticket prioritario generado.', 'info')}
          className="p-4 rounded-xl bg-[#1c1b1d] hover:bg-[#201f21] border border-white/5 hover:border-[#ffd56d]/30 transition-all flex items-center gap-4 cursor-pointer group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-[#201f21] group-hover:bg-[#ffd56d]/10 flex items-center justify-center text-[#ffd56d] transition-colors shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white group-hover:text-[#ffd56d] transition-colors flex items-center gap-1">
              Soporte Concierge 24/7
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#9a907c] truncate mt-0.5">
              Línea prioritaria con equipo de ingenieros dedicados...
            </p>
          </div>
        </div>
      </div>

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

              <div className="grid grid-cols-2 gap-3">
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
                    Prioridad
                  </label>
                  <select className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]">
                    <option>Alta (Sprint en curso)</option>
                    <option>Urgente (&lt; 48 horas)</option>
                    <option>Planificada (Próximo Release)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e5e1e4] mb-1">
                  Alcance y Especificaciones Técnicas
                </label>
                <textarea
                  rows={3}
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  placeholder="Describe la necesidad técnica, APIs a consultar o metas de negocio..."
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

      {/* Modal: Changelog Técnico */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-[#ffd56d]/30 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white font-display">
                Changelog Técnico • Release V2.4
              </h3>
              <button
                onClick={() => setShowChangelogModal(false)}
                className="text-[#9a907c] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#d1c5af] max-h-80 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                <div className="flex items-center justify-between text-[#ffd56d] font-semibold mb-1">
                  <span>Commit #9a84f • Staging Production</span>
                  <span className="text-[10px]">Ayer 18:20</span>
                </div>
                <p>Cifrado mTLS en microservicio de pagos y tokens transaccionales de doble factor.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                <div className="flex items-center justify-between text-white font-semibold mb-1">
                  <span>Commit #3b12c • Core iOS &amp; Next.js</span>
                  <span className="text-[10px]">10 May 2025</span>
                </div>
                <p>Reducción de latencia a 18ms en endpoints de balance y conciliación contable.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                <div className="flex items-center justify-between text-white font-semibold mb-1">
                  <span>Commit #f710a • Webhooks SAP ERP</span>
                  <span className="text-[10px]">06 May 2025</span>
                </div>
                <p>Sincronización bidireccional automática con reintentos exponenciales.</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowChangelogModal(false)}
                className="px-4 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}


      </div>
      )}


      {/* ===== TAB: SOLICITUDES ===== */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Solicitudes & Sugerencias</h2>
              <p className="text-xs text-[#9a907c] mt-0.5">Gestiona tus cotizaciones y solicitudes de servicio.</p>
            </div>
            <button
              onClick={() => setShowNewReqModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-[#ffdf97] transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nueva Solicitud
            </button>
          </div>

          {/* Filtro de estado */}
          <div className="flex gap-2 flex-wrap">
            {['Todas', 'pendiente', 'en_revision', 'aprobada', 'finalizada', 'rechazada'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilterStatus(estado)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer capitalize ${
                  filterStatus === estado
                    ? 'bg-[#ffd56d] text-[#3e2e00]'
                    : 'bg-[#1c1b1d] text-[#9a907c] border border-white/10 hover:text-white'
                }`}
              >
                {estado === 'Todas' ? 'Todas' : estado.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filteredSolicitudes.length === 0 ? (
            <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-12 text-center">
              <ClipboardList className="w-10 h-10 text-[#353437] mx-auto mb-3" />
              <p className="text-sm text-[#9a907c]">No hay solicitudes {filterStatus !== 'Todas' ? `con estado "${filterStatus}"` : 'registradas'}.</p>
              <button
                onClick={() => setShowNewReqModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97]"
              >
                Crear primera solicitud
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSolicitudes.map((sol) => (
                <div key={sol.id} className="p-4 rounded-xl bg-[#1c1b1d] border border-white/5 hover:border-[#ffd56d]/20 transition-all flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sol.estado === 'aprobada' ? 'bg-emerald-500/20 text-emerald-400' :
                        sol.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400' :
                        sol.estado === 'rechazada' ? 'bg-red-500/20 text-red-400' :
                        sol.estado === 'finalizada' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-[#353437] text-[#9a907c]'
                      }`}>
                        {sol.estado?.replace('_', ' ') || 'pendiente'}
                      </span>
                      <span className="text-[10px] text-[#9a907c] font-mono">{sol.tipo}</span>
                    </div>
                    <p className="text-sm text-[#e5e1e4] font-medium truncate">{sol.descripcion || 'Sin descripción'}</p>
                    <p className="text-[11px] text-[#9a907c] mt-0.5">{new Date(sol.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: MENSAJES ===== */}
      {activeTab === 'mensajes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Buzón de Mensajes</h2>
            <p className="text-xs text-[#9a907c] mt-0.5">Comunicación directa con el equipo WUISH.</p>
          </div>

          {/* Chat feed */}
          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col" style={{ minHeight: '420px' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#9a907c]">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">No hay mensajes aún. Inicia la conversación.</p>
                </div>
              ) : (
                [...messages].reverse().map((msg: any) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.remitente_id === 'system' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-[#353437] flex items-center justify-center text-[#ffd56d] text-xs font-bold shrink-0">
                      {msg.remitente_id === 'system' ? 'W' : (user?.nombres?.charAt(0) || 'U')}
                    </div>
                    <div className="max-w-[75%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-xs ${
                        msg.remitente_id === 'system'
                          ? 'bg-[#353437] text-[#d1c5af] rounded-tr-sm'
                          : 'bg-[#ffd56d]/10 border border-[#ffd56d]/20 text-[#e5e1e4] rounded-tl-sm'
                      }`}>
                        {msg.contenido}
                      </div>
                      <p className="text-[10px] text-[#9a907c] mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
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
          <div className="rounded-2xl bg-[#1c1b1d] border border-white/5 p-6 text-center">
            {cotizadorSubview === 'planes' ? (
              <div>
                <CreditCard className="w-10 h-10 text-[#ffd56d] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Planes Disponibles</h3>
                <p className="text-xs text-[#9a907c] mb-4">Explora los planes y servicios WUISH disponibles para tu organización.</p>
                <button
                  onClick={() => onNavigateToCotizador && onNavigateToCotizador()}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97] transition"
                >
                  Ver Planes Completos
                </button>
              </div>
            ) : (
              <div>
                <Calculator className="w-10 h-10 text-[#ffd56d] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Cotizador Inteligente</h3>
                <p className="text-xs text-[#9a907c] mb-4">Genera una cotización personalizada para tu proyecto.</p>
                <button
                  onClick={() => onNavigateToCotizador && onNavigateToCotizador()}
                  className="px-5 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97] transition"
                >
                  Abrir Cotizador
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
            {/* Info de solo lectura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider">Correo Corporativo</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-white/5 text-xs text-[#9a907c]">
                  <User className="w-4 h-4" />
                  <span>{user?.correo}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#9a907c] uppercase tracking-wider">Tipo de Documento</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0e0e10] border border-white/5 text-xs text-[#9a907c]">
                  <Tag className="w-4 h-4" />
                  <span>{user?.tipo_documento} — {user?.numero_cedula}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Formulario editable */}
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
                <label className="block text-xs font-semibold text-[#e5e1e4]">Teléfono / WhatsApp</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 w-4 h-4 text-[#9a907c] pointer-events-none" />
                  <input
                    type="tel"
                    value={ajustesTelefono}
                    onChange={(e) => setAjustesTelefono(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#ffd56d]/50 focus:outline-none text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={ajustesSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs cursor-pointer hover:bg-[#ffdf97] transition flex items-center gap-2 disabled:opacity-50"
                >
                  {ajustesSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {ajustesSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
