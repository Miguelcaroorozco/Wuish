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
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Megaphone,
  Network,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Star,
  MessageSquare,
  Send,
  Quote,
  Activity,
  Award,
  TrendingUp,
  Zap,
  Check,
  User,
  Sliders,
  Flag
} from 'lucide-react';

interface LandingViewProps {
  onNavigateToCotizador: () => void;
  onNavigateToAuth: () => void;
  onNavigateToPlanes: () => void;
}

interface EtapaProceso {
  num: string;
  title: string;
  summary: string;
  tag: string;
  icon: any;
  highlights: string[];
}

const ETAPAS_PROCESO: EtapaProceso[] = [
  {
    num: '01',
    title: 'ANALIZAR',
    summary: 'Auditoría 360° de tus activos, procesos internos y márgenes comerciales.',
    tag: 'Semana 1',
    icon: Stethoscope,
    highlights: ['Diagnóstico sin costo', 'Auditoría de pauta', 'Cuellos de botella']
  },
  {
    num: '02',
    title: 'ESTRATEGIZAR',
    summary: 'Arquitectura técnica, hoja de ruta ejecutiva y metas claras de facturación.',
    tag: 'Semana 2',
    icon: Compass,
    highlights: ['KPIs garantizados', 'Acuerdo NDA', 'Estructura modular']
  },
  {
    num: '03',
    title: 'CREAR',
    summary: 'Diseño UI/UX de alta fidelidad, activos audiovisuales y manual de marca.',
    tag: 'Semanas 3-4',
    icon: Lightbulb,
    highlights: ['Prototipos en vivo', 'Identidad de autor', 'Narrativa en 4K']
  },
  {
    num: '04',
    title: 'IMPLEMENTAR',
    summary: 'Desarrollo en staging, integraciones API seguras y activación de medios.',
    tag: 'Semanas 5-7',
    icon: Code2,
    highlights: ['Clean Code auditado', 'Pasarelas de pago', 'Pruebas de estrés']
  },
  {
    num: '05',
    title: 'MEDIR',
    summary: 'Pase a producción formal con telemetría en tiempo real y dashboards BI.',
    tag: 'En Vivo',
    icon: BarChart3,
    highlights: ['Monitoreo 24/7', 'ROAS medido al centavo', 'Disponibilidad 99.9%']
  },
  {
    num: '06',
    title: 'OPTIMIZAR',
    summary: 'Escalamiento continuo, automatización con IA y soporte directivo permanente.',
    tag: 'Continuo',
    icon: Rocket,
    highlights: ['Iteración por conversión', 'Agentes IA', 'SLA de respuesta']
  }
];

const DEFAULT_RESULTADOS = [
  {
    metric: '+340%',
    label: 'ROAS Auditado',
    desc: 'Retorno sobre inversión publicitaria en campañas de alto ticket.',
    icon: TrendingUp,
    badge: 'Marketing & Pauta'
  },
  {
    metric: '99.98%',
    label: 'Uptime Cloud',
    desc: 'Disponibilidad de sistemas misión crítica y plataformas ERP.',
    icon: Activity,
    badge: 'Tecnología'
  },
  {
    metric: '< 48h',
    label: 'Despacho Técnico',
    desc: 'SLA de emisión de propuesta y análisis de factibilidad directiva.',
    icon: Clock,
    badge: 'Velocidad'
  },
  {
    metric: '25+',
    label: 'Empresas Escaladas',
    desc: 'Organizaciones transformadas con arquitectura unificada WUISH.',
    icon: Award,
    badge: 'Experiencia'
  }
];

const DEFAULT_TESTIMONIOS = [
  {
    id: 'def-1',
    nombres: 'Carlos Mendoza',
    apellidos: 'Vásquez',
    cargo: 'CEO • Grupo Logístico Andino',
    contenido: 'La integración de nuestro ERP a medida y la automatización redujo en un 65% los errores de inventario. El nivel de ingeniería y la estética son incomparables.',
    calificacion: 5,
    fecha: 'Hace 2 semanas'
  },
  {
    id: 'def-2',
    nombres: 'Valentina Restrepo',
    apellidos: '',
    cargo: 'Directora de Marca • Altair Fashion',
    contenido: 'El storytelling en video 4K y la pauta omnicanal triplicaron nuestro ticket promedio. Son verdaderos socios estratégicos, no una agencia convencional.',
    calificacion: 5,
    fecha: 'Hace 1 mes'
  },
  {
    id: 'def-3',
    nombres: 'Esteban Morales',
    apellidos: '',
    cargo: 'CTO • NovaPay Solutions',
    contenido: 'Cumplieron con el SLA de 48 horas para el diagnóstico y el software entregado superó todas nuestras expectativas de seguridad y velocidad.',
    calificacion: 5,
    fecha: 'Hace 3 semanas'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateToCotizador,
  onNavigateToAuth,
  onNavigateToPlanes
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CMS & Dynamic Data
  const [cmsData, setCmsData] = useState<{ slogan?: string; manifesto?: string; mision?: string }>({});
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);

  // Interactive Comment Box State
  const [commentName, setCommentName] = useState(user?.nombres ? `${user.nombres} ${user.apellidos || ''}` : '');
  const [commentRole, setCommentRole] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    // 1. Info general CMS
    infoGeneralApi.getAll().then((data: any[]) => {
      if (Array.isArray(data)) {
        const find = (s: string) => data.find((i: any) => i.seccion === s)?.contenido;
        setCmsData({
          slogan: find('slogan'),
          manifesto: find('manifesto'),
          mision: find('mision'),
        });
      }
    }).catch(() => {});

    // 2. Comentarios públicos aprobados por admin
    comentariosApi.getPublicos().then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setComentarios(data);
      }
    }).catch(() => {});

    // 3. Resultados de impacto
    resultadosApi.getAll().then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setResultados(data);
      }
    }).catch(() => {});
  }, []);

  // Update commentName if user authenticates
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

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = Math.floor((width * height) / 18000);
    const nodes = Array.from({ length: Math.max(25, nodeCount) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.35 ? '#ffd56d' : '#e5b842'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = `rgba(255, 213, 109, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      showToast('Comentario Requerido', 'Por favor redacta tu reseña o sugerencia', 'error');
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
      showToast(
        'Comentario Registrado',
        '¡Gracias por tu opinión! Tu comentario será publicado en la página una vez aprobado por el administrador.',
        'success'
      );
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
      
      {/* ============================================================
          1. HERO SECTION (Fondo Canvas Preservado)
      ============================================================ */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 overflow-hidden px-4 sm:px-6 lg:px-8">
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
            {cmsData.manifesto || (
              <>
                Analizamos tu negocio con <strong className="text-white font-bold">rigor analítico</strong>, diseñamos una estrategia omnicanal sólida y construimos las soluciones integradas de <strong className="text-[#ffd56d] font-bold">comunicación y software</strong> que tu empresa necesita para dominar su industria.
              </>
            )}
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

          {/* 5 Dynamic Pillar Chips con formas y micro-animación */}
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

      {/* ============================================================
          2. MANIFIESTO & DIAGNÓSTICO (Fondo Sutil Neón Oscuro)
      ============================================================ */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto bg-gradient-to-b from-[#18171a] via-[#141316] to-[#18171a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
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
            {/* Card 1: Esquina Asimétrica */}
            <div className="p-8 rounded-3xl rounded-tr-none bg-[#1f1e22] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-3 shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[#2a292e] flex items-center justify-center text-[#ffd56d] group-hover:scale-105 transition">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">01. Diagnóstico Profundo</h3>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Auditamos <strong className="text-white">procesos internos, márgenes netos y embudos</strong> antes de escribir una sola línea de código o activar campañas.
              </p>
            </div>

            {/* Card 2: Destacada Central con Resplandor Dorado */}
            <div className="p-8 rounded-3xl bg-[#242327] border-2 border-[#ffd56d]/60 shadow-2xl shadow-[#ffd56d]/10 space-y-3 transform md:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd56d] flex items-center justify-center text-[#3e2e00] shadow-md shadow-[#ffd56d]/30">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display">02. Estrategia Directiva</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffd56d]/20 text-[#ffd56d] uppercase font-mono">CORE</span>
              </div>
              <p className="text-sm font-medium text-white leading-relaxed">
                Ingeniería y medios alineados a <strong className="text-[#ffd56d]">metas financieras tangibles</strong>: adquisición rentable, reducción de costos y retención recurrente.
              </p>
            </div>

            {/* Card 3: Esquina Invertida */}
            <div className="p-8 rounded-3xl rounded-tl-none bg-[#1f1e22] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-3 shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[#2a292e] flex items-center justify-center text-[#ffd56d] group-hover:scale-105 transition">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">03. Solución a Medida</h3>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Desde un <strong className="text-white">ERP a la medida</strong> hasta producción de marca 4K con pauta omnicanal. Desarrollamos la pieza exacta que acelera tu empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. NUESTRO PROCESO EN 6 ETAPAS — CAMINITO EN ZIGZAG
          (Diseñado para que la gente floja lo entienda en segundos)
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold font-display uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RUTA DE TRANSFORMACIÓN EN 6 ETAPAS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            El Caminito de Ejecución <span className="text-[#ffd56d]">WUISH</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#d1c5af] max-w-xl mx-auto">
            Sigue la trayectoria visual paso a paso: un pipeline estricto donde cada etapa alimenta a la siguiente sin fricción.
          </p>
        </div>

        {/* DESKTOP: SERPENTINE ZIGZAG FLOW (Row 1: 01 ➔ 02 ➔ 03, then curves down to Row 2: 06 ⇦ 05 ⇦ 04) */}
        <div className="hidden lg:block space-y-8 relative">
          
          {/* Fila 1 (Izquierda a Derecha: 01 ➔ 02 ➔ 03) */}
          <div className="grid grid-cols-3 gap-6 relative">
            {ETAPAS_PROCESO.slice(0, 3).map((etapa, idx) => {
              const Icon = etapa.icon;
              return (
                <div
                  key={etapa.num}
                  className="relative p-7 rounded-3xl bg-[#19181b] border border-white/10 hover:border-[#ffd56d]/60 shadow-xl transition group flex flex-col justify-between hover:-translate-y-1.5 duration-200"
                >
                  <div>
                    {/* Header del nodo con número y tag */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-[#ffd56d] text-[#3e2e00] font-black font-display text-lg flex items-center justify-center shadow-md shadow-[#ffd56d]/20">
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

                    {/* Mini Chips de Lectura Rápida */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {etapa.highlights.map((h) => (
                        <span key={h} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#252429] text-zinc-300 border border-white/5 flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#ffd56d]" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Conector Visual a la derecha para 01 y 02 */}
                  {idx < 2 && (
                    <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center font-bold shadow-lg shadow-[#ffd56d]/30 pointer-events-none animate-pulse">
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conector Curvo / Puente entre Fila 1 y Fila 2 en el extremo derecho */}
          <div className="flex justify-end pr-16 -my-2 relative z-10">
            <div className="flex items-center gap-3 bg-[#19181b] border border-[#ffd56d]/50 px-5 py-2.5 rounded-full shadow-xl">
              <span className="text-xs font-bold text-[#ffd56d] font-display uppercase tracking-wider">
                FASE DE INGENIERÍA &amp; ESCALA
              </span>
              <div className="w-6 h-6 rounded-full bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center animate-bounce">
                <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Fila 2 (Derecha a Izquierda: 04 ➔ 05 ➔ 06 con Meta Final) */}
          <div className="grid grid-cols-3 gap-6 relative">
            {/* Step 06: Grand Finale Card (Columna 1) */}
            <div className="relative p-7 rounded-3xl bg-gradient-to-br from-[#272115] via-[#1c1b1e] to-[#181719] border-2 border-[#ffd56d] shadow-2xl shadow-[#ffd56d]/15 flex flex-col justify-between hover:-translate-y-1.5 duration-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ffd56d]/20">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#ffd56d] text-[#3e2e00] font-black font-display text-lg flex items-center justify-center shadow-lg shadow-[#ffd56d]/30">
                      06
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white font-display tracking-wide">
                        OPTIMIZAR &amp; ESCALAR
                      </h3>
                      <span className="text-[10px] font-bold text-[#ffd56d] uppercase font-display flex items-center gap-1">
                        <Flag className="w-3 h-3" /> OBJETIVO CUMPLIDO
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#ffd56d] text-[#3e2e00]">
                    Continuo
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold text-white leading-relaxed">
                  Iteración continua orientada a <strong className="text-[#ffd56d]">maximizar facturación</strong>, automatización con agentes de IA y gobernanza directiva permanente.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ETAPAS_PROCESO[5].highlights.map((h) => (
                    <span key={h} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ffd56d]/20 text-[#ffd56d] border border-[#ffd56d]/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 05: MEDIR (Columna 2) */}
            <div className="relative p-7 rounded-3xl bg-[#19181b] border border-white/10 hover:border-[#ffd56d]/60 shadow-xl transition group flex flex-col justify-between hover:-translate-y-1.5 duration-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#ffd56d] text-[#3e2e00] font-black font-display text-lg flex items-center justify-center shadow-md">
                      05
                    </span>
                    <h3 className="text-base font-bold text-white font-display tracking-wide">
                      MEDIR &amp; ANALIZAR
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#2a292e] text-[#ffd56d]">
                    En Vivo
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-[#e5e1e4] leading-relaxed">
                  Pase a producción formal con <strong className="text-white font-bold">telemetría analítica en tiempo real</strong> y dashboards para gerencia.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ETAPAS_PROCESO[4].highlights.map((h) => (
                    <span key={h} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#252429] text-zinc-300 border border-white/5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#ffd56d]" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Flecha hacia la izquierda apuntando a 06 */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center font-bold shadow-lg shadow-[#ffd56d]/30 pointer-events-none animate-pulse">
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            {/* Step 04: IMPLEMENTAR (Columna 3) */}
            <div className="relative p-7 rounded-3xl bg-[#19181b] border border-white/10 hover:border-[#ffd56d]/60 shadow-xl transition group flex flex-col justify-between hover:-translate-y-1.5 duration-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#ffd56d] text-[#3e2e00] font-black font-display text-lg flex items-center justify-center shadow-md">
                      04
                    </span>
                    <h3 className="text-base font-bold text-white font-display tracking-wide">
                      IMPLEMENTAR
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#2a292e] text-[#ffd56d]">
                    Semanas 5-7
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-[#e5e1e4] leading-relaxed">
                  Desarrollo en <strong className="text-white font-bold">staging privado</strong>, conexión de pasarelas y encendido de campañas omnicanal.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ETAPAS_PROCESO[3].highlights.map((h) => (
                    <span key={h} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#252429] text-zinc-300 border border-white/5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#ffd56d]" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Flecha hacia la izquierda apuntando a 05 */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#ffd56d] text-[#3e2e00] flex items-center justify-center font-bold shadow-lg shadow-[#ffd56d]/30 pointer-events-none animate-pulse">
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

          </div>

        </div>

        {/* MOBILE & TABLET: CASCADING VERTICAL SERPENTINE TIMELINE */}
        <div className="block lg:hidden space-y-4">
          {ETAPAS_PROCESO.map((etapa, idx) => {
            return (
              <div
                key={etapa.num}
                className={`p-6 rounded-2xl bg-[#19181b] border ${
                  idx === 5 ? 'border-[#ffd56d] bg-[#221e16]' : 'border-white/10'
                } relative`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-black text-sm flex items-center justify-center font-display">
                      {etapa.num}
                    </span>
                    <h3 className="text-sm font-bold text-white font-display">
                      {etapa.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#ffd56d] font-bold">
                    {etapa.tag}
                  </span>
                </div>

                <p className="mt-3 text-xs font-medium text-[#d1c5af] leading-relaxed">
                  {etapa.summary}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {etapa.highlights.map((h) => (
                    <span key={h} className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#252429] text-zinc-300">
                      ✓ {h}
                    </span>
                  ))}
                </div>

                {idx < 5 && (
                  <div className="flex justify-center mt-3 -mb-2">
                    <ArrowDown className="w-4 h-4 text-[#ffd56d] animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          4. NUESTROS RESULTADOS & TELEMETRÍA (Editable por Administradores)
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#171618] via-[#1c1b1f] to-[#171618] border border-[#ffd56d]/30 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#ffd56d]/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 pb-6 border-b border-white/10">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
                Métricas Reales de Negocio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                Nuestros Resultados &amp; Telemetría
              </h2>
              <p className="text-sm font-medium text-[#d1c5af] leading-relaxed">
                Datos cuantitativos de rendimiento auditados. Eficiencia operativa, retorno de capital y velocidad de respuesta garantizados por contrato.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#232226] border border-white/5 text-xs text-[#ffd56d] font-bold font-mono shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>TELEMETRÍA ACTIVA</span>
            </div>
          </div>

          {/* Grid de 4 Métricas Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
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
                      <div className="w-10 h-10 rounded-xl bg-[#201f23] flex items-center justify-center text-[#ffd56d] group-hover:scale-110 transition">
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

      {/* ============================================================
          5. DOS DIVISIONES: COMUNICACIONES Y SISTEMAS (Formas Asimétricas)
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Capacidades de Vanguardia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
            Nuestras Divisiones Principales
          </h2>
          <p className="text-sm font-medium text-[#d1c5af] mt-2">
            Ingeniería de software de alta exigencia y creatividad audiovisual sinérgica bajo una misma dirección directiva.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* División Creativa: Esquina Curva Suave */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#1a191d] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />

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
              Posicionamos tu organización en la mente del consumidor de alto ticket con <strong className="text-white font-bold">narrativas estéticas, contenido que convierte</strong> y distribución publicitaria de alta precisión.
            </p>

            <div className="space-y-3 text-sm font-medium text-[#d1c5af]">
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Marketing &amp; Pauta Omnicanal:</strong> Meta, Google Ads y LinkedIn B2B con medición de ROAS.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Producción 4K Cinemática:</strong> Brand films, spots comerciales y motion graphics 3D.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Identidad Visual &amp; Manual de Marca:</strong> Tipografía, diseño gráfico y activos editoriales.</span>
              </div>
            </div>
          </div>

          {/* División Tecnológica: Esquina con Acento Neón */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#1a191d] border border-white/10 hover:border-[#ffd56d]/40 transition space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

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
              Infraestructura tecnológica moderna para operar con velocidad sin fallas: <strong className="text-white font-bold">software a la medida, automatizaciones con IA</strong> y arquitecturas cloud de alta disponibilidad.
            </p>

            <div className="space-y-3 text-sm font-medium text-[#d1c5af]">
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Desarrollo Web &amp; Apps Móviles:</strong> Next.js, React, Flutter nativo offline-first.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Software ERP &amp; CRM a Medida:</strong> Facturación, stock en tiempo real y roles RBAC.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#201f23] flex items-center gap-3 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0" />
                <span><strong className="text-white font-bold">Automatización con Inteligencia Artificial:</strong> Integración LLM, n8n y dashboards BI.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. CASO REAL: ANTES VS DESPUÉS CON WUISH
      ============================================================ */}
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
          {/* Antes: Caja Roja / Tono Precaución */}
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

          {/* Después: Caja Dorada / Ecosistema WUISH */}
          <div className="p-8 rounded-3xl bg-[#201f23] border-2 border-[#ffd56d]/60 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#ffd56d] font-bold uppercase tracking-wider text-xs font-display">
              <CheckCircle2 className="w-5 h-5" />
              <span>Con Ecosistema Integrado WUISH</span>
            </div>
            <ul className="space-y-3.5 text-sm font-medium text-white">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Portal sincronizado con ERP:</strong> Cobro automático vía pasarela, facturación y despacho de guías sin tocar un botón.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Storytelling en video 4K:</strong> Campañas hipersegmentadas orientadas a conversión con ROAS medible en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#ffd56d] shrink-0 mt-0.5" />
                <span><strong className="text-[#ffd56d]">Dashboard móvil gerencial:</strong> Monitoreo de rentabilidad neta, ventas y SLA desde cualquier dispositivo.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. COMENTARIOS, TESTIMONIOS & CAJA DE SUGERENCIAS
          (Filtrados por Admin + Caja para que cualquiera opine)
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold font-display uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>VOZ DE NUESTRA COMUNIDAD &amp; CLIENTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Experiencias &amp; Sugerencias Directivas
          </h2>
          <p className="text-sm font-medium text-[#d1c5af]">
            Opiniones auditadas por nuestra administración. Deja tu comentario o recomendación para enriquecer nuestro ecosistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lado Izquierdo: Lista de Comentarios Aprobados (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a907c] font-display">
                TESTIMONIOS APROBADOS ({displayComentarios.length})
              </span>
              <span className="text-xs text-[#ffd56d] font-mono">CALIFICACIÓN MEDIA: 5.0 ★</span>
            </div>

            <div className="space-y-4">
              {displayComentarios.map((c: any) => {
                const authorName = c.usuario
                  ? `${c.usuario.nombres} ${c.usuario.apellidos || ''}`.trim()
                  : c.nombres || 'Cliente Verificado';
                const authorCargo = c.cargo || 'Directivo';
                const calif = c.calificacion || 5;

                return (
                  <div
                    key={c.id}
                    className="p-6 rounded-3xl bg-[#1a191d] border border-white/10 hover:border-[#ffd56d]/40 transition shadow-lg space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30 flex items-center justify-center font-bold text-sm font-display">
                          {authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white font-display flex items-center gap-2">
                            {authorName}
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          </div>
                          <div className="text-xs font-medium text-[#9a907c]">{authorCargo}</div>
                        </div>
                      </div>

                      {/* Estrellas */}
                      <div className="flex items-center gap-1 text-[#ffd56d]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < calif ? 'fill-[#ffd56d] text-[#ffd56d]' : 'text-zinc-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-[#e5e1e4] leading-relaxed italic">
                      "{c.contenido.replace(/^\[.*?\]\s*/, '')}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado Derecho: Caja de Comentarios / Sugerencias (Col 5) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-7 rounded-3xl bg-[#1c1b1f] border-2 border-[#ffd56d]/40 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffd56d]/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffd56d] uppercase font-display tracking-wider mb-1">
                  <Quote className="w-4 h-4" />
                  <span>BUZÓN PÚBLICO DE SUGERENCIAS</span>
                </div>
                <h3 className="text-xl font-bold text-white font-display">
                  Deja tu Reseña o Sugerencia
                </h3>
                <p className="text-xs font-medium text-[#9a907c] mt-1">
                  Tu mensaje será evaluado por el administrador para mostrarse públicamente.
                </p>
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-4 text-xs font-medium">
                {/* Calificación Interactiva */}
                <div>
                  <label className="block text-[#d1c5af] font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Tu Calificación *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setCommentRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating || commentRating) >= star
                              ? 'fill-[#ffd56d] text-[#ffd56d]'
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#ffd56d] ml-2 font-mono">
                      {hoverRating || commentRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#d1c5af] font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Tu Nombre o Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Ej: Sofía Herrera • CEO Financia"
                    className="w-full bg-[#111012] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div>
                  <label className="block text-[#d1c5af] font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Cargo / Industria (Opcional)
                  </label>
                  <input
                    type="text"
                    value={commentRole}
                    onChange={(e) => setCommentRole(e.target.value)}
                    placeholder="Ej: E-commerce de Moda"
                    className="w-full bg-[#111012] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <div>
                  <label className="block text-[#d1c5af] font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Tu Comentario o Sugerencia *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Escribe tu experiencia con el ecosistema WUISH, ideas de mejora o sugerencias de desarrollo..."
                    className="w-full bg-[#111012] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="w-full py-3.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#ffd56d]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingComment ? 'Enviando...' : 'Publicar Comentario para Moderación'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          8. CALL TO ACTION FINAL
      ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#201f24] to-[#121214] border border-[#ffd56d]/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-[#ffd56d]/10 via-transparent to-transparent pointer-events-none" />

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Tu Próximo Nivel Corporativo
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display max-w-2xl mx-auto leading-tight">
            ¿Listo para construir la infraestructura de tu crecimiento?
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#d1c5af] max-w-xl mx-auto leading-relaxed">
            Inicia una sesión de diagnóstico sin costo con nuestros directores de estrategia y tecnología.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onNavigateToCotizador}
              className="px-9 py-4 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider transition shadow-xl shadow-[#ffd56d]/20 cursor-pointer transform hover:scale-105"
            >
              Configurar Cotización en Vivo
            </button>
            <button
              onClick={onNavigateToAuth}
              className="px-9 py-4 rounded-xl bg-[#2a292e] hover:bg-[#35343a] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
