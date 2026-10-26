import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    title: string,
    message?: string,
    type?: ToastType,
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 3; // Límite máximo de alertas visibles en pantalla al mismo tiempo
const DUPLICATE_COOLDOWN_MS = 2500; // Cooldown para alertas idénticas (evita spam de clicks)
const MIN_INTERVAL_COOLDOWN_MS = 350; // Intervalo mínimo entre cualquier alerta

// Configuración de paletas de color y estilos por razón/tipo de alerta
const TOAST_THEMES: Record<
  ToastType,
  {
    cardBg: string;
    border: string;
    shadow: string;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    titleColor: string;
    progressGradient: string;
    IconComponent: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    cardBg: 'bg-[#151714]/95',
    border: 'border-[#ffd56d]/35',
    shadow: 'shadow-[0_12px_40px_rgba(255,213,109,0.08)]',
    iconBg: 'bg-[#ffd56d]/15',
    iconBorder: 'border-[#ffd56d]/30',
    iconColor: 'text-[#ffd56d]',
    titleColor: 'text-[#ffd56d]',
    progressGradient: 'bg-gradient-to-r from-[#ffd56d] via-amber-300 to-[#ffe89e]',
    IconComponent: CheckCircle2,
  },
  error: {
    cardBg: 'bg-[#191012]/95',
    border: 'border-rose-500/35',
    shadow: 'shadow-[0_12px_40px_rgba(244,63,94,0.12)]',
    iconBg: 'bg-rose-500/15',
    iconBorder: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-300',
    progressGradient: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-400',
    IconComponent: AlertCircle,
  },
  warning: {
    cardBg: 'bg-[#19150f]/95',
    border: 'border-amber-500/40',
    shadow: 'shadow-[0_12px_40px_rgba(245,158,11,0.12)]',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/35',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    progressGradient: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300',
    IconComponent: AlertTriangle,
  },
  info: {
    cardBg: 'bg-[#0f141d]/95',
    border: 'border-sky-500/35',
    shadow: 'shadow-[0_12px_40px_rgba(14,165,233,0.12)]',
    iconBg: 'bg-sky-500/15',
    iconBorder: 'border-sky-500/30',
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
    progressGradient: 'bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-300',
    IconComponent: Info,
  },
};

// Tarjeta individual de Toast con barra de progreso
const ToastCard: React.FC<{
  toast: ToastItem;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const duration = toast.duration || 4500;
  const [progress, setProgress] = useState(100);
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;
  const Icon = theme.IconComponent;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 25);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl backdrop-blur-2xl border transition-all text-[#e5e1e4] ${theme.cardBg} ${theme.border} ${theme.shadow}`}
    >
      {/* Icon Capsule */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${theme.iconBg} ${theme.iconBorder} ${theme.iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <h5 className={`text-xs font-bold font-display tracking-wide ${theme.titleColor}`}>
          {toast.title}
        </h5>
        {toast.message && (
          <p className="text-[12px] text-zinc-300/90 mt-1 leading-relaxed font-sans">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-zinc-500 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/5 cursor-pointer"
        title="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Timer Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className={`h-full transition-all duration-75 ease-linear ${theme.progressGradient}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());
  const lastToastTimeRef = useRef<number>(0);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      type?: ToastType,
      duration: number = 4500
    ) => {
      const now = Date.now();

      // 1. Anti-spam global cooldown (flood protection): mínimo 350ms entre alertas
      if (now - lastToastTimeRef.current < MIN_INTERVAL_COOLDOWN_MS) {
        return;
      }

      // 2. Cooldown anti-spam de alertas idénticas (evita clicks seguidos al mismo botón)
      const duplicateKey = `${title.trim().toLowerCase()}_${(message || '').trim().toLowerCase()}`;
      const lastDuplicateTime = recentToastsRef.current.get(duplicateKey) || 0;
      if (now - lastDuplicateTime < DUPLICATE_COOLDOWN_MS) {
        return;
      }

      // Registra en el historial de cooldown
      lastToastTimeRef.current = now;
      recentToastsRef.current.set(duplicateKey, now);

      // Limpia claves viejas del mapa para que no crezca indefinidamente
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > DUPLICATE_COOLDOWN_MS * 2) {
          recentToastsRef.current.delete(key);
        }
      }

      // 3. Inferencia de tipo automática si no se suministra
      let resolvedType: ToastType = type || 'success';
      if (!type) {
        const lower = `${title} ${message || ''}`.toLowerCase();
        if (lower.includes('error') || lower.includes('falló') || lower.includes('incorrect') || lower.includes('denegad')) {
          resolvedType = 'error';
        } else if (lower.includes('advertencia') || lower.includes('alerta') || lower.includes('requerid') || lower.includes('atención') || lower.includes('inicia sesión')) {
          resolvedType = 'warning';
        } else if (lower.includes('info') || lower.includes('aviso') || lower.includes('legal') || lower.includes('privacidad')) {
          resolvedType = 'info';
        }
      }

      const id = `toast-${now}-${Math.random().toString(36).substr(2, 4)}`;

      // 4. Límite de toasts en pantalla: si supera MAX_TOASTS (3), recorta el más viejo
      setToasts((prev) => {
        const next = [...prev, { id, title, message, type: resolvedType, duration }];
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container: High z-index to stay above popups and modals */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


