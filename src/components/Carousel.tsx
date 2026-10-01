import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
type PerView = Partial<Record<Breakpoint, number>> & { base: number };

// Mismos cortes que Tailwind
const BREAKPOINTS: [Exclude<Breakpoint, 'base'>, number][] = [
  ['xl', 1280],
  ['lg', 1024],
  ['md', 768],
  ['sm', 640],
];

const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 } as const;

const resolvePerView = (perView: PerView) => {
  if (typeof window === 'undefined') return perView.base;
  for (const [bp, min] of BREAKPOINTS) {
    if (perView[bp] && window.innerWidth >= min) return perView[bp]!;
  }
  return perView.base;
};

interface CarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  perView?: PerView;
  gap?: number;
  /** Avance automático en ms; se pausa al pasar el mouse o enfocar. */
  autoplay?: number;
  ariaLabel?: string;
}

export function Carousel<T>({
  items,
  getKey,
  renderItem,
  perView: perViewConfig = { base: 1 },
  gap = 24,
  autoplay,
  ariaLabel = 'Carrusel',
}: CarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  const [width, setWidth] = useState(0);
  const [perView, setPerView] = useState(() => resolvePerView(perViewConfig));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = items.length;
  const visible = Math.min(perView, Math.max(count, 1));
  const maxIndex = Math.max(0, count - visible);
  const slideWidth = width ? (width - gap * (visible - 1)) / visible : 0;
  const step = slideWidth + gap;
  const canSlide = maxIndex > 0;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.clientWidth);
      setPerView(resolvePerView(perViewConfig));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perViewConfig.base, perViewConfig.sm, perViewConfig.md, perViewConfig.lg, perViewConfig.xl]);

  // Si cambia el número de tarjetas visibles o de items, mantener el índice dentro de rango
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const snapTo = useCallback(
    (i: number) => {
      const target = -i * step;
      if (reduceMotion) x.set(target);
      else animate(x, target, SPRING);
    },
    [step, reduceMotion, x],
  );

  useEffect(() => {
    snapTo(index);
  }, [index, snapTo]);

  const goTo = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, maxIndex))), [maxIndex]);
  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? maxIndex : i - 1)), [maxIndex]);

  useEffect(() => {
    if (!autoplay || !canSlide || paused || reduceMotion) return;
    const id = setTimeout(next, autoplay);
    return () => clearTimeout(id);
  }, [autoplay, canSlide, paused, reduceMotion, index, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  const showProgress = !!autoplay && canSlide && !reduceMotion;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="relative"
    >
      {/* El padding vertical evita recortar badges, sombras y elevaciones en hover */}
      <div ref={viewportRef} className="overflow-hidden -mx-1 px-1 pt-6 pb-4 -mt-6">
        <motion.div
          style={{ x, gap }}
          drag={canSlide ? 'x' : false}
          dragConstraints={{ left: -maxIndex * step, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;
            let moved = Math.round(-swipe / step);
            if (moved === 0 && Math.abs(info.offset.x) > 50) moved = info.offset.x < 0 ? 1 : -1;
            const target = Math.max(0, Math.min(index + moved, maxIndex));
            if (target === index) snapTo(index);
            else setIndex(target);
            setTimeout(() => (dragged.current = false), 0);
          }}
          onClickCapture={(e) => {
            // Un arrastre no debe disparar el click de la tarjeta
            if (dragged.current) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          className={`flex items-stretch ${canSlide ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''}`}
        >
          {items.map((item, i) => {
            const inView = i >= index && i < index + visible;
            return (
              <div
                key={getKey(item)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${count}`}
                aria-hidden={!inView}
                className="shrink-0 flex"
                style={{ width: slideWidth || `calc((100% - ${gap * (visible - 1)}px) / ${visible})` }}
              >
                <motion.div
                  className="w-full flex"
                  animate={{ opacity: inView ? 1 : 0.35, scale: inView ? 1 : 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  {renderItem(item, i)}
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {canSlide && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="p-2.5 rounded-full bg-[#1c1b1d] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/40 transition-colors cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-1.5 rounded-full bg-white/10 overflow-hidden cursor-pointer transition-all duration-300"
                  style={{ width: active ? 32 : 8 }}
                  aria-label={`Ir a la posición ${i + 1}`}
                  aria-current={active}
                >
                  {active && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute inset-0 origin-left bg-[#ffd56d]"
                      initial={{ scaleX: showProgress && !paused ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: showProgress && !paused ? autoplay! / 1000 : 0, ease: 'linear' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={next}
            className="p-2.5 rounded-full bg-[#1c1b1d] border border-white/5 text-[#d1c5af] hover:text-white hover:border-[#ffd56d]/40 transition-colors cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
