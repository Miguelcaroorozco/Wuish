import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useContent } from '../context/ContentContext';
import { WuishLogo } from './WuishLogo';
import { LogOut, ChevronDown, ArrowLeft, LayoutDashboard, ShoppingCart, Settings, Layers } from 'lucide-react';
import { UserRole } from '../types';
import type { AuthTab, ViewMode } from '../App';

interface HeaderNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode, tab?: AuthTab) => void;
  onBack: () => void;
}

// Vistas secundarias: muestran "Volver" en lugar de navegación
const SECONDARY_VIEWS: ViewMode[] = ['planes', 'cotizador', 'auth'];

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Cliente',
  admin: 'Admin',
  consultant: 'Consultor',
};

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentView, onSelectView, onBack }) => {
  const { user, isAuthenticated, currentRole, switchRole, logout } = useAuth();
  const { cart } = useContent();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProfileMenu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showProfileMenu]);

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setShowProfileMenu(false);
    showToast('Rol cambiado', `Ahora navegas como ${ROLE_LABELS[role]}.`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0e0e10]/85 backdrop-blur-xl border-b border-white/10">
      <div className="h-16 sm:h-18 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <AnimatePresence initial={false}>
            {SECONDARY_VIEWS.includes(currentView) && (
              <motion.button
                key="back"
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                onClick={onBack}
                aria-label="Volver"
                className="flex items-center gap-1.5 pr-2 sm:pr-3 sm:mr-1 border-r border-white/10 text-xs font-semibold text-[#d1c5af] hover:text-white overflow-hidden whitespace-nowrap cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Volver</span>
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => onSelectView('landing')} className="cursor-pointer shrink-0">
            <span className="sm:hidden"><WuishLogo size="md" showSubtitle={false} /></span>
            <span className="hidden sm:block"><WuishLogo size="md" /></span>
          </motion.button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAuthenticated && (
            <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-[#1c1b1d] border border-white/10">
              <button
                onClick={() => onSelectView('planes')}
                aria-label="Planes"
                className={`px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${currentView === 'planes' ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md' : 'text-[#d1c5af] hover:bg-white/5 hover:text-white'}`}
              >
                <Layers className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Planes</span>
              </button>
              <button
                onClick={() => onSelectView('cotizador')}
                aria-label="Cotizador"
                className={`relative px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${currentView === 'cotizador' ? 'bg-[#ffd56d] text-[#3e2e00] shadow-md' : 'text-[#d1c5af] hover:bg-white/5 hover:text-white'}`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cotizador</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 sm:static bg-[#ffd56d] text-[#3e2e00] rounded-full w-4 h-4 flex items-center justify-center text-[10px] sm:ml-1 ring-2 ring-[#1c1b1d] sm:ring-0">
                    {cart.length}
                  </span>
                )}
              </button>
            </nav>
          )}
          {isAuthenticated && currentView !== 'portal' && currentView !== 'admin' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectView(currentRole === 'admin' ? 'admin' : 'portal')}
              aria-label="Mi panel"
              className="px-2.5 sm:px-4 py-2 rounded-xl bg-[#ffd56d] text-[#3e2e00] text-xs font-bold hover:bg-[#ffdf97] shadow flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Mi panel</span>
            </motion.button>
          )}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-1.5 sm:gap-2.5 pl-1 sm:pl-1.5 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-[#1c1b1d] transition cursor-pointer group"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#ffd56d]/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/40 text-[#ffd56d] font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-[#e5e1e4]">{user.name}</span>
                  <span className="text-[10px] text-[#ffd56d]/80 mt-0.5">{ROLE_LABELS[currentRole]}</span>
                </div>
                <motion.span animate={{ rotate: showProfileMenu ? 180 : 0 }}>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9a907c]" />
                </motion.span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-[min(15rem,calc(100vw-1.5rem))] origin-top-right rounded-2xl bg-[#1c1b1d] border border-[#ffd56d]/25 shadow-2xl p-3 z-50"
                  >
                    <div className="px-2 pb-3 mb-2 border-b border-white/5">
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-[#9a907c] font-mono truncate">{user.email}</div>
                    </div>

                    {/* Selector de rol (modo demo) */}
                    <div className="px-2 text-[10px] uppercase tracking-wider text-[#9a907c] mb-1.5">Ver como</div>
                    <div className="flex p-1 mb-2 bg-[#0e0e10] rounded-lg text-[11px] font-semibold">
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`relative flex-1 py-1.5 rounded-md cursor-pointer ${currentRole === role ? 'text-[#3e2e00]' : 'text-[#d1c5af] hover:text-white'}`}
                        >
                          {currentRole === role && (
                            <motion.span layoutId="role-pill" className="absolute inset-0 rounded-md bg-[#ffd56d]" />
                          )}
                          <span className="relative z-10">{ROLE_LABELS[role]}</span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-2 mb-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSelectView('settings');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#d1c5af] hover:bg-white/5 hover:text-white transition flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        Ajustes de perfil
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        showToast('Sesión cerrada', 'Hasta pronto.');
                        onSelectView('landing');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => onSelectView('auth', 'login')}
                className="hidden sm:block px-4 py-2 rounded-xl text-xs font-semibold text-[#d1c5af] hover:text-white transition cursor-pointer"
              >
                Ingresar
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectView('auth', 'register')}
                className="px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap bg-[#ffd56d] text-[#3e2e00] text-xs font-bold hover:bg-[#ffdf97] transition shadow cursor-pointer"
              >
                Crear cuenta
              </motion.button>
            </>
          )}
        </div>
      </div>

    </header>
  );
};
