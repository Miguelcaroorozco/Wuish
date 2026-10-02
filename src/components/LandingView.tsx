import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useInView } from 'motion/react';
import { Rocket } from 'lucide-react';
import { ProjectPipeline } from './ProjectPipeline';
import { PortfolioSection } from './PortfolioSection';
import { TestimonialsSection } from './TestimonialsSection';

import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { infoGeneralApi } from '../lib/api';

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





/* ---------- Piezas pequeñas ---------- */

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 30 a 42 partículas dinámicas: visible, llamativo y 100% fluido
    const nodeCount = Math.min(42, Math.max(22, Math.floor(width / 45)));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 1.8,
    }));

    let running = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let lastTime = 0;
    const render = (time: number) => {
      if (!running) return;
      if (time - lastTime < 16) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Conexiones doradas vivas y bien definidas
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 16900) { // 130px de radio de conexión
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(ni.x, ni.y);
            ctx.lineTo(nj.x, nj.y);
            ctx.strokeStyle = `rgba(255, 213, 109, ${0.6 * (1 - dist / 130)})`;
            ctx.stroke();
          }
        }
      }

      // Partículas con destello visible
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Punto central
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd56d';
        ctx.fill();

        // Resplandor exterior en partículas
        if (n.size > 2.6) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 213, 109, 0.22)';
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(render);
    };

    let scrollTimeout: any;
    const handleScroll = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        running = true;
        frame = requestAnimationFrame(render);
      }, 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    frame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      clearTimeout(scrollTimeout);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />;
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

  const [cms, setCms] = useState({
    slogan: 'Comunicación y tecnología a la medida de tu negocio.',
    vision: '',
    mision: '',
  });

  useEffect(() => {
    infoGeneralApi
      .getAll()
      .then((items) => {
        if (!Array.isArray(items)) return;
        const getSec = (k: string) => items.find((i: any) => i.seccion === k)?.contenido;
        const slogan = getSec('slogan');
        const vision = getSec('vision') || getSec('manifesto');
        const mision = getSec('mision');
        setCms({
          slogan: slogan || 'Comunicación y tecnología a la medida de tu negocio.',
          vision: vision || '',
          mision: mision || '',
        });
      })
      .catch(() => {});
  }, []);



  return (
    <div className="w-full pb-16 sm:pb-24 overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[80svh] sm:min-h-[88vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-90">
          <ParticleCanvas />
        </div>
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[360px] h-[240px] sm:w-[750px] sm:h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 213, 109, 0.22) 0%, rgba(255, 213, 109, 0.07) 50%, transparent 75%)',
          }}
        />

        <motion.div
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

          <motion.p variants={reveal} className="mt-6 text-base sm:text-lg text-[#d1c5af] max-w-2xl font-light">
            {cms.slogan}
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateToCotizador}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>Cotizar Proyecto</span>
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

      {/* CMS INSTITUCIONAL: VISIÓN & MISIÓN */}
      {(cms.vision || cms.mision) && (
        <motion.section
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cms.vision && (
              <motion.div
                variants={reveal}
                className="relative overflow-hidden p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#1c1b1d] to-[#121113] border border-[#ffd56d]/25 hover:border-[#ffd56d]/50 transition-all shadow-xl shadow-black/40 flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd56d]/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd56d]/10 border border-[#ffd56d]/30 text-[#ffd56d] text-[10px] font-bold uppercase tracking-widest font-display mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d] animate-pulse" />
                    Nuestra Visión
                  </div>
                  <p className="text-white text-base sm:text-lg leading-relaxed font-light font-display italic">
                    "{cms.vision}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#9a907c]">
                  <span>Wuish Visión</span>
                  <span className="text-[#ffd56d] font-bold">01</span>
                </div>
              </motion.div>
            )}

            {cms.mision && (
              <motion.div
                variants={reveal}
                className="relative overflow-hidden p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#1c1b1d] to-[#121113] border border-white/10 hover:border-[#ffd56d]/40 transition-all shadow-xl shadow-black/40 flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd56d]/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#d1c5af] text-[10px] font-bold uppercase tracking-widest font-display mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d]" />
                    Nuestra Misión
                  </div>
                  <p className="text-[#d1c5af] text-sm sm:text-base leading-relaxed">
                    {cms.mision}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#9a907c]">
                  <span>Wuish Propósito</span>
                  <span className="text-[#ffd56d] font-bold">02</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}



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
