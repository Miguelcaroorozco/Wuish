import React, { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
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
  Megaphone,
  Network,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface LandingViewProps {
  onNavigateToCotizador: () => void;
  onNavigateToAuth: () => void;
  onNavigateToPlanes: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateToCotizador,
  onNavigateToAuth,
  onNavigateToPlanes
}) => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Ecosystem Canvas
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

    // Particle nodes
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

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 213, 109, ${0.4 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw & update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
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

  return (
    <div className="w-full space-y-20 pb-20 animate-in fade-in duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Interactive Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-b from-[#ffd56d]/15 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Horizon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1b1d]/80 border border-[#ffd56d]/30 mb-6 shadow-lg shadow-[#ffd56d]/5">
            <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-ping" />
            <span className="text-xs uppercase font-semibold tracking-widest text-[#ffd56d] font-display">
              WE UNITE IDEAS, STRATEGY &amp; HORIZONS
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1] max-w-4xl">
            Transformamos <span className="text-gold-gradient">ideas</span> en{' '}
            <span className="text-[#ffd56d]">crecimiento digital</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-[#d1c5af] max-w-3xl font-light leading-relaxed">
            Analizamos tu negocio con rigor analítico, diseñamos una estrategia omnicanal sólida y construimos las soluciones integradas de <strong className="text-white font-medium">comunicación y tecnología</strong> que tu empresa necesita para dominar su industria.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onNavigateToCotizador}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider transition transform hover:scale-105 shadow-xl shadow-[#ffd56d]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Cotizar Proyecto</span>
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
            ].map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.title}
                  onClick={() => showToast(`Pilar: ${chip.title}`, chip.sub, 'info')}
                  className="p-3.5 rounded-xl bg-[#1c1b1d]/70 hover:bg-[#201f21] border border-white/5 hover:border-[#ffd56d]/40 transition text-center cursor-pointer group"
                >
                  <Icon className="w-5 h-5 text-[#ffd56d] mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-white mt-1.5 font-display">{chip.title}</div>
                  <div className="text-[10px] text-[#9a907c] truncate">{chip.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MANIFIESTO SECTION */}
      <section className="py-16 border-y border-white/5 bg-[#171618] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
              El Manifiesto WUISH
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-3 leading-snug">
              “No te vendemos tecnología ni marketing. Analizamos tu negocio y construimos lo que necesitas para crecer.”
            </h2>
            <div className="w-20 h-1 bg-[#ffd56d] mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 hover:border-[#ffd56d]/30 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center text-[#ffd56d]">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Diagnóstico Profundo</h3>
              <p className="text-xs text-[#9a907c] leading-relaxed">
                Antes de escribir una sola línea de código o activar una pauta, auditamos tus procesos internos, cuellos de botella de conversión y márgenes.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#201f21] border border-[#ffd56d]/40 shadow-xl shadow-[#ffd56d]/5 space-y-3 transform md:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#ffd56d] flex items-center justify-center text-[#3e2e00]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Estrategia de Negocio</h3>
              <p className="text-xs text-[#d1c5af] leading-relaxed">
                Alineamos la ingeniería y los medios a metas comerciales tangibles: adquisición rentable, retención y automatización operativa.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#1c1b1d] border border-white/5 hover:border-[#ffd56d]/30 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center text-[#ffd56d]">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Solución a Medida</h3>
              <p className="text-xs text-[#9a907c] leading-relaxed">
                Desde un ERP personalizado hasta una narrativa en video 4K con pauta omnicanal. Creamos exactamente la pieza que le falta a tu engranaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METODOLOGÍA EN 6 ETAPAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Metodología Comprobada
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
            Nuestro Proceso en 6 Etapas
          </h2>
          <p className="text-xs sm:text-sm text-[#9a907c] mt-2">
            Un pipeline estricto de ingeniería y creatividad para asegurar entregas en tiempo y con impacto verificable.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { num: '01', title: 'ANALIZAR', sub: 'Auditoría de mercado y activos digitales', tag: 'Semana 1' },
            { num: '02', title: 'ESTRATEGIZAR', sub: 'Hoja de ruta arquitectónica y KPIs', tag: 'Semana 2' },
            { num: '03', title: 'CREAR', sub: 'Diseño UI/UX y prototipado interactivo', tag: 'Semanas 3-4' },
            { num: '04', title: 'IMPLEMENTAR', sub: 'Desarrollo en staging y pauta publicitaria', tag: 'Semanas 5-7' },
            { num: '05', title: 'MEDIR', sub: 'Pase a producción y telemetría analítica', tag: 'En vivo' },
            { num: '06', title: 'OPTIMIZAR', sub: 'Iteración continua basada en conversión', tag: 'Continuo' },
          ].map((st) => (
            <div
              key={st.num}
              className="p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 flex flex-col justify-between hover:-translate-y-1 transition duration-200"
            >
              <div>
                <span className="text-2xl font-black font-display text-[#ffd56d] opacity-75">{st.num}</span>
                <h3 className="text-sm font-bold text-white mt-2 font-display">{st.title}</h3>
                <p className="text-[11px] text-[#9a907c] mt-2 leading-relaxed">{st.sub}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-[#ffd56d] font-bold uppercase tracking-wider">
                {st.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DOS DIVISIONES: COMUNICACIONES Y SISTEMAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Nuestras Divisiones Principales
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
            Comunicaciones y Sistemas
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Division 1 */}
          <div className="p-8 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d] font-display">
                  DIVISIÓN CREATIVA
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-1">
                  Comunicaciones &amp; Branding
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center text-[#ffd56d]">
                <Megaphone className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-[#d1c5af] leading-relaxed">
              Posicionamos tu empresa en la mente de tus clientes ideales a través de narrativas estéticas, contenido que convierte y distribución de medios precisa.
            </p>

            <div className="space-y-2.5 text-xs text-[#d1c5af]">
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Marketing Digital &amp; Pauta Omnicanal (Meta, Google, LinkedIn)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Producción de Video Cinemático 4K &amp; Storytelling</span>
              </div>
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Identidad Visual, Manual de Marca &amp; Posicionamiento</span>
              </div>
            </div>
          </div>

          {/* Division 2 */}
          <div className="p-8 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffd56d] font-display">
                  DIVISIÓN TECNOLÓGICA
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-1">
                  Sistemas &amp; Software
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#201f21] flex items-center justify-center text-[#ffd56d]">
                <Network className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-[#d1c5af] leading-relaxed">
              Estructuramos la infraestructura digital que soporta tu operación: software a la medida, automatizaciones sin fricción y arquitecturas cloud escalables.
            </p>

            <div className="space-y-2.5 text-xs text-[#d1c5af]">
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Desarrollo Web Headless &amp; Apps Móviles Nativas (iOS/Android)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Software Administrativo, CRM &amp; ERP a Medida</span>
              </div>
              <div className="p-3 rounded-xl bg-[#201f21] flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0" />
                <span>Automatización de Procesos con IA &amp; Dashboards BI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CASO ANTES VS DESPUÉS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Caso Real de Transformación
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            Antes vs. Después con WUISH
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="p-7 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs font-display">
              <XCircle className="w-5 h-5" />
              <span>Operación Inicial (Sin Ecosistema)</span>
            </div>
            <ul className="space-y-3 text-xs text-[#d1c5af]">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Ventas informales gestionadas manualmente por chat, pedidos perdidos y respuestas tardías.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Publicaciones aisladas sin narrativa de autoridad ni atribución de retorno publicitario.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Hojas de cálculo desactualizadas para stock con errores humanos frecuentes.</span>
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-2xl bg-[#201f21] border border-[#ffd56d]/50 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#ffd56d] font-bold uppercase tracking-wider text-xs font-display">
              <CheckCircle2 className="w-5 h-5" />
              <span>Con Ecosistema Integrado WUISH</span>
            </div>
            <ul className="space-y-3 text-xs text-white">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                <span>Portal e-commerce sincronizado con ERP que cobra automáticamente vía pasarela y despacha guías.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                <span>Estrategia de video branding de alto impacto con campañas hipersegmentadas de alto ticket.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffd56d] shrink-0 mt-0.5" />
                <span>Dashboard ejecutivo en tiempo real para monitorear rentabilidad neta desde el móvil.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 sm:p-12 rounded-3xl bg-gradient-to-b from-[#1c1b1d] to-[#0e0e10] border border-[#ffd56d]/30 shadow-2xl space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">
            Tu Próximo Nivel Corporativo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            ¿Listo para construir la infraestructura de tu crecimiento?
          </h2>
          <p className="text-xs sm:text-sm text-[#d1c5af] max-w-xl mx-auto leading-relaxed">
            Inicia una sesión de diagnóstico sin costo con nuestros directores de estrategia y tecnología.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onNavigateToCotizador}
              className="px-8 py-3.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              Configurar Cotización en Vivo
            </button>
            <button
              onClick={onNavigateToAuth}
              className="px-8 py-3.5 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
