import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Solicitud, ChatMessage } from '../types';
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
  ChevronRight
} from 'lucide-react';

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

  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => {
    try {
      const saved = localStorage.getItem('wuish_solicitudes_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Roadmap Sprint Status
  const [sprintApproved, setSprintApproved] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Step 3 "Crear" active

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('wuish_messages_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [chatInput, setChatInput] = useState('');

  // Modals state
  const [showNewReqModal, setShowNewReqModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqPlan, setNewReqPlan] = useState('Optimización & Escala');
  const [newReqDesc, setNewReqDesc] = useState('');

  // Filter requests
  const filteredSolicitudes = solicitudes.filter((item) => {
    if (filterStatus === 'Todas') return true;
    return item.status === filterStatus;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: user?.name || 'Cliente',
      role: user?.title || 'Director',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      localStorage.setItem('wuish_messages_v1', JSON.stringify(updated));
      return updated;
    });
    setChatInput('');
    showToast('Mensaje Enviado', 'Su mensaje ha sido remitido al canal de atención.', 'info');
  };

  const handleApproveSprint = () => {
    setSprintApproved(true);
    showToast('Sprint Aprobado', 'Se ha emitido el certificado de conformidad técnica.', 'success');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;

    const newCode = `#SOL-${Math.floor(7000 + Math.random() * 2900)}`;
    const newReq: Solicitud = {
      id: `sol-${Date.now()}`,
      code: newCode,
      title: newReqTitle,
      subtitle: newReqDesc || 'Requerimiento prioritario ingresado desde el portal',
      date: 'Hoy',
      plan: newReqPlan,
      status: 'En Revisión',
      assignedTo: 'Mesa Técnica WUISH',
      budget: '$2,400 USD'
    };

    setSolicitudes((prev) => {
      const updated = [newReq, ...prev];
      localStorage.setItem('wuish_solicitudes_v1', JSON.stringify(updated));
      return updated;
    });
    setShowNewReqModal(false);
    setNewReqTitle('');
    setNewReqDesc('');
    showToast('Solicitud Registrada', `Ticket ${newCode} asignado al equipo técnico para evaluación.`, 'success');
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-300">
      
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
                Hola, {user?.name || 'Usuario'}
              </h1>
              <p className="text-sm text-[#d1c5af] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {user?.title && <span className="text-white font-medium">{user.title}</span>}
                {user?.title && user?.company && <span className="text-[#9a907c]">—</span>}
                {user?.company && <span className="text-[#ffd56d] font-medium">{user.company}</span>}
                <span className="text-[#9a907c]">•</span>
                <span className="text-zinc-300">SLA Garantizado ({user?.sla || '100%'})</span>
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
              {solicitudes.filter((s) => s.status !== 'Finalizada').length} en curso
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
                        const num = parseInt((s.budget || '').replace(/[^0-9]/g, '')) || 0;
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
                  {user?.sla || '100%'}
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
                      onClick={() => showToast(`Detalle ${item.code}`, `${item.title} — Asignado a: ${item.assignedTo || 'Mesa Técnica'}`)}
                    >
                      <td className="py-4 pr-4 font-mono font-bold text-[#ffd56d]">
                        {item.code}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-white text-sm group-hover:text-[#ffd56d] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#9a907c] mt-0.5">
                          {item.subtitle}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-[#d1c5af] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2.5 py-1 rounded bg-[#201f21] border border-white/5 text-zinc-300 font-medium">
                          {item.plan}
                        </span>
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                            item.status === 'En Proceso'
                              ? 'bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30'
                              : item.status === 'En Revisión'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status}
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
                    Plan / Nivel *
                  </label>
                  <select
                    value={newReqPlan}
                    onChange={(e) => setNewReqPlan(e.target.value)}
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] px-3 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  >
                    <option value="Elite Scale">Elite Scale</option>
                    <option value="Growth Horizon">Growth Horizon</option>
                    <option value="Enterprise Custom">Enterprise Custom</option>
                    <option value="Digitalización Rápida">Digitalización Rápida</option>
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
  );
};
