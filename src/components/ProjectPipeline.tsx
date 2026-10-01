import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Search, Compass, PenTool, Rocket, BarChart3, RefreshCw, Check, Pause, Play } from 'lucide-react';

const STEP_DURATION = 1800;
const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { title: 'Analizar', icon: Search, tag: 'Semana 1', status: 'Diagnóstico', desc: 'Auditamos tu mercado, procesos y activos digitales.' },
  { title: 'Estrategizar', icon: Compass, tag: 'Semana 2', status: 'Planificación', desc: 'Definimos hoja de ruta, KPIs y prioridades.' },
  { title: 'Crear', icon: PenTool, tag: 'Semanas 3-4', status: 'Diseño', desc: 'Prototipos UI/UX, marca y piezas creativas.' },
  { title: 'Implementar', icon: Rocket, tag: 'Semanas 5-7', status: 'Desarrollo', desc: 'Construimos, integramos y lanzamos campañas.' },
  { title: 'Medir', icon: BarChart3, tag: 'En vivo', status: 'Producción', desc: 'Monitoreamos resultados en tiempo real.' },
  { title: 'Optimizar', icon: RefreshCw, tag: 'Continuo', status: 'Mejora continua', desc: 'Iteramos sobre datos para escalar la conversión.' },
];

const LAST = STEPS.length - 1;

export const ProjectPipeline: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-120px' });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const running = inView && !paused && !hovered;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_DURATION);
    return () => clearTimeout(id);
  }, [active, running]);

  const pct = (active / LAST) * 100;
  const progress = Math.round(((active + 1) / STEPS.length) * 100);
  const step = STEPS[active];
  const StepIcon = step.icon;

  return (
    <div ref={ref} className="relative">
      {/* Pista con nodos */}
      <div className="relative grid grid-cols-6">
        {/* Línea base y relleno, de centro del primer nodo al centro del último */}
        <div className="absolute top-5 sm:top-7 left-[8.33%] right-[8.33%] h-[3px] -translate-y-1/2 rounded-full bg-white/5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#aa8214] via-[#ffd56d] to-[#fff2c5] shadow-[0_0_16px_rgba(255,213,109,0.6)]"
            animate={{ width: `${pct}%` }}
            transition={{ duration: active === 0 ? 0.3 : 0.5, ease: EASE }}
          />
          {/* Cometa que viaja al nodo activo */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_20px_6px_rgba(255,213,109,0.8)]"
            animate={{ left: `${pct}%` }}
            transition={{ duration: active === 0 ? 0.3 : 0.5, ease: EASE }}
          />
        </div>

        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < active;
          const isActive = i === active;
          return (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isActive ? '#ffd56d' : done ? '#2a2412' : '#1c1b1d',
                  borderColor: isActive || done ? 'rgba(255,213,109,0.8)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#3e2e00' : done ? '#ffd56d' : '#9a907c',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center group-hover:border-[#ffd56d]/60"
              >
                {/* Onda expansiva al activarse */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key={`wave-${active}`}
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-[#ffd56d]"
                    />
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="pipeline-glow"
                    className="absolute -inset-2 rounded-3xl bg-[#ffd56d]/20 blur-md -z-10"
                  />
                )}

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={done ? 'done' : 'icon'}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.25 }}
                  >
                    {done ? <Check className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} /> : <Icon className="w-4 h-4 sm:w-6 sm:h-6" />}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              <div className="text-center">
                <div className={`text-[10px] font-bold font-mono ${isActive || done ? 'text-[#ffd56d]' : 'text-white/25'}`}>
                  0{i + 1}
                </div>
                <div
                  className={`hidden sm:block text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-white' : done ? 'text-[#d1c5af]' : 'text-[#9a907c]/60'
                  }`}
                >
                  {s.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel de estado de la etapa activa */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative mt-8 sm:mt-10 max-w-2xl mx-auto rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/20 overflow-hidden"
      >
        <div className="p-5 sm:p-7 pr-10 sm:pr-14 flex items-center gap-4 sm:gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex-1 flex items-center gap-5 min-w-0"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0.6 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className="hidden sm:flex w-16 h-16 shrink-0 rounded-2xl bg-[#ffd56d] text-[#3e2e00] items-center justify-center shadow-lg shadow-[#ffd56d]/20"
              >
                <StepIcon className="w-8 h-8" />
              </motion.div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffd56d] animate-pulse" />
                    {step.status}
                  </span>
                  <span className="text-[11px] text-[#9a907c] font-mono">{step.tag}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display mt-1.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#d1c5af] mt-1">{step.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Porcentaje total del proyecto */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#ffd56d"
                strokeWidth="6"
                strokeLinecap="round"
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={progress}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  className="text-sm sm:text-base font-black text-white font-display"
                >
                  {progress}%
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Temporizador de la etapa */}
        <div className="h-1 bg-white/5">
          <motion.div
            key={`${active}-${running}`}
            className="h-full origin-left bg-[#ffd56d]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: running ? 1 : 0 }}
            transition={{ duration: running ? STEP_DURATION / 1000 : 0, ease: 'linear' }}
          />
        </div>

        <button
          onClick={() => setPaused((p) => !p)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#9a907c] hover:text-white hover:bg-white/5 cursor-pointer"
          aria-label={paused ? 'Reanudar' : 'Pausar'}
        >
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
