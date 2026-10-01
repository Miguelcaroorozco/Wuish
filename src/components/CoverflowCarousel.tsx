import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
}

export function CoverflowCarousel<T>({
  items,
  getKey,
  renderItem,
  initialIndex = 0,
  autoplay = 4000,
  ariaLabel = 'Carrusel',
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

  return (
    <motion.div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
}
