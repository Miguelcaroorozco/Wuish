import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 } as const;
// Con menos tarjetas se repite la lista, así el salto de un extremo al otro ocurre fuera de vista
const MIN_SLOTS = 6;
const VISIBLE_RANGE = 2.5;

interface CoverflowCarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, active: boolean) => React.ReactNode;
  initialIndex?: number;
  /** Avance automático en ms; se pausa al pasar el mouse o al arrastrar. */
  autoplay?: number;
  ariaLabel?: string;
  /** Muestra flechas y puntos indicadores debajo del carrusel. */
  controls?: boolean;
}

export function CoverflowCarousel<T>({
  items,
  getKey,
  renderItem,
  initialIndex = 0,
  autoplay = 4000,
  ariaLabel = 'Carrusel',
  controls = false,
}: CoverflowCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState(1024);

  const count = items.length;
  const copies = count > 1 ? Math.ceil(MIN_SLOTS / count) : 1;
  const slots = Array.from({ length: count * copies }, (_, i) => ({ item: items[i % count], copy: Math.floor(i / count) }));
  const total = slots.length;
  const canSlide = count > 1;

  // Separación entre tarjetas según el ancho disponible
  const step = Math.min(210, Math.max(90, width * 0.22));

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!canSlide || !autoplay || hovered || dragging || reduceMotion) return;
    const id = setTimeout(() => setIndex((i) => i + 1), autoplay);
    return () => clearTimeout(id);
  }, [index, canSlide, autoplay, hovered, dragging, reduceMotion]);

  const offsetOf = (slot: number) => {
    let d = (((slot - index) % total) + total) % total;
    if (d > total / 2) d -= total;
    return d;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!canSlide) return;
    if (e.key === 'ArrowRight') setIndex((i) => i + 1);
    else if (e.key === 'ArrowLeft') setIndex((i) => i - 1);
  };

  const activeItem = count ? ((index % count) + count) % count : 0;
  // Lleva al elemento `target` por el camino más corto
  const goTo = (target: number) => {
    let d = target - activeItem;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    setIndex((i) => i + d);
  };

  const carousel = (
    <motion.div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      // Con controles, la pausa por hover la maneja el contenedor externo (incluye flechas y puntos)
      onMouseEnter={controls ? undefined : () => setHovered(true)}
      onMouseLeave={controls ? undefined : () => setHovered(false)}
      onPanStart={() => {
        if (!canSlide) return;
        dragged.current = true;
        setDragging(true);
      }}
      onPan={(_, info) => canSlide && setDragX(info.offset.x)}
      onPanEnd={(_, info) => {
        if (!canSlide) return;
        const swipe = info.offset.x + info.velocity.x * 0.15;
        let moved = Math.round(-swipe / step);
        if (moved === 0 && Math.abs(info.offset.x) > 40) moved = info.offset.x < 0 ? 1 : -1;
        setIndex((i) => i + moved);
        setDragX(0);
        setDragging(false);
        setTimeout(() => (dragged.current = false), 0);
      }}
      onClickCapture={(e) => {
        // Un arrastre no debe disparar el click de la tarjeta
        if (dragged.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      className={`relative grid place-items-center overflow-hidden py-8 outline-none select-none touch-pan-y ${
        canSlide ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {slots.map(({ item, copy }, slot) => {
        const pos = offsetOf(slot) + dragX / step;
        const dist = Math.abs(pos);
        const active = !dragging && offsetOf(slot) === 0;
        const hidden = dist > VISIBLE_RANGE;
        return (
          <motion.div
            key={`${getKey(item)}-${copy}`}
            aria-hidden={!active}
            initial={false}
            animate={{
              x: pos * step,
              scale: Math.max(0.6, 1 - dist * 0.14),
              opacity: hidden ? 0 : 1,
              filter: `brightness(${Math.max(0.35, 1 - dist * 0.35)})`,
            }}
            transition={dragging || reduceMotion ? { duration: 0 } : SPRING}
            style={{ zIndex: 100 - Math.round(dist * 10), gridArea: '1 / 1' }}
            onClick={() => {
              // Un click en una tarjeta lateral la trae al centro
              const d = offsetOf(slot);
              if (d !== 0) setIndex((i) => i + d);
            }}
            className={`w-[min(280px,78vw)] sm:w-[340px] h-full flex ${hidden ? 'pointer-events-none' : ''}`}
          >
            <div className={`w-full flex ${active ? '' : 'pointer-events-none'}`}>{renderItem(item, active)}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  if (!controls || !canSlide) return carousel;

  const arrowClass =
    'p-2.5 rounded-full bg-[#1c1b1d] border border-white/10 text-[#d1c5af] hover:text-[#3e2e00] hover:bg-[#ffd56d] hover:border-[#ffd56d] transition cursor-pointer';

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {carousel}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button type="button" onClick={() => setIndex((i) => i - 1)} aria-label="Anterior" className={arrowClass}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={getKey(item)}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al elemento ${i + 1}`}
              aria-current={i === activeItem}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === activeItem ? 'w-6 bg-[#ffd56d]' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <button type="button" onClick={() => setIndex((i) => i + 1)} aria-label="Siguiente" className={arrowClass}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
