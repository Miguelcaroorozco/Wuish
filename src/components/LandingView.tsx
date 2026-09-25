import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { infoGeneralApi, comentariosApi, resultadosApi } from '../lib/api';
import {
  Lightbulb,
  Compass,
  Code2,
  BarChart3,
  Rocket,
  ShieldCheck,
  Stethoscope,
  Target,
  Boxes,
  Megaphone,
  Network,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Star,
  MessageSquare,
  Send,
  Quote,
  Activity,
  Award,
  TrendingUp,
  Check
} from 'lucide-react';

interface LandingViewProps {
  onNavigateToCotizador: () => void;
  onNavigateToAuth: () => void;
  onNavigateToPlanes: () => void;
}

const ETAPAS_PROCESO = [
  { num: '01', title: 'ANALIZAR', summary: 'Auditoría 360° de tus activos, procesos internos y márgenes comerciales.', tag: 'Semana 1', icon: Stethoscope, highlights: ['Diagnóstico sin costo', 'Auditoría de pauta', 'Cuellos de botella'] },
  { num: '02', title: 'ESTRATEGIZAR', summary: 'Arquitectura técnica, hoja de ruta ejecutiva y metas claras de facturación.', tag: 'Semana 2', icon: Compass, highlights: ['KPIs garantizados', 'Acuerdo NDA', 'Estructura modular'] },
  { num: '03', title: 'CREAR', summary: 'Diseño UI/UX de alta fidelidad, activos audiovisuales y manual de marca.', tag: 'Semanas 3-4', icon: Lightbulb, highlights: ['Prototipos en vivo', 'Identidad de autor', 'Narrativa en 4K'] },
  { num: '04', title: 'IMPLEMENTAR', summary: 'Desarrollo en staging, integraciones API seguras y activación de medios.', tag: 'Semanas 5-7', icon: Code2, highlights: ['Clean Code auditado', 'Pasarelas de pago', 'Pruebas de estrés'] },
  { num: '05', title: 'MEDIR', summary: 'Pase a producción formal con telemetría en tiempo real y dashboards BI.', tag: 'En Vivo', icon: BarChart3, highlights: ['Monitoreo 24/7', 'ROAS medido al centavo', 'Disponibilidad 99.9%'] },
  { num: '06', title: 'OPTIMIZAR', summary: 'Escalamiento continuo, automatización con IA y soporte directivo permanente.', tag: 'Continuo', icon: Rocket, highlights: ['Iteración por conversión', 'Agentes IA', 'SLA de respuesta'] },
];

const DEFAULT_RESULTADOS = [
  { metric: '+340%', label: 'ROAS Auditado', desc: 'Retorno sobre inversión publicitaria en campañas de alto ticket.', icon: TrendingUp, badge: 'Marketing & Pauta' },
  { metric: '99.98%', label: 'Uptime Cloud', desc: 'Disponibilidad de sistemas misión crítica y plataformas ERP.', icon: Activity, badge: 'Tecnología' },
  { metric: '< 48h', label: 'Despacho Técnico', desc: 'SLA de emisión de propuesta y análisis de factibilidad directiva.', icon: Clock, badge: 'Velocidad' },
  { metric: '25+', label: 'Empresas Escaladas', desc: 'Organizaciones transformadas con arquitectura unificada WUISH.', icon: Award, badge: 'Experiencia' },
];

const DEFAULT_TESTIMONIOS = [
  { id: 'def-1', nombres: 'Carlos Mendoza', cargo: 'CEO • Grupo Logístico Andino', contenido: 'La integración de nuestro ERP a medida y la automatización redujo en un 65% los errores de inventario. La ingeniería y la estética son incomparables.', calificacion: 5, fecha: 'Hace 2 semanas' },
  { id: 'def-2', nombres: 'Valentina Restrepo', cargo: 'Directora de Marca • Altair Fashion', contenido: 'El storytelling en video 4K y la pauta omnicanal triplicaron nuestro ticket promedio. Son verdaderos socios estratégicos.', calificacion: 5, fecha: 'Hace 1 mes' },
  { id: 'def-3', nombres: 'Esteban Morales', cargo: 'CTO • NovaPay Solutions', contenido: 'Cumplieron con el SLA de 48 horas para el diagnóstico y el software entregado superó todas nuestras expectativas de seguridad y velocidad.', calificacion: 5, fecha: 'Hace 3 semanas' },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateToCotizador,
  onNavigateToAuth,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cmsData, setCmsData] = useState<{ slogan?: string; manifesto?: string; mision?: string }>({});
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);

  // Comment Box State
  const [commentName, setCommentName] = useState(user?.nombres ? `${user.nombres} ${user.apellidos || ''}` : '');
  const [commentRole, setCommentRole] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState<number>(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    infoGeneralApi.getAll().then((data: any[]) => {
      if (Array.isArray(data)) {
        const find = (s: string) => data.find((i: any) => i.seccion === s)?.contenido;
        setCmsData({ slogan: find('slogan'), manifesto: find('manifesto'), mision: find('mision') });
      }
    }).catch(() => {});

    comentariosApi.getPublicos().then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) setComentarios(data);
    }).catch(() => {});

    resultadosApi.getAll().then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) setResultados(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.nombres && !commentName) {
      setCommentName(`${user.nombres} ${user.apellidos || ''}`.trim());
    }
  }, [user]);

  // Canvas particle engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.35 ? '#ffd56d' : '#e5b842'
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      showToast('Campo Requerido', 'Por favor escribe tu opinión antes de enviar.', 'error');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const fullContent = commentName.trim()
        ? `[${commentName.trim()}${commentRole.trim() ? ' • ' + commentRole.trim() : ''}] ${commentContent.trim()}`
        : commentContent.trim();

      await comentariosApi.create({
        contenido: fullContent,
        calificacion: commentRating,
      });

      setCommentContent('');
      setCommentRole('');
      showToast('Comentario Registrado', '¡Gracias! Tu comentario será publicado tras su aprobación.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar el comentario', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const displayComentarios = comentarios.length > 0 ? comentarios : DEFAULT_TESTIMONIOS;
  const displayResultados = resultados.length > 0 ? resultados : DEFAULT_RESULTADOS;

  return (
    <div className="w-full space-y-24 pb-20 animate-in fade-in duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-8 pb-16 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-b from-[#ffd56d]/15 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1b1d]/80 border border-[#ffd56d]/30 mb-6 shadow-lg shadow-[#ffd56d]/5">
            <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-ping" />
            <span className="text-xs uppercase font-semibold tracking-widest text-[#ffd56d] font-display">
              {cmsData.slogan || 'WE UNITE IDEAS, STRATEGY & HORIZONS'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1] max-w-4xl">
            Transformamos <span className="text-gold-gradient">ideas</span> en{' '}
            <span className="text-[#ffd56d]">crecimiento digital</span>.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#d1c5af] max-w-3xl font-medium leading-relaxed">
            {cmsData.manifesto || 'Analizamos tu negocio con rigor analítico, diseñamos una estrategia omnicanal sólida y construimos las soluciones de comunicación y software que tu empresa necesita para dominar su industria.'}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onNavigateToCotizador}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider transition transform hover:scale-105 shadow-xl shadow-[#ffd56d]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Cotizar Proyecto en Vivo</span>
            </button>

            <button
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#ffd56d]" />
              <span>Acceder al Ecosistema</span>
            </button>
          </div>

          {/* 5 Dynamic Pillar Chips */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-4xl">
            {[
              { title: 'Ideas', sub: 'Conceptualización', icon: Lightbulb },
              { title: 'Estrategia', sub: 'Arquitectura Comercial', icon: Compass },
              { title: 'Tecnología', sub: 'Software & Web', icon: Code2 },
              { title: 'Datos', sub: 'Business Intelligence', icon: BarChart3 },
              { title: 'Crecimiento', sub: 'Horizontes Reales', icon: Rocket },
            ].map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.title}
                  onClick={() => showToast(`Pilar: ${chip.title}`, chip.sub, 'info')}
                  className={`p-3.5 rounded-2xl bg-[#1c1b1d]/80 hover:bg-[#222125] border border-white/10 hover:border-[#ffd56d]/50 transition text-center cursor-pointer group shadow-md ${
                    idx === 2 ? 'ring-1 ring-[#ffd56d]/30' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#ffd56d] mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white mt-1.5 font-display">{chip.title}</div>
                  <div className="text-[10px] text-[#9a907c] truncate font-medium">{chip.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MANIFIESTO & DIAGNÓSTICO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto bg-gradient-to-b from-[#18171a] via-[#141316] to-[#18171a] border border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
              El Manifiesto WUISH
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white leading-snug">
              “No te vendemos tecnología aislada ni marketing vacío. <span className="text-[#ffd56d]">Auditamos tu negocio</span> y construimos lo que necesitas para dominar tu mercado.”
            </h2>
            <div className="w-20 h-1 bg-[#ffd56d] mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-[#1f1e22] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#2a292e] flex items-center justify-center text-[#ffd56d]">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">01. Diagnóstico Profundo</h3>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Auditamos procesos internos, márgenes netos y embudos antes de escribir una sola línea de código o activar campañas.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#242327] border-2 border-[#ffd56d]/60 shadow-2xl shadow-[#ffd56d]/10 space-y-3 transform md:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd56d] flex items-center justify-center text-[#3e2e00] shadow-md shadow-[#ffd56d]/30">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display">02. Estrategia Directiva</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffd56d]/20 text-[#ffd56d] uppercase font-mono">CORE</span>
              </div>
              <p className="text-sm font-medium text-white leading-relaxed">
                Ingeniería y medios alineados a metas financieras tangibles: adquisición rentable, reducción de costos y retención.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#1f1e22] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#2a292e] flex items-center justify-center text-[#ffd56d]">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">03. Solución a Medida</h3>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Desde un ERP a la medida hasta producción de marca 4K con pauta omnicanal. Desarrollamos la pieza exacta que acelera tu empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NUESTRO PROCESO EN 6 ETAPAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold font-display uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RUTA DE TRANSFORMACIÓN EN 6 ETAPAS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            El Caminito de Ejecución <span className="text-[#ffd56d]">WUISH</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#d1c5af] max-w-xl mx-auto">
            Un pipeline estricto donde cada etapa alimenta a la siguiente con resultados medibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ETAPAS_PROCESO.map((etapa) => {
            return (
              <div
                key={etapa.num}
                className="p-7 rounded-3xl bg-[#19181b] border border-white/10 hover:border-[#ffd56d]/60 shadow-xl transition flex flex-col justify-between hover:-translate-y-1.5 duration-200"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-[#ffd56d] text-[#3e2e00] font-black font-display text-lg flex items-center justify-center shadow-md">
                        {etapa.num}
                      </span>
                      <h3 className="text-base font-bold text-white font-display tracking-wide">
                        {etapa.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#2a292e] text-[#ffd56d] border border-white/5">
                      {etapa.tag}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-[#e5e1e4] leading-relaxed">
                    {etapa.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {etapa.highlights.map((h) => (
                      <span key={h} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#252429] text-zinc-300 border border-white/5 flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#ffd56d]" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RESULTADOS & TELEMETRÍA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#171618] via-[#1c1b1f] to-[#171618] border border-[#ffd56d]/30 shadow-2xl relative overflow-hidden space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
                Métricas Reales de Negocio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                Nuestros Resultados &amp; Telemetría
              </h2>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Datos cuantitativos de rendimiento auditados. Eficiencia operativa, retorno de capital y velocidad de respuesta garantizados.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#232226] border border-white/5 text-xs text-[#ffd56d] font-bold font-mono shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>TELEMETRÍA ACTIVA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayResultados.map((res, i) => {
              const Icon = res.icon || Award;
              const metricVal = res.metric || res.titulo || '100%';
              const labelVal = res.label || res.descripcion || 'Indicador Auditado';
              const badgeVal = res.badge || 'Verificado';

              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#141315]/90 border border-white/10 hover:border-[#ffd56d]/50 transition flex flex-col justify-between shadow-lg group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#201f23] flex items-center justify-center text-[#ffd56d]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#ffd56d]/15 text-[#ffd56d] uppercase">
                        {badgeVal}
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight group-hover:text-[#ffd56d] transition-colors">
                      {metricVal}
                    </div>

                    <div className="text-sm font-bold text-[#e5e1e4] mt-1 font-display">
                      {labelVal}
                    </div>
                  </div>

                  {res.desc && (
                    <p className="text-xs font-medium text-[#9a907c] mt-3 pt-3 border-t border-white/5 leading-relaxed">
                      {res.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DOS DIVISIONES: COMUNICACIONES Y SISTEMAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Capacidades de Vanguardia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
            Nuestras Divisiones Principales
          </h2>
          <p className="text-sm font-medium text-[#d1c5af] mt-2">
            Ingeniería de software de alta exigencia y creatividad audiovisual sinérgica bajo una misma dirección.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-8 sm:p-9 rounded-3xl bg-[#1a191d] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d] font-display">
                  DIVISIÓN CREATIVA
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-1">
                  Comunicaciones &amp; Branding
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#232226] flex items-center justify-center text-[#ffd56d] shadow-md">
                <Megaphone className="w-7 h-7" />
              </div>
            </div>

            <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
              Posicionamos tu organización en la mente del consumidor de alto ticket con narrativas estéticas, contenido que convierte y distribución publicitaria de alta precisión.
            </p>

            <div className="space-y-3 text-sm font-medium text-[#d1c5af]">
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Marketing &amp; Pauta:</strong> Meta, Google Ads y LinkedIn B2B con medición de ROAS.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Producción 4K:</strong> Brand films, spots comerciales y motion graphics 3D.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Identidad Visual:</strong> Tipografía, manual de marca y activos editoriales.</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-9 rounded-3xl bg-[#1a191d] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d] font-display">
                  DIVISIÓN TECNOLÓGICA
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-1">
                  Sistemas &amp; Software
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#232226] flex items-center justify-center text-[#ffd56d] shadow-md">
                <Network className="w-7 h-7" />
              </div>
            </div>

            <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
              Infraestructura tecnológica moderna para operar con velocidad: software a la medida, automatizaciones con IA y arquitecturas cloud de alta disponibilidad.
            </p>

            <div className="space-y-3 text-sm font-medium text-[#d1c5af]">
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Web &amp; Apps Móviles:</strong> Next.js, React, Flutter nativo offline-first.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">ERP &amp; CRM a Medida:</strong> Facturación, stock en tiempo real y roles RBAC.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Automatización con IA:</strong> Integración de modelos LLM y dashboards BI.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ANTES VS DESPUÉS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Caso Real de Transformación
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Antes vs. Después con WUISH
          </h2>
          <p className="text-sm font-medium text-[#9a907c]">
            La diferencia real entre operar con parches improvisados vs. una infraestructura digital unificada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold uppercase tracking-wider text-xs font-display">
              <XCircle className="w-5 h-5" />
              <span>Operación Inicial (Sin Ecosistema)</span>
            </div>
            <ul className="space-y-3.5 text-sm font-medium text-[#d1c5af]">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-base leading-none">•</span>
                <span>Ventas manuales por chat, pedidos perdidos y respuestas tardías sin pasarela automática.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-base leading-none">•</span>
                <span>Publicaciones aisladas sin autoridad de marca ni trazabilidad de retorno en pauta.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-base leading-none">•</span>
                <span>Hojas de cálculo desincronizadas para stock con frecuentes errores humanos y sobrecostos.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-[#201f23] border-2 border-[#ffd56d]/60 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#ffd56d] font-bold uppercase tracking-wider text-xs font-display">
              <CheckCircle2 className="w-5 h-5" />
              <span>Con Ecosistema Integrado WUISH</span>
            </div>
            <ul className="space-y-3.5 text-sm font-medium text-white">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Portal sincronizado con ERP:</strong> Cobro automático vía pasarela y facturación directa.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Storytelling en video 4K:</strong> Campañas orientadas a conversión con ROAS medible en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Dashboard gerencial:</strong> Monitoreo de rentabilidad neta, ventas y SLA desde cualquier dispositivo.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. COMENTARIOS & TESTIMONIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold font-display uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>VOZ DE NUESTRA COMUNIDAD &amp; CLIENTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Experiencias &amp; Sugerencias
          </h2>
          <p className="text-sm font-medium text-[#d1c5af]">
            Opiniones auditadas por nuestra administración. Deja tu comentario para enriquecer nuestro ecosistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a907c] font-display">
                TESTIMONIOS APROBADOS ({displayComentarios.length})
              </span>
              <span className="text-xs text-[#ffd56d] font-mono">CALIFICACIÓN: 5.0 ★</span>
            </div>

            <div className="space-y-4">
              {displayComentarios.map((c: any) => {
                const authorName = c.usuario
                  ? `${c.usuario.nombres} ${c.usuario.apellidos || ''}`.trim()
                  : c.nombres || 'Cliente Verificado';
                const authorCargo = c.cargo || 'Directivo';
                const calif = c.calificacion || 5;

                return (
                  <div key={c.id || Math.random()} className="p-6 rounded-2xl bg-[#1a191d] border border-white/5 shadow-md space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/30 text-[#ffd56d] font-bold text-sm flex items-center justify-center">
                          {authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white font-display">{authorName}</div>
                          <div className="text-[11px] text-[#9a907c]">{authorCargo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#ffd56d]">
                        {Array.from({ length: calif }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-[#ffd56d]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#d1c5af] leading-relaxed italic">
                      &quot;{c.contenido}&quot;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulario para dejar opinión */}
          <div className="lg:col-span-5 p-7 rounded-3xl bg-[#1c1b1f] border border-[#ffd56d]/30 shadow-2xl space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[#ffd56d] font-bold text-xs uppercase font-display">
                <Quote className="w-4 h-4" />
                <span>Publica tu Experiencia</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display mt-1">
                ¿Qué opinas de WUISH?
              </h3>
              <p className="text-xs text-[#9a907c] mt-0.5">
                Tu opinión será revisada por nuestro equipo antes de ser publicada.
              </p>
            </div>

            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#e5e1e4]">Calificación</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= commentRating
                            ? 'text-[#ffd56d] fill-[#ffd56d]'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#ffd56d] font-bold ml-2 font-mono">
                    {commentRating}/5
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Nombre</label>
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#e5e1e4]">Cargo / Empresa</label>
                  <input
                    type="text"
                    value={commentRole}
                    onChange={(e) => setCommentRole(e.target.value)}
                    placeholder="Ej. CEO • TechCorp"
                    className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#e5e1e4]">Comentario *</label>
                <textarea
                  rows={3}
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Comparte tu experiencia trabajando con nosotros..."
                  className="w-full bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c]/60 p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingComment}
                className="w-full py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingComment ? 'Enviando...' : 'Enviar para Aprobación'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
};
