import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useInView, useScroll, useTransform } from 'motion/react';
import {
  Rocket,
  ArrowRight,
  CheckCircle2,
  XCircle,
  UserPlus,
  Calculator,
  LayoutDashboard
} from 'lucide-react';
import { ProjectPipeline } from './ProjectPipeline';
import { PortfolioSection } from './PortfolioSection';
import { TestimonialsSection } from './TestimonialsSection';

import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

interface LandingViewProps {
  onNavigateToCotizador: () => void;
  onNavigateToAuth: () => void;
  onNavigateToPlanes: () => void;
  onRequireAuthForReview: () => void;
  onNavigateToPortal?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger = (delay = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

const ROTATING_WORDS = ['ideas', 'marcas', 'procesos', 'ventas'];

const SERVICES = [
  'Marketing Digital', 'Video 4K', 'Branding', 'Apps Móviles', 'CRM & ERP',
  'Automatización de Procesos', 'Dashboards BI', 'Desarrollo Web', 'Pauta Omnicanal',
];

const STATS = [
  { value: 120, suffix: '+', label: 'Proyectos' },
  { value: 98, suffix: '%', label: 'Retención' },
  { value: 3, suffix: 'x', label: 'ROI promedio' },
  { value: 72, suffix: 'h', label: 'Kickoff' },
];



const BEFORE_AFTER = [
  { before: 'Ventas manuales por chat', after: 'E-commerce conectado al ERP' },
  { before: 'Publicaciones sin estrategia', after: 'Campañas segmentadas con ROI' },
  { before: 'Excel desactualizado', after: 'Dashboard en tiempo real' },
];

/* ---------- Piezas pequeñas ---------- */

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: Math.max(25, Math.floor((width * height) / 18000)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
    }));

    let running = true;
    // Solo anima mientras el hero está en pantalla (ahorra CPU y batería en móvil)
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) {
        running = true;
        frame = requestAnimationFrame(render);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(canvas);

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
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
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd56d';
        ctx.fill();
      }
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const RotatingWord: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-flex justify-center min-w-[5.5ch] overflow-hidden align-bottom pb-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-gold-gradient"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const Counter: React.FC<{ to: number; suffix: string }> = ({ to, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const SectionTitle: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <motion.div variants={reveal} className="text-center mb-8 sm:mb-10">
    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd56d] font-display">{eyebrow}</span>
    <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-2 text-balance">{title}</h2>
  </motion.div>
);

/* ---------- Vista ---------- */

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateToCotizador,
  onNavigateToAuth,
  onNavigateToPlanes,
  onRequireAuthForReview,
  onNavigateToPortal,
}) => {
  const { isAuthenticated } = useAuth();
  const { stats } = useContent();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);


  const [withWuish, setWithWuish] = useState(true);

  const onboarding = [
    { icon: UserPlus, title: 'Crea tu cuenta', sub: 'En menos de un minuto', action: () => onNavigateToAuth() },
    { icon: Calculator, title: 'Cotiza tu proyecto', sub: 'Precio estimado al instante', action: onNavigateToCotizador },
    { icon: LayoutDashboard, title: 'Síguelo en tu panel', sub: 'Avances y chat con el equipo', action: () => onNavigateToAuth() },
  ];

  return (
    <div className="w-full pb-16 sm:pb-24 overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[80svh] sm:min-h-[88vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <ParticleCanvas />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] h-[200px] sm:w-[650px] sm:h-[320px] bg-[#ffd56d]/15 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          variants={stagger(0.12)}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div
            variants={reveal}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#1c1b1d]/80 border border-[#ffd56d]/30 mb-6 sm:mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#ffd56d] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-wider sm:tracking-widest text-[#ffd56d] font-display">
              Ideas · Estrategia · Horizontes
            </span>
          </motion.div>

          <motion.h1
            variants={reveal}
            className="text-[2.5rem] sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1]"
          >
            Convertimos tus <RotatingWord />
            <br />
            en <span className="text-[#ffd56d]">crecimiento</span>.
          </motion.h1>

          <motion.p variants={reveal} className="mt-6 text-base sm:text-lg text-[#d1c5af] max-w-xl font-light">
            Comunicación y tecnología a la medida de tu negocio.
          </motion.p>

          <motion.div variants={reveal} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (isAuthenticated) {
                  if (onNavigateToPortal) onNavigateToPortal();
                  else onNavigateToAuth();
                } else {
                  onNavigateToAuth();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#ffd56d]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              {isAuthenticated ? 'Ir a mi panel' : 'Empezar ahora'}
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE DE SERVICIOS */}
      <div className="relative py-4 sm:py-5 border-y border-white/5 bg-[#171618] overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex w-max gap-6 sm:gap-10"
        >
          {[...SERVICES, ...SERVICES].map((s, i) => (
            <span key={i} className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-display font-semibold text-[#d1c5af] whitespace-nowrap">
              {s}
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]/60" />
            </span>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-0 w-10 sm:w-24 bg-gradient-to-r from-[#171618] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-10 sm:w-24 bg-gradient-to-l from-[#171618] to-transparent pointer-events-none" />
      </div>

      {/* STATS */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-6"
      >
        {stats.map((s) => (
          <motion.div key={s.id || s.label} variants={reveal} className="text-center">
            <div className="text-4xl sm:text-5xl font-black font-display text-white">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-xs uppercase tracking-wider text-[#9a907c] mt-2">{s.label}</div>
          </motion.div>
        ))}
      </motion.section>



      {/* METODOLOGÍA: estados del proyecto */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24"
      >
        <SectionTitle eyebrow="Metodología" title="Así avanza tu proyecto" />
        <motion.div variants={reveal}>
          <ProjectPipeline />
        </motion.div>
      </motion.section>

      {/* PORTAFOLIO */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24"
      >
        <SectionTitle eyebrow="Portafolio" title="Proyectos en los que participamos" />
        <motion.div variants={reveal}>
          <PortfolioSection />
        </motion.div>
      </motion.section>

      {/* TESTIMONIOS */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24"
      >
        <SectionTitle eyebrow="Testimonios" title="Lo que dicen nuestros clientes" />
        <motion.div variants={reveal}>
          <TestimonialsSection onRequireAuth={onRequireAuthForReview} />
        </motion.div>
      </motion.section>

      {/* CTA FINAL */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden px-5 py-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#1c1b1d] to-[#0e0e10] border border-[#ffd56d]/30 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(255,213,109,0.08),transparent_30%)] pointer-events-none"
          />
          <h2 className="relative text-2xl sm:text-4xl font-extrabold text-white font-display">
            ¿Listo para crecer?
          </h2>
          <p className="relative text-sm text-[#d1c5af] mt-3">Diagnóstico inicial sin costo.</p>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (isAuthenticated) {
                  if (onNavigateToPortal) onNavigateToPortal();
                  else onNavigateToAuth();
                } else {
                  onNavigateToAuth();
                }
              }}
              className="px-8 py-3.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              {isAuthenticated ? 'Ir a mi panel' : 'Crear cuenta'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateToPlanes}
              className="px-8 py-3.5 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white border border-white/10 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver planes
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
