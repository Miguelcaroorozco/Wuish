import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, MessageSquarePlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import { Carousel } from './Carousel';

const ROTATE_MS = 5500;
const MAX_CHARS = 280;

interface TestimonialsSectionProps {
  onRequireAuth: () => void;
}

const Stars: React.FC<{ value: number; animated?: boolean }> = ({ value, animated }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <motion.span
        key={n}
        initial={animated ? { scale: 0, rotate: -45 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: animated ? 0.2 + n * 0.06 : 0, type: 'spring', stiffness: 400, damping: 15 }}
      >
        <Star className={`w-4 h-4 ${n <= value ? 'fill-[#ffd56d] text-[#ffd56d]' : 'text-white/15'}`} />
      </motion.span>
    ))}
  </div>
);

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onRequireAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const { approvedTestimonials: items, testimonials, addTestimonial } = useContent();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');

  const openForm = () => {
    if (!isAuthenticated) {
      showToast('Inicia sesión', 'Necesitas una cuenta para dejar tu opinión.', 'info');
      onRequireAuth();
      return;
    }
    if (testimonials.some((t) => t.userId === user?.id)) {
      showToast('Ya dejaste tu opinión', '¡Gracias! Solo se permite un comentario por cuenta.', 'info');
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || text.trim().length < 10) {
      showToast('Comentario muy corto', 'Escribe al menos 10 caracteres.', 'error');
      return;
    }
    addTestimonial({ userId: user.id, name: user.name, company: user.company, rating, text: text.trim() });
    showToast('¡Gracias por tu opinión!', 'Se publicará cuando nuestro equipo la revise.', 'success');
    setShowForm(false);
    setText('');
    setRating(5);
  };

  return (
    <>
      <div className="relative">
        {items.length ? (
          <Carousel
            items={items}
            getKey={(t) => t.id}
            perView={{ base: 1, md: 2, lg: 3 }}
            autoplay={ROTATE_MS}
            ariaLabel="Testimonios"
            renderItem={(t) => (
              <figure className="relative w-full p-6 sm:p-8 rounded-3xl bg-[#1c1b1d] border border-white/5 hover:border-[#ffd56d]/20 transition-colors flex flex-col">
                <Quote className="absolute top-5 right-5 sm:top-6 sm:right-7 w-10 h-10 sm:w-14 sm:h-14 text-[#ffd56d]/10" />
                <Stars value={t.rating} />
                <blockquote className="mt-5 text-base sm:text-lg text-white leading-relaxed font-display flex-1">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/40 text-[#ffd56d] font-bold flex items-center justify-center">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    {t.company && <div className="text-xs text-[#9a907c]">{t.company}</div>}
                  </div>
                </figcaption>
              </figure>
            )}
          />
        ) : (
          <div className="max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl border border-dashed border-white/10 text-center">
            <Quote className="w-10 h-10 text-[#ffd56d]/40 mx-auto" />
            <p className="text-sm text-[#9a907c] mt-3">Sé el primero en contarnos cómo te fue.</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={openForm}
            className="px-6 py-3 rounded-xl bg-[#201f21] border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#2a2a2c]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Deja tu opinión
          </motion.button>
        </div>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
          >
            <motion.form
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="w-full max-w-md max-h-[92svh] overflow-y-auto p-5 sm:p-7 rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/30 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">¿Cómo te fue con nosotros?</h3>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[#9a907c] hover:text-white cursor-pointer" aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button
                    key={n}
                    type="button"
                    whileHover={{ scale: 1.25, rotate: 8 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(n)}
                    onClick={() => setRating(n)}
                    className="cursor-pointer"
                    aria-label={`${n} estrellas`}
                  >
                    <Star className={`w-8 h-8 transition-colors ${n <= (hoverRating || rating) ? 'fill-[#ffd56d] text-[#ffd56d]' : 'text-white/15'}`} />
                  </motion.button>
                ))}
              </div>

              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  rows={4}
                  placeholder="Cuéntanos tu experiencia..."
                  className="w-full p-4 rounded-xl bg-[#0e0e10] border border-white/10 focus:border-[#ffd56d]/50 outline-none text-sm text-white placeholder:text-[#9a907c] resize-none"
                />
                <div className={`text-right text-[11px] mt-1 ${text.length >= MAX_CHARS ? 'text-rose-400' : 'text-[#9a907c]'}`}>
                  {text.length}/{MAX_CHARS}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Enviar opinión
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
